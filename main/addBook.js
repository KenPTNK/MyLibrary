const manualForm = document.getElementById('manual-form');
const idForm = document.getElementById('id-form');
const manualBtn = document.getElementById('manualBtn');
const idOnlyBtn = document.getElementById('idOnlyBtn');

manualBtn.addEventListener('click', () => {
    manualForm.classList.remove('hidden');
    manualForm.classList.add('book-form');
    idForm.classList.add('hidden');
    idForm.classList.remove('book-form');
    manualBtn.classList.add('active');
    idOnlyBtn.classList.remove('active');
});

idOnlyBtn.addEventListener('click', () => {
    manualForm.classList.add('hidden');
    idForm.classList.remove('hidden');
    manualForm.classList.remove('book-form');
    idForm.classList.add('book-form');
    idOnlyBtn.classList.add('active');
    manualBtn.classList.remove('active');
});

// Handle manual form submission
manualForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = manualForm.title.value.trim();
    const author = manualForm.author.value.trim();
    const description = manualForm.description.value.trim();
    const price = parseFloat(manualForm.price.value);
    const imgLink = manualForm.imgLink.value.trim();
    const previewLink = manualForm.previewLink.value.trim();

    if (!title || !author || !description || !imgLink || isNaN(price)) {
        alert("Vui lòng điền đầy đủ thông tin hợp lệ.");
        return;
    }

    try {
        await db.collection('books').add({
            title, author, description, price, imgLink, previewLink,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert("📚 Sách đã được thêm thành công!");
        manualForm.reset();
    } catch (error) {
        console.error("Lỗi khi thêm sách:", error);
        alert("Đã xảy ra lỗi.");
    }
});

// Handle ID-only form submission
idForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bookId = idForm.bookId.value.trim();
    if (!bookId) {
        alert("Vui lòng nhập ID sách.");
        return;
    }

    try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
        const data = await response.json();

        if (!data.volumeInfo) throw new Error("Không tìm thấy sách.");

        // Check if the book already exists in Firestore
        const existingDoc = await db.collection('books').doc(bookId).get();
        if (existingDoc.exists) {
            alert("Sách này đã tồn tại trong cơ sở dữ liệu.");
            return;
        }
        await db.collection('books').doc(bookId).set({
            data: data,
        });
        alert("✅ Sách đã được thêm từ Google Books!");
        idForm.reset();
    } catch (error) {
        console.error("Lỗi:", error);
        alert("Không thể lấy dữ liệu sách. Kiểm tra ID.");
    }
});