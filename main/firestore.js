// Import Firebase modules (for use with <script type="module">)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Your Firebase config object
const firebaseConfig = {
    apiKey: "AIzaSyAvPoKeKpI00sqgGrXaSj1VOVRvbcmjiJw",
    authDomain: "jsi-project-1f1ec.firebaseapp.com",
    projectId: "jsi-project-1f1ec",
    storageBucket: "jsi-project-1f1ec.firebasestorage.app",
    messagingSenderId: "193684500089",
    appId: "1:193684500089:web:2ac3efa24eb4c3b8136ea8",
    measurementId: "G-RWW299C69D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const apiKey = 'AIzaSyCTsl-tX2E6HfwOwbIBUXP5a8YESez5akw';

export async function saveUIBooks(title, author) {
    let query = '';
    if ((title) && !(author)) query += 'intitle:' + title;
    if ((author) && (title)) query += 'intitle:' + title + '+' + 'inauthor:' + author;
    if ((title) && !(author)) query += 'inauthor:' + author;

    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            console.log("No books found.");
            return;
        }

        const firstItem = data.items[0];
        if (firstItem) {
            const volumeInfo = firstItem.volumeInfo;

            const book = {
                title: volumeInfo.title || "Untitled",
                authors: volumeInfo.authors || ["Unknown"],
                description: volumeInfo.description || "No description available.",
                thumbnail: volumeInfo.imageLinks?.thumbnail || "",
                publishedDate: volumeInfo.publishedDate || "Unknown",
                infoLink: volumeInfo.infoLink || "",
                googleId: firstItem.id
            };
            await addDoc(collection(db, "books"), book);
            console.log(`Saved: ${book.title}`);
        } else {
            console.log("No book found for this query.");
        }


        alert("Books saved to Firestore!");
    } catch (error) {
        console.error("Error:", error);
    }
}
