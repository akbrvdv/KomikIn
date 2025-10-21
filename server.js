// backend/server.js

const express = require('express');
const cors = require('cors');
const db = require('./database.js');
const multer = require('multer'); // Impor multer
const path = require('path');   // Impor path

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Middleware untuk menyajikan file statis dari folder 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Konfigurasi Multer untuk penyimpanan file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Tentukan folder penyimpanan
    },
    filename: function (req, file, cb) {
        // Buat nama file yang unik untuk menghindari konflik
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// === API ENDPOINTS ===

// API untuk MENGAMBIL semua data komik
app.get('/api/comics', (req, res) => {
    const sql = "SELECT * FROM comics ORDER BY lastUpdated DESC";
    db.query(sql, (err, results) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": results
        });
    });
});

// API untuk MENAMBAHKAN komik baru (sudah diubah untuk file upload)
app.post('/api/comics', upload.single('cover'), (req, res) => {
    const { title, author, genre, synopsis } = req.body;
    // Path ke file yang diupload akan tersedia di req.file.path
    // Kita juga perlu membuat URL yang bisa diakses dari frontend
    const coverUrl = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : null;

    const sql = `INSERT INTO comics (title, author, genre, synopsis, cover, lastUpdated) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [title, author, genre, synopsis, coverUrl, new Date()];

    db.query(sql, params, (err, results) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id: results.insertId, ...req.body, cover: coverUrl }
        });
    });
});

// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});