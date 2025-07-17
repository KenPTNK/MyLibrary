function createUserCard(name, email) {
    const card = document.createElement('div');
    card.className = 'user-card';

    // --- User row ---
    const nameRow = document.createElement('div');
    nameRow.className = 'user-name-row';
    const nameEl = document.createElement('h3');
    nameEl.textContent = name;

    const userDeleteBtn = document.createElement('i');
    userDeleteBtn.className = 'far fa-trash-alt delete-user-btn';
    userDeleteBtn.title = 'Xóa người dùng';
    userDeleteBtn.addEventListener('click', () => {
        if (!confirm(`Bạn có chắc muốn xóa tài khoản "${name}"?`)) return;
        db.collection('username').where('username', '==', name).get()
            .then(snap => {
                snap.forEach(doc => {
                    doc.ref.delete()
                        .then(() => { alert('Tài khoản đã được xóa!'); window.location.reload(); })
                        .catch(err => console.error('Error removing user:', err));
                });
            })
            .catch(err => console.error('Error querying users:', err));
    });

    nameRow.append(nameEl, userDeleteBtn);
    card.appendChild(nameRow);

    // --- Email ---
    const emailEl = document.createElement('p');
    emailEl.textContent = `Email: ${email}`;
    card.appendChild(emailEl);

    // --- Books container ---
    const booksContainer = document.createElement('div');
    booksContainer.className = 'user-books';
    booksContainer.id = `rented-books-list-${name.replace(/\s+/g, '-')}`;
    booksContainer.textContent = 'Đang tải sách...';
    card.appendChild(booksContainer);

    // --- Load rentedBooks ---
    db.collection('username').where('username', '==', name).get()
        .then(userSnap => {
            if (userSnap.empty) {
                booksContainer.textContent = 'Tài khoản không tìm thấy.';
                return;
            }
            const userDoc = userSnap.docs[0];
            userDoc.ref.collection('rentedBooks').get()
                .then(bookSnap => {
                    booksContainer.innerHTML = ''; // now safe: no listeners to lose
                    if (bookSnap.empty) {
                        booksContainer.textContent = 'Tài khoản chưa mua sách.';
                        return;
                    }

                    bookSnap.forEach(bookDoc => {
                        const bookData = bookDoc.data();
                        const bookItem = document.createElement('div');
                        bookItem.className = 'rented-book-item';

                        // Title row
                        const titleRow = document.createElement('div');
                        titleRow.className = 'book-title-row';

                        const titleEl = document.createElement('h4');
                        titleEl.textContent = bookData.name;

                        const bookDeleteBtn = document.createElement('i');
                        bookDeleteBtn.className = 'far fa-trash-alt delete-book-btn';
                        bookDeleteBtn.title = 'Xóa sách này';
                        bookDeleteBtn.addEventListener('click', () => {
                            if (!confirm(`Bạn có chắc muốn xóa cuốn "${bookData.name}"?`)) return;
                            bookDoc.ref.delete()
                                .then(() => {
                                    alert('Sách đã được xóa!');
                                    bookItem.remove();
                                })
                                .catch(err => console.error('Error removing book:', err));
                        });

                        titleRow.append(titleEl, bookDeleteBtn);
                        bookItem.appendChild(titleRow);

                        // Other info
                        ['price', 'address', 'quantity'].forEach(field => {
                            const p = document.createElement('p');
                            let label = '';
                            if (field === 'price') label = 'Giá: ';
                            if (field === 'address') label = 'Địa chỉ giao hàng: ';
                            if (field === 'quantity') label = 'Số lượng: ';
                            p.textContent = label + bookData[field];
                            bookItem.appendChild(p);
                        });

                        booksContainer.appendChild(bookItem);
                    });
                })
                .catch(err => console.error('Error fetching rentedBooks:', err));
        })
        .catch(err => console.error('Error querying user:', err));

    return card;
}

// --- Render all user cards (skip Admin) ---
const userList = document.getElementById('user-list');
db.collection('username').get()
    .then(snap => {
        snap.forEach(doc => {
            if (doc.data().username === 'Admin') return;
            userList.appendChild(createUserCard(doc.data().username, doc.data().email));
        });
    })
    .catch(err => console.error('Error loading user list:', err));
