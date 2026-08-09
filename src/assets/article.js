// src/assets/article.js

import { db } from '../firebase/init.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    const articleContainer = document.getElementById('article-container');
    
    // 1. Membaca parameter ?id=... dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    // Jika diakses tanpa ID, arahkan kembali ke beranda
    if (!postId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // 2. Mengambil dokumen tunggal berdasarkan ID dari Firestore
        const docRef = doc(db, "blog_posts", postId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const post = docSnap.data();
            
            // Format tanggal (mengubah timestamp Firebase menjadi format kalender)
            const dateObj = post.createdAt ? post.createdAt.toDate() : new Date();
            const dateString = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

            // 3. Merender judul dan isi artikel ke layar
            articleContainer.innerHTML = `
                <div class="card border-0 shadow-sm rounded-4 mb-4">
                    <div class="card-body p-4 p-md-5">
                        <span class="badge bg-primary mb-3 px-3 py-2 rounded-pill">Blog Akademik</span>
                        <h1 class="fw-bold mb-3">${post.title}</h1>
                        <p class="text-muted border-bottom pb-4 mb-4">
                            <i class="fa-solid fa-calendar me-2"></i> Dipublikasikan pada ${dateString}
                        </p>
                        
                        <div class="article-content">
                            ${post.content}
                        </div>
                    </div>
                </div>
            `;
            
            // Mengubah judul tab browser sesuai judul artikel Bapak
            document.title = `${post.title} | Denny R.W.A.`;
            
        } else {
            // Jika dokumen ID sudah terhapus atau tidak ditemukan
            articleContainer.innerHTML = `
                <div class="text-center py-5">
                    <h3 class="fw-bold text-danger">Artikel Tidak Ditemukan</h3>
                    <p class="text-muted">Artikel yang Bapak cari mungkin telah dihapus atau dipindahkan.</p>
                    <a href="index.html#blog" class="btn btn-primary mt-3">Kembali ke Beranda</a>
                </div>
            `;
        }
    } catch (error) {
        console.error("Gagal mengambil artikel:", error);
        articleContainer.innerHTML = `
            <div class="text-center py-5 text-danger">
                <i class="fa-solid fa-triangle-exclamation fs-1 mb-3"></i>
                <h5>Terjadi kesalahan koneksi.</h5>
                <p>Gagal menghubungi server database.</p>
            </div>
        `;
    }
});