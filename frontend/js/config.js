// Variable Global Alamat API Backend untuk Frontend (Otomatis Lokal / Online)
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000/api'
    : 'https://antreanku-api.onrender.com/api'; // Gantilah dengan URL backend online Render kamu nanti