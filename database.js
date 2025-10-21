const mysql = require('mysql2');

// Konfigurasi untuk koneksi ke database XAMPP
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // User default XAMPP
    password: '',      // Password default XAMPP kosong
    database: 'komikin_db' // Nama database yang Anda buat
});

// Melakukan koneksi
connection.connect(error => {
    if (error) {
        console.error('Error saat menyambung ke database: ', error);
        return;
    }
    console.log('Berhasil terhubung ke database MySQL.');
});

module.exports = connection;