const pool = require('../config/db');

// 1. Rekap Laporan Harian berdasarkan Tanggal
exports.getDailyReport = async (req, res) => {
    const { date, schedule_id } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    try {
        let query = `
            SELECT 
                q.queue_id,
                q.queue_number,
                q.queue_date,
                q.status,
                q.complaint,
                q.created_at,
                q.updated_at,
                u.name AS patient_name,
                u.phone AS patient_phone,
                d.specialization,
                doc_user.name AS doctor_name
            FROM queues q
            JOIN users u ON q.patient_id = u.user_id
            JOIN schedules s ON q.schedule_id = s.schedule_id
            JOIN doctors d ON s.doctor_id = d.doctor_id
            JOIN users doc_user ON d.user_id = doc_user.user_id
            WHERE q.queue_date = ?
        `;
        const queryParams = [targetDate];

        if (schedule_id) {
            query += ` AND q.schedule_id = ?`;
            queryParams.push(schedule_id);
        }

        query += ` ORDER BY q.queue_number ASC`;

        const [rows] = await pool.query(query, queryParams);

        // Ringkasan Statistik Harian
        const [stats] = await pool.query(
            `SELECT 
                COUNT(queue_id) AS total_patients,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) AS total_completed,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS total_cancelled,
                COUNT(CASE WHEN status = 'skipped' THEN 1 END) AS total_skipped,
                COUNT(CASE WHEN status = 'waiting' THEN 1 END) AS total_waiting
             FROM queues 
             WHERE queue_date = ? ${schedule_id ? 'AND schedule_id = ?' : ''}`,
            queryParams
        );

        res.json({
            success: true,
            filter_date: targetDate,
            statistics: stats[0],
            data: rows
        });
    } catch (error) {
        console.error('Error getDailyReport:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil laporan harian.' });
    }
};

// 2. Rekap Laporan Bulanan untuk Grafik & Evaluasi
exports.getMonthlyReport = async (req, res) => {
    const { month, year } = req.query;
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || (new Date().getMonth() + 1);

    try {
        const [rows] = await pool.query(
            `SELECT 
                queue_date,
                COUNT(queue_id) AS total_patients,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled
             FROM queues
             WHERE MONTH(queue_date) = ? AND YEAR(queue_date) = ?
             GROUP BY queue_date
             ORDER BY queue_date ASC`,
            [currentMonth, currentYear]
        );

        res.json({
            success: true,
            month: currentMonth,
            year: currentYear,
            data: rows
        });
    } catch (error) {
        console.error('Error getMonthlyReport:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil laporan bulanan.' });
    }
};