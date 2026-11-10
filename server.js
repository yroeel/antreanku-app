const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Impor Rute
const antreanRoutes = require('./routes/antreanRoutes');
const authRoutes = require('./routes/authRoutes');
const laporanRoutes = require('./routes/laporanRoutes');
const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');

const app = express();

// Konfigurasi CORS & Parser
app.use(cors());
app.use(express.json());

// Endpoint Utama (Health Check)
app.get('/', (req, res) => {
    res.json({ 
        status: 'Online',
        message: 'API Antreanku Berhasil Berjalan di Vercel!' 
    });
});

app.get('/api', (req, res) => {
    res.json({ 
        status: 'Online',
        message: 'API Antreanku Berhasil Berjalan di Vercel!' 
    });
});

// Mounting Rute API
app.use('/api/antrean', antreanRoutes);
app.use('/api/queues', antreanRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reports', laporanRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);

// Export untuk Vercel Serverless Function
module.exports = app;
