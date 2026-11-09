const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.register = async (req, res) => {
    // Tangkap data dari frontend (fleksibel nama/nama lengkap)
    const name = req.body.name || req.body.nama;
    const { email, password, phone } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Semua kolom wajib diisi.' });
    }

    try {
        // Cek apakah email sudah terdaftar
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Email sudah terdaftar.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userPhone = phone || '-';
        const username = email.split('@')[0];

        let insertId;

        // Coba simpan dengan kolom lengkap
        try {
            const [result] = await pool.query(
                'INSERT INTO users (name, nama, username, email, password, phone, role) VALUES (?, ?, ?, ?, ?, ?, "patient")',
                [name, name, username, email, hashedPassword, userPhone]
            );
            insertId = result.insertId;
        } catch (dbErr) {
            // Fallback jika tabel MySQL Aiven hanya memiliki kolom dasar (nama, email, password)
            console.warn('Menggunakan fallback insert:', dbErr.message);
            const [result] = await pool.query(
                'INSERT INTO users (nama, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword]
            );
            insertId = result.insertId;
        }

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil! Silakan login.',
            data: { user_id: insertId, name, email }
        });

    } catch (error) {
        console.error('Error register:', error);
        res.status(500).json({ success: false, message: 'Gagal melakukan registrasi.' });
    }
};

// Fungsi login dan profile tetap seperti sebelumnya...
