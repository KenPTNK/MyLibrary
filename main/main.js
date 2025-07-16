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

const key = 'AIzaSyCTsl-tX2E6HfwOwbIBUXP5a8YESez5akw';

const ids = [
    "_UoZEQAAQBAJ",
    "csoHEQAAQBAJ",
    "QDowEQAAQBAJ",
    "HmShg3dnLSMC",
    "HXH-2XUU0pgC",
    "y9YEEQAAQBAJ",
    "lmSgEAAAQBAJ",
    "eqjvDwAAQBAJ",
    "V7SHrJBl9Z4C",
    "UPAYAAAAYAAJ"
];

// db.collection("books").get().then((querySnapshot) => {
//     querySnapshot.forEach((doc) => {
//         db.collection("books").doc(doc.id).delete().then(() => {
//             console.log("Document successfully deleted: " + doc.id);
//         }).catch((error) => {
//             console.error("Error removing document: ", error);
//         });
//     });
// });
async function saveBooks() {
    for (const id of ids) {
        try {
            const doc = await db.collection("books").doc(id).get();
            if (doc.exists) {
                continue;
            }

            const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}?key=${key}`);
            const data = await response.json();

            await db.collection("books").doc(id).set({
                data: data
            });
            // console.log("Document successfully written!");
        } catch (error) {
            console.error("Error processing book with ID", id, ":", error);
        }
    }
}

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
        location.reload();
        window.location.href = "index.html";
    }).catch((error) => {
        console.error("Lỗi khi đăng xuất:", error);
        alert("Có lỗi khi đăng xuất!");
    });
}

// https://www.googleapis.com/books/v1/volumes?q=tên cái này là gọi theo tên điền cái tên vào là ra
// https://www.googleapis.com/books/v1/volumes/id cái này là gọi theo id 


