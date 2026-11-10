const mysql = require('mysql2/promise');
require('dotenv').config();

// Buat pool koneksi yang aman untuk Vercel Serverless & Aiven Cloud
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'defaultdb',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 16480,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;
