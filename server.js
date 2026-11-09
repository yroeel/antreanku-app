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

// Konfigurasi CORS agar frontend online (Vercel/Netlify) bisa mengakses API
app.use(cors());
app.use(express.json());

// Rute Pengujian Server (Health Check untuk Cloud Hosting)
app.get('/', (req, res) => {
    res.json({ 
        status: 'Online',
        message: 'Selamat datang di API Antreanku!' 
    });
});

// Mounting Rute API
app.use('/api/antrean', antreanRoutes); // Jalur utama untuk frontend
app.use('/api/queues', antreanRoutes);  // Alias pendukung
app.use('/api/auth', authRoutes);
app.use('/api/reports', laporanRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);

// Port Dinamis dari Provider Hosting (Fallback ke 5000 jika dijalankan lokal)
const PORT = process.env.PORT || 5000;

// Binding host ke '0.0.0.0' wajib untuk server cloud seperti Render
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Berhasil Terhubung ke Database & Server Antreanku berjalan di port ${PORT}`);
});