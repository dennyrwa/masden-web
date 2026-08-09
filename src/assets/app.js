// src/assets/app.js

import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { db } from "../firebase/init.js";

// Fungsi untuk merender UI Card Publikasi
function renderPublications(publications) {
  const pubListElement = document.getElementById("publication-list");
  pubListElement.innerHTML = ""; // Hapus indikator loading

  if (publications.length === 0) {
    pubListElement.innerHTML =
      '<div class="col-12 text-center text-muted"><p>Belum ada publikasi yang ditampilkan.</p></div>';
    return;
  }

  publications.forEach((pub) => {
    const cardHTML = `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 shadow-sm border-0">
                    <div class="card-body">
                        <span class="badge bg-secondary mb-2">${pub.type}</span>
                        <h5 class="card-title fw-bold">${pub.title}</h5>
                        <p class="card-text text-muted small mb-3">${pub.publisher} &bull; ${pub.year}</p>
                        <p class="card-text">${pub.abstract.substring(0, 100)}...</p>
                    </div>
                    <div class="card-footer bg-white border-0 pb-3 pt-0">
                        <a href="${pub.doi_url}" target="_blank" class="btn btn-sm btn-outline-primary w-100">
                            <i class="fa-solid fa-link me-1"></i> Lihat Detail / DOI
                        </a>
                    </div>
                </div>
            </div>
        `;
    pubListElement.innerHTML += cardHTML;
  });
}

// Fungsi utama mengambil data dengan strategi Caching
async function fetchPublications() {
  const cacheKey = "sinta_publications_data";
  const cachedData = sessionStorage.getItem(cacheKey);

  // 1. Cek apakah data sudah ada di cache browser
  if (cachedData) {
    console.log("SINTA: Menampilkan publikasi dari cache memori.");
    renderPublications(JSON.parse(cachedData));
    return;
  }

  // 2. Jika tidak ada di cache, ambil dari Firestore
  console.log("SINTA: Mengambil data publikasi dari server Firestore...");
  try {
    // Query: Ambil publikasi, urutkan dari yang terbaru, batasi 6 item
    const pubQuery = query(
      collection(db, "publications"),
      orderBy("year", "desc"),
      limit(6),
    );
    const querySnapshot = await getDocs(pubQuery);

    const publications = [];
    querySnapshot.forEach((doc) => {
      publications.push({ id: doc.id, ...doc.data() });
    });

    // 3. Simpan hasil ke cache untuk navigasi berikutnya
    sessionStorage.setItem(cacheKey, JSON.stringify(publications));

    // 4. Render ke layar
    renderPublications(publications);
  } catch (error) {
    console.error("Gagal mengambil data publikasi:", error);
    document.getElementById("publication-list").innerHTML = `
            <div class="col-12 text-center text-danger">
                <p>Maaf, terjadi kesalahan saat memuat data. Silakan muat ulang halaman.</p>
            </div>
        `;
  }
}
// Fungsi untuk merender UI Card Riset
function renderResearch(research) {
  const resListElement = document.getElementById("research-list");
  resListElement.innerHTML = ""; // Hapus loading

  if (research.length === 0) {
    resListElement.innerHTML =
      '<div class="col-12 text-center text-muted"><p>Belum ada proyek riset yang ditampilkan.</p></div>';
    return;
  }

  research.forEach((item) => {
    // Logika warna status
    const statusColor =
      item.status.toLowerCase() === "selesai"
        ? "bg-success"
        : "bg-warning text-dark";

    const cardHTML = `
            <div class="col-md-6">
                <div class="card h-100 border-0 shadow-sm border-top border-primary border-4 rounded-3">
                    <div class="card-body p-4">
                        <span class="badge ${statusColor} mb-3 px-3 py-2 rounded-pill">${item.status}</span>
                        <h5 class="fw-bold mb-3">${item.title}</h5>
                        <p class="text-primary small fw-semibold mb-3">
                            <i class="fa-solid fa-calendar me-1"></i> Mulai: ${item.year_start} 
                            <span class="mx-2">|</span> 
                            <i class="fa-solid fa-building-columns me-1"></i> ${item.funding_source}
                        </p>
                        <p class="text-muted mb-0">${item.description}</p>
                    </div>
                </div>
            </div>
        `;
    resListElement.innerHTML += cardHTML;
  });
}

// Fungsi mengambil data riset dengan Caching
async function fetchResearch() {
  const cacheKey = "sinta_research_data";
  const cachedData = sessionStorage.getItem(cacheKey);

  if (cachedData) {
    renderResearch(JSON.parse(cachedData));
    return;
  }

  try {
    const resQuery = query(
      collection(db, "research_projects"),
      orderBy("year_start", "desc"),
    );
    const querySnapshot = await getDocs(resQuery);

    const research = [];
    querySnapshot.forEach((doc) => {
      research.push({ id: doc.id, ...doc.data() });
    });

    sessionStorage.setItem(cacheKey, JSON.stringify(research));
    renderResearch(research);
  } catch (error) {
    console.error("Gagal memuat data riset:", error);
  }
}

// Jalankan fungsi saat struktur HTML selesai dimuat
document.addEventListener("DOMContentLoaded", () => {
  // Pastikan elemen publikasi ada di halaman sebelum menjalankan skrip
  if (document.getElementById("publication-list")) {
    fetchPublications();
  }
  // Tambahkan pemanggilan riset di sini:
  if (document.getElementById("research-list")) {
    fetchResearch();
  }
});
