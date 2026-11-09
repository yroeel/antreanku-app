// Proteksi Halaman Khusus Admin
const adminUser = requireAuth('admin');

document.addEventListener('DOMContentLoaded', () => {
    // Set default tanggal input ke hari ini
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('filterDate').value = today;
    fetchDailyReport();
});

async function fetchDailyReport() {
    const selectedDate = document.getElementById('filterDate').value;
    const token = localStorage.getItem('antreanku_token');

    try {
        const response = await fetch(`${API_BASE_URL}/reports/daily?date=${selectedDate}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (result.success) {
            updateReportUI(result);
        } else {
            alert(result.message || 'Gagal memuat laporan.');
        }
    } catch (error) {
        console.error('Error fetching report:', error);
        alert('Gagal terhubung ke server untuk memuat laporan.');
    }
}

function updateReportUI(reportData) {
    const stats = reportData.statistics;
    const rows = reportData.data;

    // Update Angka Ringkasan
    document.getElementById('reportTotal').innerText = stats.total_patients || 0;
    document.getElementById('reportCompleted').innerText = stats.total_completed || 0;
    document.getElementById('reportCancelled').innerText = (stats.total_cancelled + stats.total_skipped) || 0;

    // Render Tabel
    const tbody = document.getElementById('reportTableBody');
    if (!rows || rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Tidak ada data antrean pada tanggal ini.</td></tr>`;
        return;
    }

    tbody.innerHTML = rows.map(item => `
        <tr>
            <td><strong>A-${String(item.queue_number).padStart(3, '0')}</strong></td>
            <td>${item.patient_name}</td>
            <td>${item.patient_phone || '-'}</td>
            <td>${item.complaint || '-'}</td>
            <td><span class="badge badge-${item.status}">${getStatusLabel(item.status)}</span></td>
            <td>${new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
        </tr>
    `).join('');
}

function getStatusLabel(status) {
    const labels = {
        waiting: 'Menunggu',
        called: 'Dipanggil',
        completed: 'Selesai',
        skipped: 'Dilewati',
        cancelled: 'Dibatalkan'
    };
    return labels[status] || status;
}