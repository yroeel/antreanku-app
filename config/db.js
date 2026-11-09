const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'defaultdb',
    port: process.env.DB_PORT || 16480,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com') 
        ? { rejectUnauthorized: false } 
        : false
});

(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Terhubung ke MySQL Aiven Cloud');

        // 1. Buat Tabel Users jika belum ada
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nama VARCHAR(100),
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Tambahkan kolom pendukung secara aman jika belum ada di Aiven
        const alterQueries = [
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS user_id INT AUTO_INCREMENT UNIQUE;`,
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(100);`,
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);`,
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '-';`,
            `ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'patient';`
        ];

        for (const q of alterQueries) {
            try {
                await connection.query(q);
            } catch (err) {
                // Abaikan jika sintaks IF NOT EXISTS tidak didukung versi MySQL tertentu
            }
        }

        // 3. Buat Tabel Antrean
        await connection.query(`
            CREATE TABLE IF NOT EXISTS antrean (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nomor_antrean VARCHAR(20) NOT NULL,
                nama_pasien VARCHAR(100) NOT NULL,
                layanan VARCHAR(50) NOT NULL,
                status ENUM('menunggu', 'dipanggil', 'selesai', 'dibatalkan') DEFAULT 'menunggu',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('✅ Skema Tabel Database Aiven Berhasil Diselaraskan!');
        connection.release();
    } catch (error) {
        console.error('❌ Error Init Database:', error.message);
    }
})();

module.exports = pool;
