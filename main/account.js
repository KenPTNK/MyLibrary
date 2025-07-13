function formatNumberWithDots(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const value = localStorage.getItem('userData');
const url = value ? JSON.parse(value).url : '';
const username = value ? JSON.parse(value).username : '';
db.collection("username").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        if (doc.data().username === username) {
            document.getElementById('user-email').textContent = doc.data().email;
            document.getElementById('user-name').textContent = doc.data().username;
            document.getElementById('user-avatar').src = url;
        }
    });
});

// Lấy số dư tài khoản từ Firestore
db.collection("username").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        if (doc.data().username === username) {
            const balance = doc.data().balance || 0;
            document.getElementById('account-balance').textContent = formatNumberWithDots(balance) + " VND";
        }
    });
});

const nạpTiền = document.getElementById("recharge-btn");
const modal = document.getElementById("recharge-modal");
const closeModal = document.getElementById("close-modal");
const confirmRecharge = document.getElementById("confirm-recharge");
nạpTiền.addEventListener("click", function () {
    modal.classList.remove("hidden");
});
closeModal.addEventListener("click", function () {
    modal.classList.add("hidden");
});
confirmRecharge.addEventListener("click", function () {
    const amount = document.getElementById("recharge-amount").value;
    if (amount <= 0) {
        alert("Số tiền nạp vào phải lớn hơn 0");
        return;
    }
    db.collection("username").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (doc.data().username === username) {
                const currentBalance = doc.data().balance || 0;
                const newBalance = currentBalance + parseInt(amount);
                db.collection("username").doc(doc.id).update({
                    balance: newBalance
                }).then(() => {
                    alert("Nạp tiền thành công. Số dư mới: " + formatNumberWithDots(newBalance) + " VND");
                    document.getElementById('account-balance').textContent = formatNumberWithDots(newBalance) + " VND";
                    modal.classList.add("hidden");
                }).catch((error) => {
                    console.error("Lỗi cập nhật số dư:", error);
                });
            }
        });
    });
});

