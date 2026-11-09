document.addEventListener('DOMContentLoaded', async () => {
    // 1. Cek sesi login user
    const user = requireAuth();

    // 2. Ambil data profil terbaru dari Backend API
    try {
        const response = await fetch(`${API_BASE_URL}/users/profile/${user.user_id}`);
        const result = await response.json();

        if (result.success) {
            const data = result.data;
            document.getElementById('profileUserName').innerText = data.name;
            document.getElementById('profileUserEmail').innerText = data.email || 'pasien@antreanku.com';
        } else {
            // Fallback ke data LocalStorage jika API gagal
            document.getElementById('profileUserName').innerText = user.name || 'Pasien';
            document.getElementById('profileUserEmail').innerText = user.email || 'pasien@antreanku.com';
        }
    } catch (error) {
        console.error('Gagal memuat profil:', error);
        document.getElementById('profileUserName').innerText = user.name || 'Pasien';
    }
});

// Fungsi Logout
function handleProfileLogout() {
    if (confirm('Apakah Anda yakin ingin keluar dari akun ini?')) {
        logoutUser();
    }
}