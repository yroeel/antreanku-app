const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. Ambil Antrean Hari Ini (Untuk Admin & Monitor)
router.get('/today', async (req, res) => {
    try {
        const query = `
            SELECT 
                q.queue_id, 
                q.queue_number, 
                q.status, 
                q.created_at,
                u.name AS patient_name, 
                d.specialization, 
                doc_u.name AS doctor_name
            FROM queues q
            LEFT JOIN users u ON q.patient_id = u.user_id
            LEFT JOIN schedules s ON q.schedule_id = s.schedule_id
            LEFT JOIN doctors d ON s.doctor_id = d.doctor_id
            LEFT JOIN users doc_u ON d.user_id = doc_u.user_id
            ORDER BY q.queue_id ASC
        `;
        const [rows] = await db.query(query);
        res.json({ success: true, data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. Ambil Nomor Antrean Pasien (Register)
router.post('/register', async (req, res) => {
    try {
        const { patient_id, user_id, schedule_id } = req.body;
        const targetPatientId = patient_id || user_id || 1;

        if (!schedule_id) {
            return res.status(400).json({ success: false, message: 'Jadwal dokter harus dipilih!' });
        }

        // Generate Nomor Antrean (A-001, A-002, dst)
        const [countResult] = await db.query(`SELECT COUNT(*) AS total FROM queues WHERE DATE(created_at) = CURDATE()`);
        const nextNum = (countResult[0].total || 0) + 1;
        const queueNumber = `A-${String(nextNum).padStart(3, '0')}`;

        // Simpan ke MySQL dengan 3 variabel parameter lengkap (termasuk queueNumber)
        const [insertResult] = await db.query(
            `INSERT INTO queues (patient_id, schedule_id, queue_number, status) VALUES (?, ?, ?, 'waiting')`,
            [targetPatientId, schedule_id, queueNumber]
        );

        // Ambil detail dokter/poli untuk info balikan
        const [detail] = await db.query(`
            SELECT d.specialization, doc_u.name AS doctor_name 
            FROM schedules s
            JOIN doctors d ON s.doctor_id = d.doctor_id
            JOIN users doc_u ON d.user_id = doc_u.user_id
            WHERE s.schedule_id = ?
        `, [schedule_id]);

        const spec = detail.length > 0 ? detail[0].specialization : 'Poli Umum';
        const docName = detail.length > 0 ? detail[0].doctor_name : 'Dokter';

        res.status(201).json({
            success: true,
            data: {
                queue_id: insertResult.insertId,
                queue_number: queueNumber,
                specialization: spec,
                doctor_name: docName
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal mengambil antrean', error: err.message });
    }
});

// 3. Panggil Antrean Berikutnya (Admin)
router.post('/call-next', async (req, res) => {
    try {
        const [waiting] = await db.query(`
            SELECT q.queue_id, q.queue_number, u.name AS patient_name, d.specialization
            FROM queues q
            LEFT JOIN users u ON q.patient_id = u.user_id
            LEFT JOIN schedules s ON q.schedule_id = s.schedule_id
            LEFT JOIN doctors d ON s.doctor_id = d.doctor_id
            WHERE q.status = 'waiting'
            ORDER BY q.queue_id ASC LIMIT 1
        `);

        if (waiting.length === 0) {
            return res.json({ success: false, message: 'Tidak ada antrean menunggu.' });
        }

        const nextQueue = waiting[0];
        await db.query(`UPDATE queues SET status = 'calling' WHERE queue_id = ?`, [nextQueue.queue_id]);

        res.json({ success: true, data: nextQueue });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;