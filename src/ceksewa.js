const fs = require('fs');

// Fungsi untuk memformat durasi
const clockString = (ms) => {
    if (ms === 0) return 'permanen';
    let days = Math.floor(ms / (24 * 60 * 60 * 1000));
    let hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    let minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    let seconds = Math.floor((ms % (60 * 1000)) / 1000);
    
    let result = [];
    if (days > 0) result.push(`${days} hari`);
    if (hours > 0) result.push(`${hours} jam`);
    if (minutes > 0) result.push(`${minutes} menit`);
    if (seconds > 0 && days === 0 && hours === 0 && minutes === 0) result.push(`${seconds} detik`);
    
    return result.length > 0 ? result.join(' ') : 'sebentar';
};

// Fungsi untuk menyimpan database
const saveDatabase = () => {
    const dbFile = './database.json';
    fs.writeFileSync(dbFile, JSON.stringify(global.db, null, 2));
};

// Fungsi untuk memeriksa sewa yang kedaluwarsa
const checkExpiredRentals = async (naze) => {
    try {
        const currentTime = +new Date();

        if (!global.db.sewabot) return;

        for (const groupId in global.db.sewabot) {
            const rental = global.db.sewabot[groupId];
            if (rental.expired !== 0 && rental.expired <= currentTime) {
                // Kirim pesan perpisahan ke grup
                const farewellMsg = `🌟 *Hai teman-teman!*\n\n` +
                    `Masa sewa bot di grup ini telah berakhir. Kami sangat berterima kasih atas kesempatan untuk menjadi bagian dari grup ini! 🙏\n\n` +
                    `Terima kasih atas kepercayaan kalian untuk menggunakan layanan kami. Jika ada kekurangan atau kesalahan selama bot berada di sini, kami mohon maaf sebesar-besarnya. 😊\n\n` +
                    `Jika kalian ingin bot kembali, hubungi owner kami untuk informasi lebih lanjut. Sampai jumpa di kesempatan berikutnya! 🚀\n\n` +
                    `> ${global.botname}`;
                await naze.sendMessage(groupId, {
                    text: farewellMsg,
                    contextInfo: {
                        externalAdReply: {
                            title: 'Bot WhatsApp',
                            body: 'Masa sewa telah berakhir. Terima kasih!',
                            thumbnailUrl: `${global.thumbnaillastsewa}`,
                            sourceUrl: rental.url,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                });

                // Keluar dari grup
                await naze.groupLeave(groupId);

                // Kirim notifikasi ke owner
                const durationMs = rental.expired - rental.joinedAt;
                const ownerMsg = `✅ *Bot Telah Keluar dari Grup*\n\n` +
                    `📅 *Tanggal Pesan*: ${new Date(rental.joinedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n` +
                    `🔔 *Tanggal Berakhir*: ${new Date(rental.expired).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n` +
                    `⏰ *Durasi Sewa*: ${clockString(durationMs)}\n` +
                    `🔗 *URL Grup*: ${rental.url}\n` +
                    `📅 *Waktu Keluar*: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n` +
                    `Bot telah menyelesaikan masa sewanya dengan sukses!`;
                await naze.sendFromOwner(global.owner, ownerMsg, null, { contextInfo: { isForwarded: true } });

                // Hapus dari database
                delete global.db.sewabot[groupId];
                saveDatabase();
                console.log(`[LOG] Sewa untuk grup ${groupId} telah kedaluwarsa dan dihapus dari database.`);
            }
        }
    } catch (e) {
        console.error('[ERROR] Kesalahan saat memeriksa sewa kedaluwarsa:', e);
    }
};

// Menjalankan pemeriksaan secara berkala
const startRentalCheckInterval = (naze) => {
    const INTERVAL = 10 * 1000; // Periksa setiap 10 detik
    const intervalId = setInterval(() => {
        checkExpiredRentals(naze);
    }, INTERVAL);

    // Mengembalikan fungsi untuk menghentikan interval
    return () => clearInterval(intervalId);
};

module.exports = { checkExpiredRentals, startRentalCheckInterval };