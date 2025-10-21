// script.js (Versi dengan Halaman Profil)

document.addEventListener('DOMContentLoaded', function() {
    // =========================================================================
    // BAGIAN 1: LOGIKA UNIVERSAL & FUNGSI BERSAMA
    // =========================================================================

    function manageNavbar() {
        const profileIcon = document.getElementById('profile-icon');
        
        // Fungsi ini hanya mencari ikon profil dan mengisi inisial nama pengguna
        if (profileIcon) {
            const username = localStorage.getItem('username') || 'U';
            profileIcon.textContent = username.charAt(0).toUpperCase();
        }
    }
    manageNavbar(); // Panggil di setiap halaman

    // =========================================================================
    // BAGIAN 2: LOGIKA SPESIFIK UNTUK SETIAP HALAMAN
    // =========================================================================

    // --- Logika Halaman Login & Register ---
    if (document.querySelector('form[action="dashboard.html"]')) {
        document.querySelector('form[action="dashboard.html"]').addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = document.getElementById('email').value;
            const username = emailInput.split('@')[0] || "User";
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            window.location.href = 'dashboard.html';
        });
    }
    
    // --- Logika Halaman Dashboard ---
    if (window.location.pathname.includes('dashboard.html')) {
        const latestGrid = document.getElementById('latest-updates-grid');
        const recGrid = document.getElementById('recommendations-grid');
        let allComics = [];

        function createComicCard(comic) {
            const mainGenre = comic.genre ? comic.genre.split(',')[0].trim() : 'N/A';
            return `
                <a href="detail.html?id=${comic.id}" class="comic-card-link">
                    <div class="comic-card">
                        <img src="${comic.cover}" alt="Cover ${comic.title}">
                        <div class="comic-card-body"><h3>${comic.title}</h3><p>${mainGenre}</p></div>
                    </div>
                </a>`;
        }
        
        async function fetchComics() {
            try {
                const response = await fetch('http://localhost:3000/api/comics');
                const result = await response.json();
                allComics = result.data;
                renderComics();
                renderRecommendations();
            } catch (error) {
                console.error("Error fetching comics:", error);
                latestGrid.innerHTML = `<p style='color: salmon;'>Gagal memuat data. Pastikan server backend berjalan.</p>`;
            }
        }

        function renderComics() { /* ... fungsi renderComics dashboard ... */ }
        function renderRecommendations() { /* ... fungsi renderRecommendations dashboard ... */ }
        
        fetchComics();
    }
    
    // --- Logika Halaman Profil ---
    if (window.location.pathname.includes('profile.html')) {
        const usernameEl = document.getElementById('profile-username');
        const initialEl = document.getElementById('profile-initial');
        const logoutBtn = document.getElementById('logout-btn');
        const favoritesGrid = document.getElementById('favorites-grid');
        // Di dalam blok: if (window.location.pathname.includes('profile.html'))

        const tabs = document.querySelectorAll('.tab-link');
        const tabContents = document.querySelectorAll('.tab-content');
        const favoritesCountEl = document.getElementById('favorites-count');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Hapus kelas 'active' dari semua tab dan konten
                tabs.forEach(item => item.classList.remove('active'));
                tabContents.forEach(item => item.classList.remove('active'));

                // Tambahkan kelas 'active' ke tab yang di-klik dan konten yang sesuai
                tab.classList.add('active');
                document.getElementById(tab.dataset.tab).classList.add('active');
            });
        });

        // Di dalam fungsi displayFavorites(), setelah mendapatkan favoriteIds
        if (favoritesCountEl) {
            favoritesCountEl.textContent = favoriteIds.length;
        }

        // Isi info profil
        const username = localStorage.getItem('username') || 'User';
        usernameEl.textContent = username;
        initialEl.textContent = username.charAt(0).toUpperCase();

        // Fungsi logout
        logoutBtn.addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin logout?')) {
                localStorage.clear();
                window.location.href = 'index.html';
            }
        });

        // Tampilkan komik favorit (masih simulasi via localStorage)
        // NOTE: Anda perlu menambahkan cara untuk menyimpan favorit terlebih dahulu
        // Untuk sekarang, kita bisa berpura-pura sudah ada favorit
        localStorage.setItem('myFavorites', JSON.stringify([1, 3])); // Contoh favorit

        async function displayFavorites() {
            const favoriteIds = JSON.parse(localStorage.getItem('myFavorites')) || [];
            if (favoriteIds.length === 0) {
                favoritesGrid.innerHTML = "<p>Anda belum punya komik favorit.</p>";
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/comics');
                const result = await response.json();
                const allComics = result.data;
                
                const favoriteComics = allComics.filter(comic => favoriteIds.includes(comic.id));
                
                favoritesGrid.innerHTML = ""; // Kosongkan
                favoriteComics.forEach(comic => {
                    const mainGenre = comic.genre ? comic.genre.split(',')[0].trim() : 'N/A';
                    favoritesGrid.innerHTML += `
                        <a href="detail.html?id=${comic.id}" class="comic-card-link">
                            <div class="comic-card">
                                <img src="${comic.cover}" alt="Cover ${comic.title}">
                                <div class="comic-card-body"><h3>${comic.title}</h3><p>${mainGenre}</p></div>
                            </div>
                        </a>`;
                });
            } catch (error) {
                favoritesGrid.innerHTML = "<p style='color: salmon;'>Gagal memuat komik favorit.</p>";
            }
        }

        displayFavorites();
    }
});