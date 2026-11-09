/**
 * Helper Utilitas Aplikasi Antreanku
 */

// Format nomor tiket antrean (Contoh: 1 -> A-001)
const formatTicketNumber = (number, prefix = 'A') => {
    const padded = String(number).padStart(3, '0');
    return `${prefix}-${padded}`;
};

// Format tanggal ke Bahasa Indonesia (Contoh: 2026-11-04 -> Rabu, 4 November 2026)
const formatDateIndonesian = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
};

// Helper standar pembentukan response JSON API
const apiResponse = (res, statusCode, success, message, data = null) => {
    return res.status(statusCode).json({
        success,
        message,
        data
    });
};

module.exports = {
    formatTicketNumber,
    formatDateIndonesian,
    apiResponse
};