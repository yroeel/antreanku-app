// Proteksi Halaman Admin & Ambil Data User
const adminUser = requireAuth('admin');

const SCHEDULE_ID = 1; // Default Poli Umum
let currentActiveQueue = null;

// Initialization saat dokumen siap
document.addEventListener('DOMContentLoaded', () => {
    if (adminUser) {
        document.getElementById('adminName').innerText = `Halo, ${adminUser.name}`;
    }
    loadDashboardData();
    // Auto-refresh data tabel & statistik setiap 3 detik (Polling)
    setInterval(loadDashboardData, 3000);
});

// 1. Ambil Data Real-time dari Backend Express
async function loadDashboardData() {
    try {
        const response = await fetch(`${API_BASE_URL}/queues/dashboard/realtime/${SCHEDULE_ID}`);
        const result = await response.json();

        if (result.success) {
            const data = result.data;
            updateDashboardUI(data);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// 2. Render UI Dashboard & Update Tabel
function updateDashboardUI(data) {
    // Update Panggilan Aktif
    if (data.active_call) {
        currentActiveQueue = data.active_call;
        document.getElementById('currentCallingNumber').innerText = `A-${String(data.active_call.queue_number).padStart(3, '0')}`;
        document.getElementById('currentCallingPatient').innerText = data.active_call.patient_name;
    } else {
        currentActiveQueue = null;
        document.getElementById('currentCallingNumber').innerText = '---';
        document.getElementById('currentCallingPatient').innerText = 'Belum ada antrean dipanggil';
    }

    // Update Statistik Box
    document.getElementById('statTotal').innerText = data.statistics.total_queue || 0;
    document.getElementById('statWaiting').innerText = data.statistics.waiting_count || 0;
    document.getElementById('statCompleted').innerText = data.statistics.completed_count || 0;
    document.getElementById('statSkipped').innerText = data.statistics.skipped_count || 0;

    // Update Tabel Antrean Hari Ini
    const tbody = document.getElementById('queueTableBody');
    if (!data.queue_list || data.queue_list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Belum ada pendaftaran antrean hari ini.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.queue_list.map(q => `
        <tr>
            <td><strong>A-${String(q.queue_number).padStart(3, '0')}</strong></td>
            <td>${q.patient_name}</td>
            <td>${q.complaint || '-'}</td>
            <td>${new Date(q.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
            <td><span class="badge badge-${q.status}">${getStatusLabel(q.status)}</span></td>
            <td>
                ${q.status === 'waiting' ? `
                    <button class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.85rem;" 
                            onclick="callSpecificQueue(${q.queue_id}, ${q.queue_number}, '${q.patient_name}')">
                        Panggil
                    </button>
                ` : '-'}
            </td>
        </tr>
    `).join('');
}

// 3. Fitur Pemanggilan Antrean FCFS Berikutnya
async function callNextQueue() {
    try {
        // Ambil antrean waiting pertama
        const resNext = await fetch(`${API_BASE_URL}/queues/next/${SCHEDULE_ID}`);
        const resultNext = await resNext.json();

        if (!resultNext.success || !resultNext.data) {
            alert('Tidak ada antrean yang menunggu.');
            return;
        }

        const queue = resultNext.data;
        await changeQueueStatus(queue.queue_id, 'called');
        
        // Bunyikan Suara Pemanggilan
        speakQueueNumber(queue.queue_number, queue.patient_name);
        loadDashboardData();
    } catch (error) {
        console.error('Error calling next queue:', error);
        alert('Gagal memanggil antrean.');
    }
}

// 4. Panggil Ulang Suara Antrean Saat Ini
function recallCurrentQueue() {
    if (!currentActiveQueue) {
        alert('Tidak ada antrean aktif yang sedang dipanggil.');
        return;
    }
    speakQueueNumber(currentActiveQueue.queue_number, currentActiveQueue.patient_name);
}

// 5. Update Status Antrean Aktif (Completed / Skipped)
async function updateCurrentStatus(newStatus) {
    if (!currentActiveQueue) {
        alert('Tidak ada antrean aktif untuk diubah statusnya.');
        return;
    }
    await changeQueueStatus(currentActiveQueue.queue_id, newStatus);
    loadDashboardData();
}

// Helper: Panggil Antrean Spesifik dari Tabel
async function callSpecificQueue(queueId, queueNumber, patientName) {
    await changeQueueStatus(queueId, 'called');
    speakQueueNumber(queueNumber, patientName);
    loadDashboardData();
}

// Helper: Kirim Request Patch Status ke Backend API (Menggunakan JWT Token)
async function changeQueueStatus(queueId, status) {
    const token = localStorage.getItem('antreanku_token');
    try {
        const response = await fetch(`${API_BASE_URL}/queues/${queueId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        return await response.json();
    } catch (error) {
        console.error('Error changing status:', error);
    }
}

// 6. Integrasi Pemanggilan Suara (Web Speech API - Voice Bahasa Indonesia)
function speakQueueNumber(queueNumber, patientName) {
    if (!('speechSynthesis' in window)) {
        alert('Browser Anda tidak mendukung fitur pemanggilan suara (Web Speech API).');
        return;
    }

    // Hentikan suara yang sedang berjalan jika ada
    window.speechSynthesis.cancel();

    const formattedNumber = String(queueNumber);
    const textToSpeak = `Nomor antrean, A, ${formattedNumber}, atas nama ${patientName}, silahkan menuju ke ruang periksa Poli Umum.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'id-ID';
    utterance.rate = 0.9;  // Kecepatan bicara (sedikit diperlambat agar jelas)
    utterance.pitch = 1.0; // Nada suara murni

    // Pilih suara Bahasa Indonesia jika tersedia di sistem OS/Browser
    const voices = window.speechSynthesis.getVoices();
    const indonesianVoice = voices.find(voice => voice.lang.includes('id') || voice.lang.includes('ID'));
    if (indonesianVoice) {
        utterance.voice = indonesianVoice;
    }

    window.speechSynthesis.speak(utterance);
}

// Helper Label Badge Status
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