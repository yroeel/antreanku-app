-- ===================================================
-- Skema Database DDL: Antreanku Queue System
-- Database Engine: MySQL / MariaDB (InnoDB)
-- ===================================================

-- 1. Buat Database
CREATE DATABASE IF NOT EXISTS antreanku_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE antreanku_db;

-- 2. Tabel Users (Menyimpan data Admin, Dokter, dan Pasien)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('admin', 'patient', 'doctor') NOT NULL DEFAULT 'patient',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Tabel Doctors (Informasi Spesialisasi Dokter)
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    specialization VARCHAR(100) NOT NULL,
    str_number VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Tabel Schedules (Jadwal Operasional Praktek Dokter & Batas Kuota)
CREATE TABLE IF NOT EXISTS schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_quota INT NOT NULL DEFAULT 30,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Tabel Queues (Data Transaksi Antrean Pasien FCFS)
CREATE TABLE IF NOT EXISTS queues (
    queue_id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    patient_id INT NOT NULL,
    queue_number INT NOT NULL,
    queue_date DATE NOT NULL,
    status ENUM('waiting', 'called', 'completed', 'cancelled', 'skipped') NOT NULL DEFAULT 'waiting',
    complaint TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_patient_queue (schedule_id, patient_id, queue_date),
    UNIQUE KEY unique_queue_number (schedule_id, queue_date, queue_number),
    FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE RESTRICT,
    FOREIGN KEY (patient_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ===================================================
-- Data Awal / Seed Data (Default Password: password123)
-- Hash: $2a$10$w09Zk28R1aP/9i3N7j2Y/ePz184Hk10w4y0hX6Oq4G3aZq0123456
-- ===================================================

INSERT INTO users (user_id, name, email, password, phone, role) VALUES 
(1, 'Admin Klinik', 'admin@antreanku.com', '$2a$10$w09Zk28R1aP/9i3N7j2Y/ePz184Hk10w4y0hX6Oq4G3aZq0123456', '081234567890', 'admin'),
(2, 'dr. Andi Wijaya', 'doctor@antreanku.com', '$2a$10$w09Zk28R1aP/9i3N7j2Y/ePz184Hk10w4y0hX6Oq4G3aZq0123456', '081298765432', 'doctor'),
(3, 'Budi Santoso', 'budi@gmail.com', '$2a$10$w09Zk28R1aP/9i3N7j2Y/ePz184Hk10w4y0hX6Oq4G3aZq0123456', '085712345678', 'patient')
ON DUPLICATE KEY UPDATE user_id=user_id;

INSERT INTO doctors (doctor_id, user_id, specialization, str_number) VALUES 
(1, 2, 'Poli Umum', 'STR-12345678')
ON DUPLICATE KEY UPDATE doctor_id=doctor_id;

INSERT INTO schedules (schedule_id, doctor_id, day_of_week, start_time, end_time, max_quota, is_active) VALUES 
(1, 1, 'Tuesday', '08:00:00', '14:00:00', 30, 1)
ON DUPLICATE KEY UPDATE schedule_id=schedule_id;