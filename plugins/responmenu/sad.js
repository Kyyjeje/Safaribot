const fs = require('fs');
const path = require('path');

module.exports = {
    name: "sedih",
    alias: ["galau", "🥺🥺", "🥺","sad"],
    category: "fun",
    desc: "Mengirimkan voice note galau secara acak",
    run: async ({ naze, m }) => {
        try {
            if (!m || !m.chat) {
                console.error("[ERROR] Objek pesan (m) tidak valid!");
                return;
            }

            const soundDir = path.join(__dirname, '../../data/assets/galau');

            // Cek apakah folder ada
            if (!fs.existsSync(soundDir)) {
                console.error("[ERROR] Folder sound tidak ditemukan!");
                return naze.sendMessage(m.chat, { text: "⚠️ *Folder sound tidak ditemukan!*" }, { quoted: m });
            }

            // Ambil semua file dalam folder
            const soundFiles = fs.readdirSync(soundDir);
            if (soundFiles.length === 0) {
                console.error("[ERROR] Tidak ada file sound di folder galau!");
                return naze.sendMessage(m.chat, { text: "⚠️ *Tidak ada file sound di folder galau!*" }, { quoted: m });
            }

            // Pilih file sound secara acak
            const randomSound = soundFiles[Math.floor(Math.random() * soundFiles.length)];
            const soundPath = path.join(soundDir, randomSound);

            // Cek apakah file ada sebelum dikirim
            if (!fs.existsSync(soundPath)) {
                console.error(`[ERROR] File tidak ditemukan: ${soundPath}`);
                return;
            }

            // Kirim voice note
            await naze.sendMessage(m.chat, { 
                audio: { url: soundPath }, 
                mimetype: 'audio/mp4',
                ptt: true
            }, { quoted: m });

            console.log(`[LOG] VN terkirim: ${randomSound}`);

        } catch (error) {
            console.error("[ERROR] Terjadi kesalahan saat mengirim voice note:", error);
            naze.sendMessage(m.chat, { text: "❌ *Terjadi kesalahan saat mengirim voice note!*" }, { quoted: m });
        }
    }
};
