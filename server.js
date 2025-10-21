// server.js (Versi dengan Halaman Detail)

const express = require('express');
const cors = require('cors');
const db = require('./database.js');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// === API ENDPOINTS ===

// GET semua komik (Tidak berubah)
app.get('/api/comics', (req, res) => {
    const sql = "SELECT * FROM comics ORDER BY lastUpdated DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "success", "data": results });
    });
});

// POST komik baru (Tidak berubah)
app.post('/api/comics', upload.single('cover'), (req, res) => {
    const { title, author, genre, synopsis } = req.body;
    const coverUrl = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : null;
    const sql = `INSERT INTO comics (title, author, genre, synopsis, cover, lastUpdated) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [title, author, genre, synopsis, coverUrl, new Date()];
    db.query(sql, params, (err, results) => {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "success", "data": { id: results.insertId, ...req.body, cover: coverUrl }});
    });
});

// === ENDPOINT BARU ===

// 1. GET detail satu komik berdasarkan ID
app.get('/api/comics/:id', (req, res) => {
    const sql = "SELECT * FROM comics WHERE id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(400).json({ "error": err.message });
        if (result.length === 0) return res.status(404).json({ "error": "Comic not found" });
        res.json({ "message": "success", "data": result[0] });
    });
});

// 2. GET semua chapter untuk satu komik
app.get('/api/comics/:id/chapters', (req, res) => {
    const sql = "SELECT * FROM chapters WHERE comic_id = ? ORDER BY chapter_number DESC";
    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(400).json({ "error": err.message });
        res.json({ "message": "success", "data": results });
    });
});


// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});