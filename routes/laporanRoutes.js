const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// Endpoint Laporan (Hanya bisa diakses Admin)
router.get('/daily', verifyToken, authorizeRoles('admin'), laporanController.getDailyReport);
router.get('/monthly', verifyToken, authorizeRoles('admin'), laporanController.getMonthlyReport);

module.exports = router;