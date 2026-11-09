document.addEventListener('DOMContentLoaded', () => {
    // Ambil parameter dari URL (Contoh: cetak-tiket.html?number=1&name=Ahmad)
    const urlParams = new URLSearchParams(window.location.search);
    const queueNumber = urlParams.get('number') || '1';
    const patientName = urlParams.get('name') || 'Pasien';

    // Format nomor antrean (contoh: A-001)
    const formattedNum = `A-${String(queueNumber).padStart(3, '0')}`;
    
    document.getElementById('printQueueNumber').innerText = formattedNum;
    document.getElementById('printPatientName').innerText = patientName;
    
    // Set Timestamp Waktu Cetak
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('printTimestamp').innerText = `Dicetak: ${dateStr} - ${timeStr} WIB`;
});

// Fungsi Trigger Printer Browser
function executePrint() {
    window.print();
}