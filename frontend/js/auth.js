document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';

            // Ambil input email (fallback ke username jika elemen email tidak ada)
            const emailInput = (document.getElementById('email') || document.getElementById('username')).value.trim();
            const passwordInput = document.getElementById('password').value.trim();

            if (!emailInput || !passwordInput) {
                alert('Email dan password wajib diisi.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: emailInput,
                        username: emailInput,
                        password: passwordInput
                    })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    localStorage.setItem('token', result.token);
                    localStorage.setItem('user', JSON.stringify(result.user));

                    // Redireksi berdasarkan role
                    if (result.user && result.user.role === 'admin') {
                        window.location.href = 'index.html';
                    } else {
                        window.location.href = 'pendaftaran.html';
                    }
                } else {
                    alert(result.message || 'Login gagal. Periksa kembali email dan password Anda.');
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            } catch (error) {
                console.error('Error Login:', error);
                alert('Gagal terhubung ke server! Pastikan backend Node.js di port 5000 sudah berjalan.');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
});

function requireAuth() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(userStr);
}

function logoutUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}