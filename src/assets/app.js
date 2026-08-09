// src/assets/app.js

import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { db } from "../firebase/init.js";

// ==========================================
// MODUL 1: PUBLIKASI & KARYA ILMIAH
// ==========================================
function renderPublications(publications) {
  const pubListElement = document.getElementById("publication-list");
  if (!pubListElement) return;

  pubListElement.innerHTML = "";

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

async function fetchPublications() {
  const cacheKey = "sinta_publications_data";
  const cachedData = sessionStorage.getItem(cacheKey);

  if (cachedData) {
    renderPublications(JSON.parse(cachedData));
    return;
  }

  try {
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

    sessionStorage.setItem(cacheKey, JSON.stringify(publications));
    renderPublications(publications);
  } catch (error) {
    console.error("Gagal mengambil data publikasi:", error);
  }
}

// ==========================================
// MODUL 2: RISET & PROYEK
// ==========================================
function renderResearch(research) {
  const resListElement = document.getElementById("research-list");
  if (!resListElement) return;

  resListElement.innerHTML = "";

  if (research.length === 0) {
    resListElement.innerHTML =
      '<div class="col-12 text-center text-muted"><p>Belum ada proyek riset yang ditampilkan.</p></div>';
    return;
  }

  research.forEach((item) => {
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

// ==========================================
// MODUL 3: BLOG AKADEMIK
// ==========================================
function renderBlog(posts) {
  const blogListElement = document.getElementById("blog-list");
  if (!blogListElement) return;

  blogListElement.innerHTML = "";

  if (posts.length === 0) {
    blogListElement.innerHTML =
      '<div class="col-12 text-center text-muted"><p>Belum ada artikel yang dipublikasikan.</p></div>';
    return;
  }

  posts.forEach((post) => {
    const cardHTML = `
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                    <div class="card-body p-4">
                        <span class="badge bg-primary mb-3 px-3 py-2 rounded-pill">Artikel</span>
                        <h5 class="fw-bold mb-3">${post.title}</h5>
                        <div class="card-text text-muted mb-4 overflow-hidden" style="max-height: 80px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">
                            ${post.content}
                        </div>
                    </div>
                    <div class="card-footer bg-white border-0 px-4 pb-4 pt-0">
                        <!-- Tautan dinamis yang mengarah ke halaman detail artikel -->
                        <a href="article.html?id=${post.id}" class="btn btn-outline-primary btn-sm rounded-pill w-100">
                            Baca Selengkapnya <i class="fa-solid fa-arrow-right ms-1"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    blogListElement.innerHTML += cardHTML;
  });
}

async function fetchBlog() {
  const cacheKey = "sinta_blog_data";
  const cachedData = sessionStorage.getItem(cacheKey);

  if (cachedData) {
    renderBlog(JSON.parse(cachedData));
    return;
  }

  try {
    const blogQuery = query(
      collection(db, "blog_posts"),
      orderBy("createdAt", "desc"),
      limit(3),
    );
    const querySnapshot = await getDocs(blogQuery);

    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });

    sessionStorage.setItem(cacheKey, JSON.stringify(posts));
    renderBlog(posts);
  } catch (error) {
    console.error("Gagal memuat data blog:", error);
  }
}

// ==========================================
// INISIALISASI (Jalankan saat halaman dimuat)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("publication-list")) {
    fetchPublications();
  }
  if (document.getElementById("research-list")) {
    fetchResearch();
  }
  if (document.getElementById("blog-list")) {
    fetchBlog();
  }// --- Logika Autohide Navbar & UX Mobile ---
    const el_autohide = document.querySelector('.autohide');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (el_autohide) {
        let last_scroll_top = 0;
        window.addEventListener('scroll', () => {
            // Celah Logika 1: Cegah autohide jika menu mobile sedang terbuka
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                return; 
            }
            
            let scroll_top = window.scrollY;
            if (scroll_top < last_scroll_top) {
                // Menggulir ke atas
                el_autohide.classList.remove('scrolled-down');
                el_autohide.classList.add('scrolled-up');
            } else {
                // Menggulir ke bawah
                el_autohide.classList.remove('scrolled-up');
                el_autohide.classList.add('scrolled-down');
            }
            last_scroll_top = scroll_top;
        });
        // Celah Logika 2: Tutup menu otomatis setelah tautan diklik di versi mobile
    const navLinks = document.querySelectorAll('.nav-item .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                navbarToggler.click(); // Simulasikan klik pada hamburger untuk menutup
            }
        });
});
