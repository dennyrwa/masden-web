// src/admin/admin.js

import { auth, db } from "../firebase/init.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  deleteDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// 1. INISIALISASI QUILL EDITOR
// ==========================================
let quillEditor;
// Kita pastikan elemennya ada sebelum menginisialisasi
if (document.getElementById('blog-editor')) {
    quillEditor = new Quill('#blog-editor', {
        theme: 'snow',
        placeholder: 'Tuliskan gagasan, opini, atau ulasan akademik di sini...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'blockquote'],
                ['clean'] // Tombol untuk menghapus format
            ]
        }
    });
}

// ==========================================
// REFERENSI ELEMEN UI
// ==========================================
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("btn-logout");

const addPubForm = document.getElementById("add-publication-form");
const addResForm = document.getElementById("add-research-form");
const addBlogForm = document.getElementById("add-blog-form");

const btnLoadData = document.getElementById("btn-load-data");
const dataContainer = document.getElementById("data-management-container");
const adminPubList = document.getElementById("admin-pub-list");
const adminResList = document.getElementById("admin-res-list");
const adminBlogList = document.getElementById("admin-blog-list");

// ==========================================
// 2. OTENTIKASI (LOGIN & LOGOUT)
// ==========================================
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("SINTA: Akses admin diverifikasi untuk", user.email);
    if(loginSection) loginSection.style.display = "none";
    if(dashboardSection) dashboardSection.style.display = "block";
  } else {
    if(loginSection) loginSection.style.display = "block";
    if(dashboardSection) dashboardSection.style.display = "none";
  }
});

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("admin-email").value;
    const password = document.getElementById("admin-password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("SINTA: Selamat datang kembali, Bapak Denny Rakhmad Widi Ashari, M.E.!");
    } catch (error) {
      console.error("Kesalahan login:", error.message);
      alert("Akses ditolak. Periksa kembali email dan kata sandi Bapak.");
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      alert("SINTA: Anda telah berhasil keluar dari sistem.");
    } catch (error) {
      console.error("Kesalahan logout:", error);
    }
  });
}

// ==========================================
// 3. PROSES TAMBAH DATA
// ==========================================

// --- A. Publikasi ---
if (addPubForm) {
  addPubForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newPublication = {
      title: document.getElementById("pub-title").value,
      type: document.getElementById("pub-type").value,
      publisher: document.getElementById("pub-publisher").value,
      year: parseInt(document.getElementById("pub-year").value),
      doi_url: document.getElementById("pub-doi").value,
      abstract: document.getElementById("pub-abstract").value,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "publications"), newPublication);
      sessionStorage.removeItem("sinta_publications_data");
      alert("SINTA: Publikasi berhasil ditambahkan ke database!");
      addPubForm.reset();
    } catch (error) {
      console.error("Gagal menambah publikasi:", error);
      alert("SINTA: Terjadi kesalahan saat menyimpan data.");
    }
  });
}

// --- B. Riset & Proyek ---
if (addResForm) {
  addResForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newResearch = {
      title: document.getElementById("res-title").value,
      funding_source: document.getElementById("res-funding").value,
      year_start: parseInt(document.getElementById("res-year").value),
      status: document.getElementById("res-status").value,
      description: document.getElementById("res-desc").value,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "research_projects"), newResearch);
      sessionStorage.removeItem("sinta_research_data");
      alert("SINTA: Proyek riset berhasil ditambahkan!");
      addResForm.reset();
    } catch (error) {
      console.error("Gagal menambah riset:", error);
      alert("SINTA: Terjadi kesalahan saat menyimpan data.");
    }
  });
}

// --- C. Blog Akademik ---
if (addBlogForm) {
  addBlogForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Ambil isi HTML dari Quill Editor
    const blogHtmlContent = quillEditor.root.innerHTML;

    // Validasi agar tidak kosong
    if (blogHtmlContent === '<p><br></p>' || blogHtmlContent.trim() === '') {
        alert("SINTA: Isi artikel tidak boleh kosong.");
        return;
    }

    const newPost = {
      title: document.getElementById("blog-title").value,
      content: blogHtmlContent,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "blog_posts"), newPost);
      sessionStorage.removeItem("sinta_blog_data");
      alert("SINTA: Artikel blog berhasil dipublikasikan!");
      addBlogForm.reset();
      quillEditor.setContents([]); // Kosongkan editor setelah berhasil
    } catch (error) {
      console.error("Gagal menambah artikel blog:", error);
      alert("SINTA: Terjadi kesalahan. Pastikan Bapak sudah login dengan benar.");
    }
  });
}

// ==========================================
// 4. MANAJEMEN DATA (HAPUS)
// ==========================================
if (btnLoadData) {
  btnLoadData.addEventListener("click", async () => {
    btnLoadData.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Memuat data...';

    try {
      // Load Publikasi
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

      // Load Riset
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

      // Load Blog
      const blogSnapshot = await getDocs(collection(db, "blog_posts"));
      adminBlogList.innerHTML = "";
      blogSnapshot.forEach((d) => {
        const data = d.data();
        adminBlogList.innerHTML += `<tr>
                    <td><strong>${data.title}</strong></td>
                    <td><button class="btn btn-sm btn-danger btn-delete" data-id="${d.id}" data-type="blog_posts">Hapus</button></td>
                </tr>`;
      });

      dataContainer.style.display = "block";
      btnLoadData.innerHTML = '<i class="fa-solid fa-sync me-2"></i>Segarkan Data';
      attachDeleteEvents();

    } catch (error) {
      console.error("Gagal memuat daftar data:", error);
      alert("SINTA: Terjadi kesalahan saat memuat data. Periksa koneksi internet Bapak.");
      btnLoadData.innerHTML = '<i class="fa-solid fa-sync me-2"></i>Muat Daftar Data';
    }
  });
}

function attachDeleteEvents() {
  const deleteButtons = document.querySelectorAll(".btn-delete");
  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.getAttribute("data-id");
      const type = e.target.getAttribute("data-type");

      if (confirm("Apakah Bapak yakin ingin menghapus data ini secara permanen?")) {
        try {
          await deleteDoc(doc(db, type, id));
          if (type === "publications") sessionStorage.removeItem("sinta_publications_data");
          if (type === "research_projects") sessionStorage.removeItem("sinta_research_data");
          if (type === "blog_posts") sessionStorage.removeItem("sinta_blog_data");
          
          alert("SINTA: Data berhasil dihapus sepenuhnya.");
          btnLoadData.click(); // Segarkan tabel otomatis
        } catch (error) {
          console.error("Gagal menghapus:", error);
          alert("SINTA: Gagal menghapus data. Pastikan sesi login Bapak masih aktif.");
        }
      }
    });
  });
}