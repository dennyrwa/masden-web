// src/admin/admin.js

import {
  addDoc,
  collection,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "../firebase/init.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Referensi Elemen UI
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("btn-logout");
const addPubForm = document.getElementById("add-publication-form");

// 1. Pantau Status Sesi Pengguna
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Jika sesi valid, sembunyikan form login, tampilkan dashboard
    console.log("SINTA: Akses admin diverifikasi untuk", user.email);
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
  } else {
    // Jika belum login, tampilkan form login
    loginSection.style.display = "block";
    dashboardSection.style.display = "none";
  }
});

// 2. Proses Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("admin-email").value;
  const password = document.getElementById("admin-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert(
      "SINTA: Selamat datang kembali, H. Bapak Denny Rakhmad Widi Ashari, M.E.!",
    );
  } catch (error) {
    console.error("Kesalahan login:", error.message);
    alert("Akses ditolak. Periksa kembali email dan kata sandi Bapak.");
  }
});

// 3. Proses Logout
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    alert("SINTA: Anda telah berhasil keluar dari sistem.");
  } catch (error) {
    console.error("Kesalahan logout:", error);
  }
});

// 4. Proses Tambah Data Publikasi ke Firestore
addPubForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Ambil nilai dari form
  const newPublication = {
    title: document.getElementById("pub-title").value,
    type: document.getElementById("pub-type").value,
    publisher: document.getElementById("pub-publisher").value,
    year: parseInt(document.getElementById("pub-year").value),
    doi_url: document.getElementById("pub-doi").value,
    abstract: document.getElementById("pub-abstract").value,
    createdAt: serverTimestamp(), // Timestamp waktu server
  };

  try {
    // Simpan ke koleksi 'publications' di Firestore
    await addDoc(collection(db, "publications"), newPublication);

    // SINTA menghapus cache agar pengunjung publik melihat data terbaru
    sessionStorage.removeItem("sinta_publications_data");

    alert("SINTA: Publikasi berhasil ditambahkan ke database!");
    addPubForm.reset(); // Kosongkan form
  } catch (error) {
    console.error("Gagal menambah publikasi:", error);
    alert(
      "SINTA: Terjadi kesalahan saat menyimpan data. Pastikan Security Rules sudah dikonfigurasi.",
    );
  }
});
