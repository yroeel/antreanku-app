const db = require('../config/db');
const bcrypt = require('bcryptjs');

const DoctorModel = {
    // Tambah Dokter + Profil Dokter + Jadwal (Transaction Async/Await)
    createDoctorWithSchedule: async (data) => {
        const { name, email, password, phone, specialization, str_number, day_of_week, start_time, end_time, max_quota } = data;

        // Hash password
        const hashedPassword = await bcrypt.hash(password || 'password123', 10);

        // Ambil koneksi dari pool untuk transaksi
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Insert ke tabel users
            const [resUser] = await connection.query(
                `INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, 'doctor')`,
                [name, email, hashedPassword, phone]
            );
            const userId = resUser.insertId;

            // 2. Insert ke tabel doctors
            const [resDoc] = await connection.query(
                `INSERT INTO doctors (user_id, specialization, str_number) VALUES (?, ?, ?)`,
                [userId, specialization, str_number]
            );
            const doctorId = resDoc.insertId;

            // 3. Insert ke tabel schedules
            const [resSched] = await connection.query(
                `INSERT INTO schedules (doctor_id, day_of_week, start_time, end_time, max_quota) VALUES (?, ?, ?, ?, ?)`,
                [doctorId, day_of_week, start_time, end_time, max_quota || 30]
            );

            await connection.commit();
            connection.release();

            return { doctorId, scheduleId: resSched.insertId };
        } catch (err) {
            await connection.rollback();
            connection.release();
            throw err;
        }
    },

    // Ambil semua jadwal dokter untuk ditampilkan di frontend
    getAllSchedules: async () => {
        const query = `
            SELECT 
                d.doctor_id,
                u.name AS doctor_name,
                d.specialization,
                s.schedule_id,
                s.day_of_week,
                s.start_time,
                s.end_time,
                s.max_quota
            FROM schedules s
            JOIN doctors d ON s.doctor_id = d.doctor_id
            JOIN users u ON d.user_id = u.user_id
            WHERE s.is_active = 1
            ORDER BY d.doctor_id DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    }
};

module.exports = DoctorModel;