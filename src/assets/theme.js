// src/assets/theme.js

document.addEventListener("DOMContentLoaded", () => {
    // 1. Logika Mode Gelap (Dark Mode) adaptif
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
            if(themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
            if(themeText) themeText.textContent = 'Mode Terang';
            if(themeToggleBtn) {
                themeToggleBtn.classList.replace('btn-outline-light', 'btn-light');
                themeToggleBtn.classList.add('text-dark');
            }
        } else {
            if(themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
            if(themeText) themeText.textContent = 'Mode Gelap';
            if(themeToggleBtn) {
                themeToggleBtn.classList.replace('btn-light', 'btn-outline-light');
                themeToggleBtn.classList.remove('text-dark');
            }
        }
    }
    
    // 2. Menutup menu mobile otomatis jika tautan diklik
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