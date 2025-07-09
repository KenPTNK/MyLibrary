const data = JSON.parse(localStorage.getItem("book"));
console.log(data);
// data.volumeInfo.title
// data.volumeInfo.authors[0]
// data.volumeInfo.imageLinks.thumbnail
// data.volumeInfo.description
// data.volumeInfo.saleInfo.saleability

function formatNumberWithDots(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

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
            <button onclick="window.location.href='${link}'">📖 Đọc thử sách</button>
            <button onclick="alert('Đã thêm vào đơn hàng!')">🛒 Mua ngay</button>
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

