const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Impor Semua Rute
const antreanRoutes = require('./routes/antreanRoutes');
const authRoutes = require('./routes/authRoutes');
const laporanRoutes = require('./routes/laporanRoutes');
const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');

const app = express();

// Konfigurasi CORS
app.use(cors());
app.use(express.json());

// Rute Pengujian Server (Health Check)
app.get('/api', (req, res) => {
    res.json({ 
        status: 'Online',
        message: 'Selamat datang di API Antreanku!' 
    });
});

app.get('/', (req, res) => {
    res.json({ 
        status: 'Online',
        message: 'Selamat datang di API Antreanku!' 
    });
});

// Mounting Rute API
app.use('/api/antrean', antreanRoutes);
app.use('/api/queues', antreanRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reports', laporanRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);

// Jalankan app.listen HANYA jika dijalankan secara lokal (Bukan di lingkungan Vercel)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Server Antreanku berjalan di port ${PORT}`);
    });
}

// Wajib untuk Vercel Serverless Function:
module.exports = app;
