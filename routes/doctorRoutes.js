const express = require('express');
const router = express.Router();
const DoctorModel = require('../models/doctorModel');

// GET: Ambil Semua Jadwal Dokter
router.get('/schedules', async (req, res) => {
    try {
        const results = await DoctorModel.getAllSchedules();
        res.json({
            success: true,
            data: results
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data jadwal dokter.',
            error: err.message
        });
    }
});

// POST: Tambah Dokter & Jadwal Baru (Admin)
router.post('/add', async (req, res) => {
    try {
        const result = await DoctorModel.createDoctorWithSchedule(req.body);
        res.status(201).json({
            success: true,
            message: 'Dokter dan jadwal praktik berhasil ditambahkan!',
            data: result
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.code === 'ER_DUP_ENTRY' ? 'Email atau STR sudah terdaftar!' : 'Gagal menambahkan dokter.',
            error: err.message
        });
    }
});

module.exports = router;