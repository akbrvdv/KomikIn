document.addEventListener('DOMContentLoaded', function() {

    // =========================================================================
    // BAGIAN 1: FUNGSI UNIVERSAL (Berjalan di setiap halaman)
    // =========================================================================

    /**
     * Mengelola tampilan navbar, khususnya ikon profil.
     * Mengisi inisial nama pengguna di ikon profil.
     */
    function manageNavbar() {
        const profileIcon = document.getElementById('profile-icon');
        if (profileIcon) {
            const username = localStorage.getItem('username') || 'U';
            profileIcon.textContent = username.charAt(0).toUpperCase();
        }
    }

    // Panggil fungsi navbar di setiap halaman
    manageNavbar();

    // =========================================================================
    // BAGIAN 2: LOGIKA SPESIFIK UNTUK SETIAP HALAMAN
    // =========================================================================

    // --- Logika Halaman Login & Register ---
    const loginForm = document.querySelector('form[action="dashboard.html"]');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
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
                        <div class="comic-card-body">
                            <h3>${comic.title}</h3>
                            <p>${mainGenre}</p>
                        </div>
                    </div>
                </a>`;
        }
        
        async function fetchComics() {
            try {
                const response = await fetch('http://localhost:3000/api/comics');
                if (!response.ok) throw new Error('Gagal mengambil data dari server');
                const result = await response.json();
                allComics = result.data;
                renderComics();
                renderRecommendations();
            } catch (error) {
                console.error("Error fetching comics:", error);
                latestGrid.innerHTML = `<p style='color: salmon;'>Gagal memuat data. Pastikan server backend berjalan.</p>`;
            }
        }

        function renderComics() {
            if (!latestGrid) return;
            latestGrid.innerHTML = "";
            if (allComics.length > 0) {
                allComics.forEach(comic => { latestGrid.innerHTML += createComicCard(comic); });
            } else {
                latestGrid.innerHTML = "<p style='color: var(--text-muted);'>Belum ada komik. Tambahkan melalui panel admin.</p>";
            }
        }
        
        function renderRecommendations() {
            if (!recGrid) return;
            recGrid.innerHTML = "";
            const recommendations = [...allComics].sort(() => 0.5 - Math.random()).slice(0, 6);
            recommendations.forEach(comic => { recGrid.innerHTML += createComicCard(comic); });
        }
        
        fetchComics();
    }

    // --- Logika Halaman Profil ---
    if (window.location.pathname.includes('profile.html')) {
        const usernameEl = document.getElementById('profile-username');
        const initialEl = document.getElementById('profile-initial');
        const logoutBtn = document.getElementById('logout-btn');
        const favoritesGrid = document.getElementById('favorites-grid');
        const editProfileBtn = document.querySelector('.btn-edit-profile');
        const settingsTabBtn = document.querySelector('[data-tab="tab-settings"]');
        const editProfileForm = document.getElementById('edit-profile-form');
        const editUsernameInput = document.getElementById('edit-username');
        const successMessageEl = document.getElementById('success-message');
        const tabs = document.querySelectorAll('.tab-link');
        const tabContents = document.querySelectorAll('.tab-content');
        const favoritesCountEl = document.getElementById('favorites-count');

        const currentUsername = localStorage.getItem('username') || 'User';
        usernameEl.textContent = currentUsername;
        initialEl.textContent = currentUsername.charAt(0).toUpperCase();
        editUsernameInput.value = currentUsername;

        editProfileBtn.addEventListener('click', () => {
            settingsTabBtn.click();
        });
        
        editProfileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newUsername = editUsernameInput.value.trim();
            if (newUsername) {
                localStorage.setItem('username', newUsername);
                usernameEl.textContent = newUsername;
                initialEl.textContent = newUsername.charAt(0).toUpperCase();
                manageNavbar();
                successMessageEl.textContent = "Perubahan berhasil disimpan!";
                setTimeout(() => { successMessageEl.textContent = ""; }, 3000);
            }
        });

        logoutBtn.addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin logout?')) {
                localStorage.clear();
                window.location.href = 'index.html';
            }
        });

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(item => item.classList.remove('active'));
                tabContents.forEach(item => item.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tab.dataset.tab).classList.add('active');
            });
        });

        async function displayFavorites() {
            const favoriteIds = JSON.parse(localStorage.getItem('myFavorites')) || [1,3];
            if (favoritesCountEl) {
                favoritesCountEl.textContent = favoriteIds.length;
            }
            if (favoriteIds.length === 0) {
                favoritesGrid.innerHTML = "<p>Anda belum punya komik favorit.</p>";
                return;
            }
            try {
                const response = await fetch('http://localhost:3000/api/comics');
                const result = await response.json();
                const allComics = result.data;
                const favoriteComics = allComics.filter(comic => favoriteIds.includes(comic.id));
                favoritesGrid.innerHTML = "";
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

        // --- Logika Halaman Detail Komik ---
    if (window.location.pathname.includes('detail.html')) {
        const mainContent = document.getElementById('comic-detail-page');
        const urlParams = new URLSearchParams(window.location.search);
        const comicId = urlParams.get('id');

        async function fetchComicDetails() {
            if (!comicId) {
                mainContent.innerHTML = "<p>ID Komik tidak ditemukan.</p>";
                return;
            }

            try {
                // Ambil detail komik dan daftar chapter secara bersamaan
                const [comicRes, chaptersRes] = await Promise.all([
                    fetch(`http://localhost:3000/api/comics/${comicId}`),
                    fetch(`http://localhost:3000/api/comics/${comicId}/chapters`)
                ]);

                if (!comicRes.ok) throw new Error('Komik tidak ditemukan');
                
                const comicResult = await comicRes.json();
                const chaptersResult = await chaptersRes.json();
                
                const comic = comicResult.data;
                const chapters = chaptersResult.data;

                displayComicDetails(comic, chapters);

            } catch (error) {
                mainContent.innerHTML = `<p style="color: salmon;">${error.message}</p>`;
            }
        }

        function displayComicDetails(comic, chapters) {
            // Format tanggal rilis chapter
            const formatDate = (dateString) => {
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                return new Date(dateString).toLocaleDateString('id-ID', options);
            };

            let chapterListHTML = chapters.map(ch => `
                <a href="reader.html?chapterId=${ch.id}" class="chapter-item">
                    <span class="chapter-title">Chapter ${ch.chapter_number}</span>
                    <span class="release-date">${formatDate(ch.release_date)}</span>
                </a>
            `).join('');

            if (chapters.length === 0) {
                chapterListHTML = "<p>Belum ada chapter untuk komik ini.</p>";
            }

            mainContent.innerHTML = `
                <header class="comic-detail-header">
                    <img src="${comic.cover}" alt="Cover ${comic.title}" class="comic-cover-large">
                    <div class="comic-info">
                        <h1>${comic.title}</h1>
                        <p class="author">by ${comic.author}</p>
                        <p class="synopsis">${comic.synopsis}</p>
                        <div class="actions">
                            <button class="btn-read">Baca Sekarang</button>
                            <button class="btn-favorite">⭐ Tambah Favorit</button>
                        </div>
                    </div>
                </header>
                <section class="chapter-list-section">
                    <h2>Daftar Chapter</h2>
                    <div class="chapter-list">
                        ${chapterListHTML}
                    </div>
                </section>
            `;
        }

        fetchComicDetails();
    }

    // --- Fitur Toggle Password (Untuk login.html & register.html) ---
    const passwordInput = document.getElementById('password');
    const togglePasswordButton = document.getElementById('password-toggle-btn');
    if (passwordInput && togglePasswordButton) {
        togglePasswordButton.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.textContent = type === 'password' ? 'Show' : 'Hide';
        });
    }
});