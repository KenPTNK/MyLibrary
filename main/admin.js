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

    // Append footerBooks to the card
    bookCard.appendChild(footer);

    // ✅ Create action buttons container (Edit/Delete)
    const actions = document.createElement('div');
    actions.classList.add('book-actions');

    // ✏️ Edit button with icon
    const editBtn = document.createElement('button');
    editBtn.classList.add('edit-btn');
    editBtn.dataset.id = index;
    editBtn.innerHTML = '<i class="far fa-edit"></i>';
    editBtn.addEventListener('click', function () {
        localStorage.setItem("editBookId", index);
        window.location.href = "edit.html";
    });

    // 🗑️ Delete button with icon
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.dataset.id = index;
    deleteBtn.innerHTML = '<i class="far fa-trash-alt"></i>';
    deleteBtn.addEventListener('click', function () {
        const confirmed = confirm("Bạn có chắc chắn muốn xoá sách này không?");

        if (confirmed) {
            db.collection("books").doc(index).delete()
                .then(() => {
                    alert("Xoá thành công sách");
                    window.location.reload();
                })
                .catch((error) => {
                    console.error("Error removing document: ", error);
                });
        } else {
            // Optional: add a message or log if the user cancels
            console.log("Hành động xoá đã bị huỷ.");
        }
    });

    // Append both buttons to actions container
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    // Append actions to book card
    bookCard.appendChild(actions);

    // Finally, append the book card to the grid
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
}).catch((error) => {
    console.error("Error getting documents:", error);
});
