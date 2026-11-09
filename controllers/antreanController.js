const pool = require('../config/db');
const AntreanModel = require('../models/antreanModel');

// Pastikan ada kata 'exports.' sebelum nama fungsi registerQueue
exports.registerQueue = async (req, res) => {
    const { schedule_id, patient_id, complaint } = req.body;

    if (!schedule_id || !patient_id) {
        return res.status(400).json({ success: false, message: 'schedule_id dan patient_id wajib diisi.' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [existing] = await connection.query(
            `SELECT queue_id FROM queues 
             WHERE schedule_id = ? AND patient_id = ? AND queue_date = CURRENT_DATE() AND status != 'cancelled'`,
            [schedule_id, patient_id]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Anda sudah mendaftar antrean untuk hari ini.' });
        }

        const [schedules] = await connection.query(
            `SELECT max_quota FROM schedules WHERE schedule_id = ? AND is_active = 1 FOR UPDATE`,
            [schedule_id]
        );

        if (schedules.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Jadwal dokter tidak aktif.' });
        }

        const maxQuota = schedules[0].max_quota;

        const [countResult] = await connection.query(
            `SELECT COUNT(queue_id) AS total, COALESCE(MAX(queue_number), 0) + 1 AS next_number 
             FROM queues WHERE schedule_id = ? AND queue_date = CURRENT_DATE()`,
            [schedule_id]
        );

        if (countResult[0].total >= maxQuota) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Kuota antrean hari ini telah penuh.' });
        }

        const nextQueueNumber = countResult[0].next_number;

        const [insertResult] = await connection.query(
            `INSERT INTO queues (schedule_id, patient_id, queue_number, queue_date, complaint, status)
             VALUES (?, ?, ?, CURRENT_DATE(), ?, 'waiting')`,
            [schedule_id, patient_id, nextQueueNumber, complaint || '']
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Nomor antrean berhasil diambil.',
            data: { queue_id: insertResult.insertId, queue_number: nextQueueNumber, status: 'waiting' }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error register queue:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil nomor antrean.' });
    } finally {
        connection.release();
    }
};

exports.getNextQueue = async (req, res) => {
    try {
        const data = await AntreanModel.getNextQueue(req.params.schedule_id);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memuat antrean.' });
    }
};

exports.updateStatus = async (req, res) => {
    const { queue_id } = req.params;
    const { status } = req.body;

    try {
        const isUpdated = await AntreanModel.updateStatus(queue_id, status);
        if (!isUpdated) {
            return res.status(404).json({ success: false, message: 'Antrean tidak ditemukan.' });
        }
        res.json({ success: true, message: `Status diperbarui ke ${status}.` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal update status.' });
    }
};

exports.cancelByPatient = async (req, res) => {
    const { queue_number, patient_id, schedule_id } = req.body;

    try {
        const [existing] = await pool.query(
            `SELECT queue_id, status FROM queues 
             WHERE queue_number = ? AND patient_id = ? AND schedule_id = ? AND queue_date = CURRENT_DATE()`,
            [queue_number, patient_id, schedule_id]
        );

        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Antrean tidak ditemukan.' });
        }

        if (['called', 'completed'].includes(existing[0].status)) {
            return res.status(400).json({ success: false, message: 'Antrean sedang dipanggil atau selesai.' });
        }

        await AntreanModel.updateStatus(existing[0].queue_id, 'cancelled');
        res.json({ success: true, message: 'Antrean Anda berhasil dibatalkan.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal membatalkan antrean.' });
    }
};

exports.getDashboardData = async (req, res) => {
    try {
        const data = await AntreanModel.getDashboardData(req.params.schedule_id);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Gagal memuat dashboard.' });
    }
};