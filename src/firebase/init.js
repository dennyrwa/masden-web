import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
// src/firebase/init.js
// Menggunakan Firebase SDK versi 10 (Modular) untuk menghemat ukuran file (Performance Strategy)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

// Konfigurasi ini nantinya Bapak dapatkan dari Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyC-ewFHd9lCp0ZDyAkEKu2bA_AcQBfx8R4",
  authDomain: "masden-web.firebaseapp.com",
  projectId: "masden-web",
  storageBucket: "masden-web.firebasestorage.app",
  messagingSenderId: "781504676708",
  appId: "1:781504676708:web:ab76071db3e77f461ef071",
  measurementId: "G-9F5CQLNGWF",
};
https://github.com/dennyrwa/masden-web.git
// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor layanan agar bisa digunakan di file lain
export const db = getFirestore(app);
export const auth = getAuth(app);

console.log(
  "Sistem SINTA: Firebase berhasil diinisialisasi dengan mode hemat kuota.",
);
