document.addEventListener('DOMContentLoaded', function() {

    // --- PENGATURAN EFEK KETIK ---
    const typedTextSpan = document.getElementById('typed-text');
    const textArray = ["Sesuatu yang baru akan tiba.", "Sebuah dunia dalam panel.", "Proyek KomikIn.", "Tunggu tanggal mainnya..."];
    let textArrayIndex = 0;
    let charIndex = 0;

    function type() {
        if (textArrayIndex < textArray.length) {
            if (charIndex < textArray[textArrayIndex].length) {
                typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
                charIndex++;
                setTimeout(type, 100); // Kecepatan mengetik
            } else {
                setTimeout(erase, 2000); // Waktu jeda sebelum menghapus
            }
        }
    }

    function erase() {
        if (charIndex > 0) {
            typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
            charIndex--;
            setTimeout(erase, 50); // Kecepatan menghapus
        } else {
            textArrayIndex++;
            if (textArrayIndex >= textArray.length) {
                textArrayIndex = 0; // Ulangi dari awal
            }
            setTimeout(type, 1300); // Jeda sebelum mengetik kalimat baru
        }
    }

    // --- PENGATURAN COUNTDOWN ---
    // GANTI TANGGAL TARGET DI SINI! Format: "Bulan Hari, Tahun Jam:Menit:Detik"
    const targetDate = new Date("Jan 1, 2026 00:00:00").getTime();

    const countdownFunction = setInterval(function() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        // Perhitungan waktu
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Tampilkan hasilnya di HTML
        document.getElementById('days').innerText = days < 10 ? '0' + days : days;
        document.getElementById('hours').innerText = hours < 10 ? '0' + hours : hours;
        document.getElementById('minutes').innerText = minutes < 10 ? '0' + minutes : minutes;
        document.getElementById('seconds').innerText = seconds < 10 ? '0' + seconds : seconds;

        // Jika waktu habis
        if (distance < 0) {
            clearInterval(countdownFunction);
            document.getElementById("countdown").innerHTML = "WAKTUNYA TELAH TIBA!";
        }
    }, 1000);

    // Mulai efek ketik saat halaman dimuat
    type();
});