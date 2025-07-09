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
