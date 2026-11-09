const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'antreanku_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Diperlukan agar backend Vercel diizinkan terhubung ke SSL Aiven MySQL:
    ssl: process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com') 
        ? { rejectUnauthorized: false } 
        : false
});

(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Berhasil Terhubung ke Database MySQL');

        // Otomatis buat tabel users jika belum ada
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nama VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                username VARCHAR(50) UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'pasien', 'petugas') DEFAULT 'pasien',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Otomatis buat tabel antrean jika belum ada
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

        console.log('✅ Tabel-tabel database siap digunakan!');
        connection.release();
    } catch (error) {
        console.error('❌ Gagal Koneksi/Init Database:', error.message);
    }
})();

module.exports = pool;
