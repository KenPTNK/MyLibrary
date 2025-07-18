function formatNumberWithDots(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// check if login or not, if login then show account balance
const userData = localStorage.getItem('userData');
if (userData) {
  const taikhoan = document.querySelector('.sodutaikhoan');
  taikhoan.classList.remove('hidden');
}

// lấy tiền từ firestore
const username = localStorage.getItem("userData") ? JSON.parse(localStorage.getItem("userData")).username : '';
db.collection("username").get().then((querySnapshot) => {
  querySnapshot.forEach((doc) => {
    if (doc.data().username === username) {
      const balance = doc.data().balance || 0;
      document.getElementById('account-balance').textContent = formatNumberWithDots(balance) + " VND";
    }
  });
});

const data = JSON.parse(localStorage.getItem("book"));
console.log(data);
// data.volumeInfo.title
// data.volumeInfo.authors[0]
// data.volumeInfo.imageLinks.thumbnail
// data.volumeInfo.description
// data.volumeInfo.saleInfo.saleability

function createProductPage({ title, author, imageURL, description, price, stock, link }) {
  const addressPlaceholder = "Nhập vào địa chỉ nhận hàng";
  const root = document.getElementById("product-root");

  root.innerHTML = `
    <div class="product-container">
      <div class="product-header">
        <div class="product-image">
          <img src="${imageURL}" alt="Ảnh sản phẩm">
        </div>
        <div class="product-details">
          <h1>${title}</h1>
          <p>Tác giả: ${author}</p>
          <p class="price">Giá: ${price}</p>
          <div class="buttons">
            <div class="quantity-box">
              <label for="quantity-input">Số lượng:</label>
              <input type="number" id="quantity-input" min="1" max="${stock}" value="1" style="width:60px;">
            </div>
            <button onclick="window.location.href='${link}'">📖 Xem qua sách</button>
            <button class="buy-btn">🛒 Mua ngay</button>
          </div>
          <div class="address-input">
            <label>Địa chỉ giao hàng:</label><br>
            <textarea placeholder="${addressPlaceholder}"></textarea>
          </div>
        </div>
      </div>
      <div class="description"><strong>Mô tả:</strong><br>${description}</div>
    </div>
  `;
}

let price = '';
if (data.saleInfo.saleability == 'FREE') {
  price = 'Miễn Phí';
} else if (data.saleInfo.saleability == 'FOR_SALE') {
  price = formatNumberWithDots(data.saleInfo.retailPrice.amount).toString() + ' ' + data.saleInfo.retailPrice.currencyCode;
} else {
  price = "Không có sẵn"
}

let title = data.volumeInfo.title;

let author = '';
if (data.volumeInfo.authors != null) {
  author = data.volumeInfo.authors[0];
} else {
  author = "Unknown";
}

createProductPage({
  title: title,
  author: author,
  imageURL: data.volumeInfo.imageLinks.thumbnail,
  description: data.volumeInfo.description,
  price: price,
  stock: 20,
  link: data.volumeInfo.previewLink
});

// update account balance when purchase is made
function updateAccountBalance(amount) {
  db.collection("username").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      if (doc.data().username === username) {
        const newBalance = doc.data().balance - amount;
        db.collection("username").doc(doc.id).update({
          balance: newBalance
        }).then(() => {
          document.getElementById('account-balance').textContent = formatNumberWithDots(newBalance) + " VND";
        }).catch((error) => {
          console.error("Error updating balance: ", error);
        });
      }
    });
  });
}

// Event listener for the "Mua ngay" button
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector('.buttons .buy-btn').addEventListener('click', () => {
    const parsedUser = userData ? JSON.parse(userData) : null;
    if (!parsedUser) {
      alert('Vui lòng đăng nhập để thực hiện giao dịch.');
      return;
    }
    const address = document.querySelector('.address-input textarea').value.trim();
    if (address === '') {
      alert('Vui lòng nhập địa chỉ giao hàng.');
      return;
    }

    if (price === 'Miễn Phí') {
      alert('Cảm ơn bạn đã chọn sách miễn phí!');

    } else if (price === 'Không có sẵn') {
      alert('Sách này hiện không có sẵn để mua.');
    } else {
      // check if user has enough balance
      const balanceText = document.getElementById('account-balance').textContent;
      const balance = parseInt(balanceText.replace(/[^0-9]/g, ''), 10);
      const quantity = parseInt(document.getElementById('quantity-input').value, 10);
      if (balance < parseInt(price.replace(/[^0-9]/g, ''), 10) * quantity) {
        alert('Số dư tài khoản không đủ để thực hiện giao dịch.');
        return;
      }
      const amount = parseInt(price.replace(/[^0-9]/g, ''), 10) * quantity;
      updateAccountBalance(amount);
      db.collection("username").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          if (doc.data().username === username) {
            // check if the user had used the same book?
            db.collection("username").doc(doc.id).collection("rentedBooks").get().then((rentedSnap) => {
              let duplicate = false;
              rentedSnap.forEach((rbDoc) => {
                const rb = rbDoc.data();
                if (rb.name === title && rb.price === price && rb.address == address) {
                  const newQuantity = rb.quantity + quantity; // cộng thêm số lượng mua
                  alert("Bạn đã mua sách này rồi. Số lượng đã được cập nhật.");
                  db.collection("username").doc(doc.id).collection("rentedBooks").doc(rbDoc.id).update({ quantity: newQuantity });
                  duplicate = true;
                }
              });
              if (!duplicate) {
                const rentedBook = {
                  name: title,
                  price: price,
                  address: address,
                  quantity: quantity,
                };
                db.collection("username").doc(doc.id).collection("rentedBooks").add(rentedBook).then(() => {
                  console.log("Book saved to rentedBooks.");
                })
                  .catch((error) => {
                    console.error("Error saving rented book: ", error);
                  });
              }
            });
          }
        });
      });
      alert('Cảm ơn bạn đã mua sách! Địa chỉ giao hàng của bạn là: ' + address);
    }
  });
});
