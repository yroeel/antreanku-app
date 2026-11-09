const db = require('../config/db'); // Sesuaikan dengan koneksi DB kamu
const bcrypt = require('bcryptjs'); // Menggunakan bcryptjs

const DoctorModel = {
    // Tambah Dokter + Profil Dokter + Jadwal (Transaction)
    createDoctorWithSchedule: (data, callback) => {
        const { name, email, password, phone, specialization, str_number, day_of_week, start_time, end_time, max_quota } = data;

        // Hash password menggunakan bcryptjs
        bcrypt.hash(password || 'password123', 10, (err, hashedPassword) => {
            if (err) return callback(err);

            db.beginTransaction((err) => {
                if (err) return callback(err);

                // Step 1: Insert ke tabel users
                const sqlUser = `INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, 'doctor')`;
                db.query(sqlUser, [name, email, hashedPassword, phone], (err, resUser) => {
                    if (err) return db.rollback(() => callback(err));

                    const userId = resUser.insertId;

                    // Step 2: Insert ke tabel doctors
                    const sqlDoctor = `INSERT INTO doctors (user_id, specialization, str_number) VALUES (?, ?, ?)`;
                    db.query(sqlDoctor, [userId, specialization, str_number], (err, resDoc) => {
                        if (err) return db.rollback(() => callback(err));

                        const doctorId = resDoc.insertId;

                        // Step 3: Insert ke tabel schedules
                        const sqlSchedule = `INSERT INTO schedules (doctor_id, day_of_week, start_time, end_time, max_quota) VALUES (?, ?, ?, ?, ?)`;
                        db.query(sqlSchedule, [doctorId, day_of_week, start_time, end_time, max_quota || 30], (err, resSched) => {
                            if (err) return db.rollback(() => callback(err));

                            db.commit((err) => {
                                if (err) return db.rollback(() => callback(err));
                                callback(null, { doctorId, scheduleId: resSched.insertId });
                            });
                        });
                    });
                });
            });
        });
    },

    // Ambil semua jadwal dokter untuk ditampilkan di frontend
    getAllSchedules: (callback) => {
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
        db.query(query, callback);
    }
};

module.exports = DoctorModel;