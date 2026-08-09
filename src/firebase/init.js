// src/firebase/init.js
// Menggunakan Firebase SDK versi 10 (Modular) untuk menghemat ukuran file (Performance Strategy)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Konfigurasi ini nantinya Bapak dapatkan dari Firebase Console
const firebaseConfig = {
  apiKey: "API_KEY_BAPAK",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID",
  storageBucket: "PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor layanan agar bisa digunakan di file lain
export const db = getFirestore(app);
export const auth = getAuth(app);

console.log("Sistem SINTA: Firebase berhasil diinisialisasi dengan mode hemat kuota.");