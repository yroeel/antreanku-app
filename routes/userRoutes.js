const express = require('express');
const router = express.Router();

// Endpoint dasar users
router.get('/', (req, res) => {
    res.json({ success: true, message: 'Endpoint user aktif' });
});

module.exports = router;