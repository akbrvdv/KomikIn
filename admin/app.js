// admin/app.js
document.getElementById('add-comic-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const messageEl = document.getElementById('message');
    // Buat objek FormData
    const formData = new FormData();

    // Tambahkan semua data teks ke formData
    formData.append('title', document.getElementById('title').value);
    formData.append('author', document.getElementById('author').value);
    formData.append('genre', document.getElementById('genre').value);
    formData.append('synopsis', document.getElementById('synopsis').value);

    // Ambil file dari input dan tambahkan ke formData
    const coverFile = document.getElementById('cover').files[0];
    if (coverFile) {
        formData.append('cover', coverFile);
    }

    try {
        // Kirim formData ke server
        const response = await fetch('http://localhost:3000/api/comics', {
            method: 'POST',
            // PENTING: Jangan set header 'Content-Type'. 
            // Browser akan otomatis mengaturnya ke 'multipart/form-data'.
            body: formData, 
        });

        const result = await response.json();

        if (response.ok) {
            messageEl.textContent = 'Komik berhasil ditambahkan!';
            messageEl.style.color = 'lightgreen';
            this.reset(); // Kosongkan form setelah berhasil
        } else {
            throw new Error(result.error || 'Gagal menambahkan komik');
        }

    } catch (error) {
        messageEl.textContent = 'Error: ' + error.message;
        messageEl.style.color = 'salmon';
    }
});