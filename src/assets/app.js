// src/assets/app.js

import { db } from '../firebase/init.js';
import { collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// FUNGSI SKELETON LOADER (Optimalisasi UX)
// ==========================================
function showSkeleton(elementId, columnClass) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    let skeletonHTML = '';
    // Menampilkan 3 kartu bayangan sementara data diambil
    for (let i = 0; i < 3; i++) { 
        skeletonHTML += `
            <div class="${columnClass} mb-4">
                <div class="card h-100 shadow-sm border-0" aria-hidden="true">
                    <div class="card-body p-4">
                        <span class="placeholder col-4 mb-3 bg-secondary rounded" style="height: 25px;"></span>
                        <h5 class="card-title placeholder-glow mb-3">
                            <span class="placeholder col-8"></span> <span class="placeholder col-5"></span>
                        </h5>
                        <p class="card-text placeholder-glow mb-4">
                            <span class="placeholder col-12"></span>
                            <span class="placeholder col-10"></span>
                            <span class="placeholder col-7"></span>
                        </p>
                    </div>
                    <div class="card-footer bg-transparent border-0 px-4 pb-4 pt-0 placeholder-glow">
                        <span class="placeholder col-12 bg-primary" style="height: 32px; border-radius: 50px;"></span>
                    </div>
                </div>
            </div>
        `;
    }
    container.innerHTML = skeletonHTML;
}

// ==========================================
// MODUL 1: PUBLIKASI & KARYA ILMIAH
// ==========================================
function renderPublications(publications) {
    const pubListElement = document.getElementById('publication-list');
    if (!pubListElement) return;

    pubListElement.innerHTML = ''; 

    if (publications.length === 0) {
        pubListElement.innerHTML = '<div class="col-12 text-center text-muted"><p>Belum ada publikasi yang ditampilkan.</p></div>';
        return;
    }

    publications.forEach(pub => {
        const cardHTML = `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 shadow-sm border-0">
                    <div class="card-body p-4">
                        <span class="badge bg-secondary mb-3 px-3 py-2 rounded-pill">${pub.type}</span>
                        <h5 class="card-title fw-bold">${pub.title}</h5>
                        <p class="card-text text-muted small mb-3"><i class="fa-solid fa-building me-1"></i>${pub.publisher} &bull; ${pub.year}</p>
                        <p class="card-text">${pub.abstract.substring(0, 100)}...</p>
                    </div>
                    <div class="card-footer bg-transparent border-0 px-4 pb-4 pt-0">
                        <a href="${pub.doi_url}" target="_blank" class="btn btn-sm btn-outline-primary rounded-pill w-100">
                            <i class="fa-solid fa-link me-1"></i> Lihat Detail
                        </a>
                    </div>
                </div>
            </div>
        `;
        pubListElement.innerHTML += cardHTML;
    });
}

async function fetchPublications() {
    const cacheKey = 'sinta_publications_data';
    const cachedData = sessionStorage.getItem(cacheKey);

    if (cachedData) {
        renderPublications(JSON.parse(cachedData));
        return;
    }

    // Tampilkan Skeleton sebelum memanggil database
    showSkeleton('publication-list', 'col-md-6 col-lg-4');

    try {
        const pubQuery = query(collection(db, "publications"), orderBy("year", "desc"), limit(6));
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
    const resListElement = document.getElementById('research-list');
    if (!resListElement) return;

    resListElement.innerHTML = ''; 

    if (research.length === 0) {
        resListElement.innerHTML = '<div class="col-12 text-center text-muted"><p>Belum ada proyek riset yang ditampilkan.</p></div>';
        return;
    }

    research.forEach(item => {
        const statusColor = item.status.toLowerCase() === 'selesai' ? 'bg-success' : 'bg-warning text-dark';
        
        const cardHTML = `
            <div class="col-md-6 mb-4">
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
    const cacheKey = 'sinta_research_data';
    const cachedData = sessionStorage.getItem(cacheKey);

    if (cachedData) {
        renderResearch(JSON.parse(cachedData));
        return;
    }

    // Tampilkan Skeleton sebelum memanggil database
    showSkeleton('research-list', 'col-md-6');

    try {
        const resQuery = query(collection(db, "research_projects"), orderBy("year_start", "desc"));
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
    const blogListElement = document.getElementById('blog-list');
    if (!blogListElement) return;

    blogListElement.innerHTML = ''; 

    if (posts.length === 0) {
        blogListElement.innerHTML = '<div class="col-12 text-center text-muted"><p>Belum ada artikel yang dipublikasikan.</p></div>';
        return;
    }

    posts.forEach(post => {
        const cardHTML = `
            <div class="col-md-4 mb-4">
                <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                    <div class="card-body p-4">
                        <span class="badge bg-primary mb-3 px-3 py-2 rounded-pill">Artikel</span>
                        <h5 class="fw-bold mb-3">${post.title}</h5>
                        <div class="card-text text-muted mb-4 overflow-hidden" style="max-height: 80px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">
                            ${post.content}
                        </div>
                    </div>
                    <div class="card-footer bg-transparent border-0 px-4 pb-4 pt-0">
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
    const cacheKey = 'sinta_blog_data';
    const cachedData = sessionStorage.getItem(cacheKey);

    if (cachedData) {
        renderBlog(JSON.parse(cachedData));
        return;
    }

    // Tampilkan Skeleton sebelum memanggil database
    showSkeleton('blog-list', 'col-md-4');

    try {
        const blogQuery = query(collection(db, "blog_posts"), orderBy("createdAt", "desc"), limit(3));
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
// INISIALISASI & MODE GELAP
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Memuat Data dari Firebase
    if (document.getElementById('publication-list')) fetchPublications();
    if (document.getElementById('research-list')) fetchResearch();
    if (document.getElementById('blog-list')) fetchBlog();

    // 2. Logika Mode Gelap (Dark Mode)
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    const htmlElement = document.documentElement;
    
    if (themeToggleBtn) {
        const currentTheme = localStorage.getItem('theme') || 'light';
        setTheme(currentTheme);

        themeToggleBtn.addEventListener('click', () => {
            const newTheme = htmlElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }

    function setTheme(theme) {
        htmlElement.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
        
        if (theme === 'dark') {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            themeText.textContent = 'Mode Terang';
            themeToggleBtn.classList.replace('btn-outline-light', 'btn-light');
            themeToggleBtn.classList.add('text-dark');
        } else {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            themeText.textContent = 'Mode Gelap';
            themeToggleBtn.classList.replace('btn-light', 'btn-outline-light');
            themeToggleBtn.classList.remove('text-dark');
        }
    }
    
    // 3. Menutup menu mobile otomatis jika tautan jangkar diklik
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navLinks = document.querySelectorAll('.nav-item .nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                navbarToggler.click();
            }
        });
    });

});