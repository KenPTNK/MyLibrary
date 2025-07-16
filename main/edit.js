function formatNumberWithDots(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function createProductPage({ title, author, imageURL, description, price, link }) {
    const root = document.getElementById("product-root");

    root.innerHTML = `
    <div class="product-container">
        <div class="product-header">
            <div class="product-image">
                <img src="${imageURL}" alt="Ảnh sản phẩm">
                <button id="imageURL" class="edit-icon" title="Chỉnh sửa ảnh">
                    <i class="far fa-edit"></i>
                </button>
            </div>
            <div class="product-details">
                <h1>
                    ${title}
                    <button id="title" class="edit-icon" title="Chỉnh sửa tiêu đề">
                        <i class="far fa-edit"></i>
                    </button>
                </h1>
                <p>
                    Tác giả: ${author}
                    <button id="author" class="edit-icon" title="Chỉnh sửa tác giả">
                        <i class="far fa-edit"></i>
                    </button>
                </p>
                <p class="price">
                    Giá: ${price}
                    <button id="price" class="edit-icon" title="Chỉnh sửa giá">
                        <i class="far fa-edit"></i>
                    </button>
                </p>
                <div class="buttons-edit">
                    <div class="buttons">
                        <button onclick="window.location.href='${link}'" class="link-button-with-edit">
                            📖 Link xem qua sách
                        </button>
                    </div>
                    <button id="link" class="edit-icon" title="Chỉnh sửa link">
                        <i class="far fa-edit"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="description">
            <strong>Mô tả:</strong><br>
            ${description}
            <button id="description" class="edit-icon" title="Chỉnh sửa mô tả">
                <i class="far fa-edit"></i>
            </button>
        </div>
    </div>
    `;
}

const docId = localStorage.getItem("editBookId");
console.log(docId);

db.collection("books").doc(docId).get().then((doc) => {
    if (doc.exists) {
        const data = doc.data().data;
        console.log(data);

        let price = '';
        if (data.saleInfo.saleability === 'FREE') {
            price = 'Miễn Phí';
        } else if (data.saleInfo.saleability === 'FOR_SALE') {
            price = formatNumberWithDots(data.saleInfo.retailPrice.amount) + ' ' + data.saleInfo.retailPrice.currencyCode;
        } else {
            price = "Không có sẵn";
        }

        let title = data.volumeInfo.title;
        let author = data.volumeInfo.authors ? data.volumeInfo.authors[0] : "Unknown";

        createProductPage({
            title,
            author,
            imageURL: data.volumeInfo.imageLinks.thumbnail,
            description: data.volumeInfo.description,
            price,
            link: data.volumeInfo.previewLink
        });

        const idName = ['imageURL', 'title', 'author', 'price', 'link', 'description'];
        idName.forEach(fieldId => {
            const button = document.getElementById(fieldId);
            if (!button) return;

            button.addEventListener('click', () => {
                let currentValue = '';
                if (fieldId === 'title') currentValue = title;
                else if (fieldId === 'author') currentValue = author;
                else if (fieldId === 'price') currentValue = price;
                else if (fieldId === 'link') currentValue = data.volumeInfo.previewLink;
                else if (fieldId === 'imageURL') currentValue = data.volumeInfo.imageLinks.thumbnail;
                else if (fieldId === 'description') currentValue = data.volumeInfo.description;

                // Open modal
                const modal = document.getElementById('edit-modal');
                const input = document.getElementById('modal-input');
                const modalTitle = document.getElementById('modal-title');
                modal.style.display = 'flex';
                modalTitle.textContent = `Chỉnh sửa ${fieldId}`;
                input.value = currentValue;
                input.placeholder = `Điền ${fieldId}`;

                const saveBtn = document.getElementById('modal-save');
                const cancelBtn = document.getElementById('modal-cancel');

                const handleSave = () => {
                    const newValue = input.value.trim();
                    if (!newValue) return;

                    const bookRef = db.collection("books").doc(docId);

                    let updateObj = {};
                    if (fieldId === 'title') {
                        updateObj['data.volumeInfo.title'] = newValue;
                    } else if (fieldId === 'author') {
                        updateObj['data.volumeInfo.authors'] = [newValue]; // ✅ replace full array
                    } else if (fieldId === 'price') {
                        updateObj['data.saleInfo.retailPrice.amount'] = parseFloat(newValue.replace(/\./g, ''));
                        updateObj['data.saleInfo.retailPrice.currencyCode'] = 'VND'; // or extract separately if needed
                    } else if (fieldId === 'link') {
                        updateObj['data.volumeInfo.previewLink'] = newValue;
                    } else if (fieldId === 'imageURL') {
                        updateObj['data.volumeInfo.imageLinks.thumbnail'] = newValue;
                    } else if (fieldId === 'description') {
                        updateObj['data.volumeInfo.description'] = newValue;
                    }

                    bookRef.update(updateObj)
                        .then(() => {
                            modal.style.display = 'none';
                            saveBtn.removeEventListener('click', handleSave);
                            location.reload();
                        })
                        .catch((error) => {
                            console.error("Error updating document:", error);
                        });
                };

                saveBtn.addEventListener('click', handleSave);

                cancelBtn.onclick = () => {
                    modal.style.display = 'none';
                    saveBtn.removeEventListener('click', handleSave);
                };
            });
        });
    }
}).catch((error) => {
    console.error("Error getting document:", error);
});
