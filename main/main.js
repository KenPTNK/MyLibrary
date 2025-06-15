// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAvPoKeKpI00sqgGrXaSj1VOVRvbcmjiJw",
    authDomain: "jsi-project-1f1ec.firebaseapp.com",
    projectId: "jsi-project-1f1ec",
    storageBucket: "jsi-project-1f1ec.firebasestorage.app",
    messagingSenderId: "193684500089",
    appId: "1:193684500089:web:2ac3efa24eb4c3b8136ea8",
    measurementId: "G-RWW299C69D"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

window.addEventListener("DOMContentLoaded", () => {
    const raw = localStorage.getItem("userData");
    if (raw) {
        const data = JSON.parse(raw);
        document.querySelector('.user-card').classList.remove('hidden');
        document.querySelector('.user-card').classList.add('flex');
        document.querySelector('.login-btn').classList.add('hidden');
        document.querySelector('.logout-btn').classList.remove('hidden');
        const username = document.getElementById('username');
        username.classList.remove('hidden');
        username.textContent = data.username;
        const avatar = document.getElementById('avatar');
        avatar.classList.remove('hidden');
        document.getElementById('avatar').src = data.url;
    }
});

function reload() {
    localStorage.removeItem("userData");
    firebase.auth().signOut().then(() => {
        alert("Đã đăng xuất!");
        location.reload(); // Reload lại trang để reset UI
    }).catch((error) => {
        console.error("Lỗi khi đăng xuất:", error);
        alert("Có lỗi khi đăng xuất!");
    });
}

// 
const key = 'AIzaSyCTsl-tX2E6HfwOwbIBUXP5a8YESez5akw';

function createBookDiv(title, author, price, imgSrc) {
    // Create the main book card div
    const bookCard = document.createElement('div');
    bookCard.classList.add('book-card');

    // Create and append the book image
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = "Bìa sách";
    bookCard.appendChild(img);

    // Create and append the title
    const bookTitle = document.createElement('h3');
    bookTitle.textContent = title;
    bookCard.appendChild(bookTitle);

    // Create and append the author
    const bookAuthor = document.createElement('p');
    bookAuthor.classList.add('author');
    bookAuthor.textContent = author;
    bookCard.appendChild(bookAuthor);

    // Create the footerBooks container
    const footer = document.createElement('div');
    footer.classList.add('footerBooks');

    // Create and append the price
    const bookPrice = document.createElement('p');
    bookPrice.classList.add('price');
    bookPrice.textContent = price;
    footer.appendChild(bookPrice);

    // Create and append the button
    const buyButton = document.createElement('button');
    buyButton.classList.add('buy-btn');
    buyButton.textContent = "Đọc Ngay";
    footer.appendChild(buyButton);

    // Append footerBooks to the card
    bookCard.appendChild(footer);

    // Finally, append to the grid
    const bookGrid = document.querySelector('.book-grid');
    bookGrid.appendChild(bookCard);
}

function formatNumberWithDots(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}


const find = document.getElementById('search-btn');
find.addEventListener('click', async function () {
    const bookgrid = document.querySelector('.book-grid');
    // Clear all existing book cards
    bookgrid.innerHTML = '';
    const title = document.getElementById('search-title').value.trim();
    const author = document.getElementById('search-author').value.trim();

    let query = '';
    if ((title) && !(author)) query += 'intitle:' + title;
    if ((author) && (title)) query += 'intitle:' + title + '+' + 'inauthor:' + author;
    if (!(title) && (author)) query += 'inauthor:' + author;
    if (!query) {
        alert("Hãy nhập tên sách hoặc tác giả để bắt đầu tìm kiếm.");
        return;
    }

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.totalItems === 0) {
            alert("Không tìm thấy sách nào.");
            return;
        }

        console.log("Kết quả tìm kiếm:", data.items); // For debug

        data.items.forEach(volume => {
            const title = volume.volumeInfo.title;
            let imgSrc = '';
            let author = ''
            let price = '';
            if (volume.volumeInfo.authors != null) {
                author = volume.volumeInfo.authors[0];
            } else {
                author = "Unknown"
            }
            if (volume.saleInfo.saleability == 'FREE') {
                price = 'Miễn Phí';
            } else if (volume.saleInfo.saleability == 'FOR_SALE') {
                price = formatNumberWithDots(volume.saleInfo.retailPrice.amount).toString() + ' ' + volume.saleInfo.retailPrice.currencyCode;
            } else {
                price = "Không có sẵn"
            }
            if (volume.volumeInfo.imageLinks != null) {
                imgSrc = volume.volumeInfo.imageLinks.thumbnail;
            } else {
                return;
            }
            createBookDiv(title, author, price, imgSrc);
        }
        )
    } catch (error) {
        console.error("Lỗi khi tìm kiếm sách:", error);
        alert("Đã xảy ra lỗi khi tìm kiếm.");
    }
})

// https://www.googleapis.com/books/v1/volumes?q=tên cái này là gọi theo tên điền cái tên vào là ra
// https://www.googleapis.com/books/v1/volumes/id cái này là gọi theo id 


