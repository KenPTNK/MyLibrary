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
            <button onclick="window.location.href='${link}'">📖 Xem qua sách</button>
            <button>🛒 Mua ngay</button>
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
        if (newBalance < 0) {
          alert('Số dư tài khoản không đủ để thực hiện giao dịch.');
          return;
        }
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
document.querySelector('.buttons button:nth-child(2)').addEventListener('click', () => {
  if(!userData) {
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
    const amount = parseInt(price.replace(/[^0-9]/g, ''), 10);
    updateAccountBalance(amount);
    db.collection("username").get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.data().username === username) {
          const rentedBook = {
            name: title,
            price: price,
            address: address
          };
          db.collection("username")
            .doc(doc.id)
            .collection("rentedBooks")
            .add(rentedBook)
            .then(() => {
              console.log("Book saved to rentedBooks.");
            })
            .catch((error) => {
              console.error("Error saving rented book: ", error);
            });
        }
      });
    });
    alert('Cảm ơn bạn đã mua sách! Địa chỉ giao hàng của bạn là: ' + address);
  }
});

