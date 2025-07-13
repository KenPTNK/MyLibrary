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

const login = document.getElementById("login");

login.addEventListener('click', function () {
    event.preventDefault(); // ✨ Chặn reload khi submit
    const email = document.getElementById("email-login").value;
    const password = document.getElementById("pass-login").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log(user)
            alert("Đăng nhập thành công! Xin chào " + user._delegate.providerData[0].displayName);
            const data = {
                username: user._delegate.providerData[0].displayName,
                url: user._delegate.photoURL
            }
            localStorage.setItem("userData", JSON.stringify(data));
            if (email === 'admin@gmail.com') {
                window.location.href = "admin.html";
            } else {
                window.location.href = "index.html";
            }
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage);
            console.log(errorCode);

            if (errorCode === 'auth/missing-password') {
                alert("Vui lòng nhập mật khẩu.");
            } else if (errorCode === 'auth/invalid-credential') {
                alert("Không tài khoản trùng khớp nào được tìm thấy.");
            } else {
                alert("Lỗi: " + errorMessage);
            }
        });
});

const signUp = document.getElementById("signUp");

signUp.addEventListener('click', function () {
    event.preventDefault(); // ✨ Chặn reload khi submit
    const name = document.getElementById("name-signUp").value;
    const email = document.getElementById("email-signUp").value;
    const password = document.getElementById("pass-signUp").value;
    const repass = document.getElementById("repass-signUp").value;
    if (password != repass) {
        alert("Mật khẩu nhập vào không khớp với nhau")
        location.reload();
    }
    if (password.length < 6) {
        alert("Mật khẩu phải có ít nhất 6 ký tự");
        location.reload();
    }
    db.collection("username").add({
        username: name,
        email: email,
        password: password
    })
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in 
            var user = userCredential.user;
            alert("Đăng ký thành công. Quay trở lại trang đăng nhập để đăng nhập")
            switchToLogin()
            return user.updateProfile({
                displayName: name,
                photoURL: "./IMG/pngtree-cute-boy-lying-down-reading-a-book-image_1195391.webp"
            });
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage);
            console.log(errorCode);
        });
}
)

function switchToRegister() {
    document.querySelector('.auth-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
}
function switchToLogin() {
    document.querySelector('.auth-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
}

const back = document.querySelector('.return');
back.addEventListener('click', function () {
    window.location.href = "index.html";
}
)

