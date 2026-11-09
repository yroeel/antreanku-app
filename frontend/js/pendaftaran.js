// Memastikan user sudah login & mengambil data user
const user = requireAuth();
let currentQueueNumber = null;

document.addEventListener('DOMContentLoaded', () => {
    const queueForm = document.getElementById('queueForm');

    if (queueForm) {
        queueForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const payload = {
                schedule_id: document.getElementById('schedule').value,
                patient_id: user.user_id,
                complaint: document.getElementById('complaint').value
            };

            try {
                const response = await fetch(`${API_BASE_URL}/queues/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (result.success) {
                    currentQueueNumber = result.data.queue_number;
                    const formattedNum = `A-${String(result.data.queue_number).padStart(3, '0')}`;
                    
                    document.getElementById('ticketNumber').innerText = formattedNum;
                    document.getElementById('ticketResult').style.display = 'block';
                    alert(`Nomor antrean ${formattedNum} berhasil diambil!`);
                } else {
                    alert(result.message || 'Gagal mengambil nomor antrean.');
                }
            } catch (error) {
                console.error('Error register queue:', error);
                alert('Gagal terhubung ke server.');
            }
        });
    }
});

// Fungsi Membuka Halaman Cetak Tiket Struk di Tab Baru
function openPrintWindow() {
    if (!currentQueueNumber) {
        alert('Nomor antrean belum tersedia.');
        return;
    }
    const patientName = encodeURIComponent(user.name || 'Pasien');
    window.open(`cetak-tiket.html?number=${currentQueueNumber}&name=${patientName}`, '_blank');
}

// Fungsi Membatalkan Antrean Pasien
async function cancelQueue() {
    if (!confirm('Apakah Anda yakin ingin membatalkan antrean ini?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/queues/cancel-by-patient`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                queue_number: currentQueueNumber,
                patient_id: user.user_id,
                schedule_id: document.getElementById('schedule').value
            })
        });

        const result = await response.json();

        if (result.success) {
            alert('Antrean berhasil dibatalkan.');
            document.getElementById('ticketResult').style.display = 'none';
        } else {
            alert(result.message || 'Gagal membatalkan antrean.');
        }
    } catch (error) {
        console.error('Error cancel queue:', error);
        alert('Gagal membatalkan antrean.');
    }
}