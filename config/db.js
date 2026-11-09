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
        console.log('✅ Berhasil Terhubung ke Database MySQL Aiven Cloud');

        // Otomatis buat/sesuaikan Tabel Users
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                id INT,
                name VARCHAR(100),
                nama VARCHAR(100),
                email VARCHAR(100) NOT NULL UNIQUE,
                username VARCHAR(50),
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20) DEFAULT '-',
                role VARCHAR(20) DEFAULT 'patient',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Otomatis buat Tabel Antrean
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

        console.log('✅ Tabel Database Antreanku Siap!');
        connection.release();
    } catch (error) {
        console.error('❌ Error Init Database:', error.message);
    }
})();

module.exports = pool;
