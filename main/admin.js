function createBookDiv(title, author, price, imgSrc, index) {
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
    buyButton.classList.add(index);
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

db.collection("books").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        if (doc.exists) {
            const data = doc.data().data;
            const title = data.volumeInfo.title;
            let imgSrc = '';
            let author = '';
            let price = '';
            if (data.volumeInfo.authors != null) {
                author = data.volumeInfo.authors[0];
            } else {
                author = "Unknown";
            }
            if (data.saleInfo.saleability == 'FREE') {
                price = 'Miễn Phí';
            } else if (data.saleInfo.saleability == 'FOR_SALE') {
                price = formatNumberWithDots(data.saleInfo.retailPrice.amount).toString() + ' ' + data.saleInfo.retailPrice.currencyCode;
            } else {
                price = "Không có sẵn";
            }
            if (data.volumeInfo.imageLinks != null) {
                imgSrc = data.volumeInfo.imageLinks.thumbnail;
            } else {
                return;
            }
            createBookDiv(title, author, price, imgSrc, doc.id);
        } else {
            console.log("No such document! " + doc.id);
        }
    });

    // Add event listeners for the dynamically created buttons
    querySnapshot.forEach((doc) => {
        let originalData = doc.data().data;
        let originalButton = document.getElementsByClassName(doc.id);
        Array.from(originalButton).forEach((button) => {
            button.addEventListener('click', function () {
                localStorage.setItem("book", JSON.stringify(originalData));
                window.location.href = "product.html";
            });
        });
    });
}).catch((error) => {
    console.error("Error getting documents:", error);
});