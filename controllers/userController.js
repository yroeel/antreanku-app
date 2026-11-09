const db = require('../config/db');

// Mendapatkan data profil user berdasarkan ID
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const [users] = await db.query('SELECT user_id, name, email, phone, role FROM users WHERE user_id = ?', [userId]);

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
        }

        res.json({ success: true, data: users[0] });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data profil' });
    }
};