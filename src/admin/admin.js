// src/admin/admin.js
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  deleteDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
// Referensi form riset
const addResForm = document.getElementById("add-research-form");

// Proses Tambah Data Riset ke Firestore
if (addResForm) {
  addResForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Ambil nilai dari form riset
    const newResearch = {
      title: document.getElementById("res-title").value,
      funding_source: document.getElementById("res-funding").value,
      year_start: parseInt(document.getElementById("res-year").value),
      status: document.getElementById("res-status").value,
      description: document.getElementById("res-desc").value,
      createdAt: serverTimestamp(), // Menggunakan fungsi dari Firebase
    };

    try {
      // Simpan ke koleksi 'research_projects'
      await addDoc(collection(db, "research_projects"), newResearch);

      // SINTA menghapus cache riset agar pengunjung melihat pembaruan
      sessionStorage.removeItem("sinta_research_data");

      alert("SINTA: Proyek riset berhasil ditambahkan!");
      addResForm.reset(); // Kosongkan form
    } catch (error) {
      console.error("Gagal menambah riset:", error);
      alert(
        "SINTA: Terjadi kesalahan. Pastikan Bapak sudah login dengan benar.",
      );
    }
  });
}
// Referensi Elemen Manajemen Data
const btnLoadData = document.getElementById("btn-load-data");
const dataContainer = document.getElementById("data-management-container");
const adminPubList = document.getElementById("admin-pub-list");
const adminResList = document.getElementById("admin-res-list");

if (btnLoadData) {
  btnLoadData.addEventListener("click", async () => {
    btnLoadData.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Memuat data...';

    try {
      // Tarik Data Publikasi
      const pubSnapshot = await getDocs(collection(db, "publications"));
      adminPubList.innerHTML = "";
      pubSnapshot.forEach((d) => {
        const data = d.data();
        adminPubList.innerHTML += `<tr>
                    <td><strong>${data.title}</strong></td>
                    <td>${data.year}</td>
                    <td><button class="btn btn-sm btn-danger btn-delete" data-id="${d.id}" data-type="publications">Hapus</button></td>
                </tr>`;
      });

      // Tarik Data Riset
      const resSnapshot = await getDocs(collection(db, "research_projects"));
      adminResList.innerHTML = "";
      resSnapshot.forEach((d) => {
        const data = d.data();
        adminResList.innerHTML += `<tr>
                    <td><strong>${data.title}</strong></td>
                    <td><span class="badge bg-secondary">${data.status}</span></td>
                    <td><button class="btn btn-sm btn-danger btn-delete" data-id="${d.id}" data-type="research_projects">Hapus</button></td>
                </tr>`;
      });

      // Tampilkan tabel dan ubah teks tombol
      dataContainer.style.display = "block";
      btnLoadData.innerHTML =
        '<i class="fa-solid fa-sync me-2"></i>Segarkan Data';

      // Pasang fungsi klik untuk semua tombol hapus yang baru saja dibuat
      attachDeleteEvents();
    } catch (error) {
      console.error("Gagal memuat daftar data:", error);
      alert(
        "SINTA: Terjadi kesalahan saat memuat data. Periksa koneksi internet Bapak.",
      );
      btnLoadData.innerHTML =
        '<i class="fa-solid fa-sync me-2"></i>Muat Daftar Data';
    }
  });
}

// Fungsi Eksekusi Hapus Data
function attachDeleteEvents() {
  const deleteButtons = document.querySelectorAll(".btn-delete");
  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.getAttribute("data-id");
      const type = e.target.getAttribute("data-type");

      // Konfirmasi ganda untuk mencegah salah klik
      if (
        confirm(
          "Apakah Bapak yakin ingin menghapus data ini secara permanen? Tindakan ini tidak dapat dibatalkan.",
        )
      ) {
        try {
          // Hapus dari Firestore
          await deleteDoc(doc(db, type, id));

          // SINTA menghapus memori cache agar website publik langsung ter-update
          if (type === "publications")
            sessionStorage.removeItem("sinta_publications_data");
          if (type === "research_projects")
            sessionStorage.removeItem("sinta_research_data");

          alert("SINTA: Data berhasil dihapus sepenuhnya.");

          // Panggil fungsi load ulang agar tabel langsung diperbarui
          btnLoadData.click();
        } catch (error) {
          console.error("Gagal menghapus:", error);
          alert(
            "SINTA: Gagal menghapus data. Pastikan sesi login Bapak masih aktif.",
          );
        }
      }
    });
  });
}
