const pool = require('../config/db');

const AntreanModel = {
    // 1. Ambil antrean FCFS berikutnya (yang berstatus 'waiting' dan urutan paling kecil)
    getNextQueue: async (scheduleId) => {
        const [rows] = await pool.query(
            `SELECT q.queue_id, q.queue_number, q.queue_date, q.status, q.complaint, 
                    u.name AS patient_name, u.phone AS patient_phone
             FROM queues q
             JOIN users u ON q.patient_id = u.user_id
             WHERE q.schedule_id = ? AND q.queue_date = CURRENT_DATE() AND q.status = 'waiting'
             ORDER BY q.queue_number ASC LIMIT 1`,
            [scheduleId]
        );
        return rows[0] || null;
    },

    // 2. Update status antrean (called, completed, skipped, cancelled)
    updateStatus: async (queueId, status) => {
        const [result] = await pool.query(
            `UPDATE queues SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE queue_id = ?`,
            [status, queueId]
        );
        return result.affectedRows > 0;
    },

    // 3. Ambil data real-time untuk Dashboard Admin & Layar Monitor Pasien
    getDashboardData: async (scheduleId) => {
        // Antrean yang sedang dipanggil saat ini
        const [activeCall] = await pool.query(
            `SELECT q.queue_id, q.queue_number, u.name AS patient_name 
             FROM queues q
             JOIN users u ON q.patient_id = u.user_id
             WHERE q.schedule_id = ? AND q.queue_date = CURRENT_DATE() AND q.status = 'called'
             ORDER BY q.updated_at DESC LIMIT 1`,
            [scheduleId]
        );

        // Ringkasan statistik jumlah antrean hari ini
        const [stats] = await pool.query(
            `SELECT 
                COUNT(queue_id) AS total_queue,
                COUNT(CASE WHEN status = 'waiting' THEN 1 END) AS waiting_count,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_count,
                COUNT(CASE WHEN status = 'skipped' THEN 1 END) AS skipped_count
             FROM queues
             WHERE schedule_id = ? AND queue_date = CURRENT_DATE()`,
            [scheduleId]
        );

        // Daftar seluruh antrean hari ini urut nomor tiket
        const [queueList] = await pool.query(
            `SELECT q.queue_id, q.queue_number, q.status, q.created_at, q.complaint, u.name AS patient_name 
             FROM queues q
             JOIN users u ON q.patient_id = u.user_id
             WHERE q.schedule_id = ? AND q.queue_date = CURRENT_DATE()
             ORDER BY q.queue_number ASC`,
            [scheduleId]
        );

        return {
            active_call: activeCall[0] || null,
            statistics: stats[0],
            queue_list: queueList
        };
    }
};

module.exports = AntreanModel;