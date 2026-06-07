require('../../settings');
const fetch = require("node-fetch");
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const gameFile = path.join(rootDir, 'database', 'games.json');

// Objek untuk menyimpan timer di memori, bukan di JSON
const activeTimers = {};

function ensureGameFile() {
    const dir = path.dirname(gameFile);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(gameFile)) {
        fs.writeFileSync(gameFile, '{}', 'utf8');
    }
}

function loadGames() {
    try {
        ensureGameFile();
        const data = fs.readFileSync(gameFile, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.error("[ERROR] Gagal membaca games.json:", e.message);
        return {};
    }
}

function saveGames(games) {
    try {
        ensureGameFile();
        const data = JSON.stringify(games, null, 2);
        fs.writeFileSync(gameFile, data, 'utf8');
    } catch (e) {
        console.error("[ERROR] Gagal menyimpan games.json:", e.message);
        throw e;
    }
}

module.exports = {
    name: 'tebakgambar',
    alias: [ '.tebakgambar'],
    run: async ({ naze, m }) => {
        let games = loadGames();

        if (games[m.chat]) {
            return m.reply('⚠️ *Permainan sudah aktif di chat ini!* Tunggu hingga selesai atau jawab soal yang ada.');
        }

        let soalText, jawaban, thumbnailUrl, deskripsi;
        try {
            const response = await fetch('https://api.siputzx.my.id/api/games/tebakgambar', {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (!response.ok) {
                throw new Error(`API error! Status: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            if (!result.data || !result.data.img || !result.data.jawaban || !result.data.deskripsi) {
                throw new Error('Invalid API response structure');
            }

            soalText = `Tebak gambar ini!\n\n📝 *Deskripsi:* ${result.data.deskripsi}`;
            jawaban = result.data.jawaban;
            thumbnailUrl = result.data.img;
            deskripsi = result.data.deskripsi;
        } catch (e) {
            console.error("[ERROR] Gagal mengambil soal tebak gambar:", e.message);
            soalText = `Tebak gambar ini!\n\n📝 *Deskripsi:* Gambar mata dan huruf "RI".`;
            jawaban = "MATAHARI";
            thumbnailUrl = "https://www.cademedia.com/wp-content/uploads/2020/12/tebak-gambar-level-1-nomor-1.jpg";
            deskripsi = "Gambar mata dan huruf 'RI'.";
            await m.reply('⚠️ *Gagal mengambil soal dari server, menggunakan soal cadangan.*');
        }

        try {
            const waktu = 60;

            const soalMessage = await naze.sendMessage(m.chat, {
                text: `🎉 *Permainan Tebak Gambar Dimulai!* 🎉\n\n💡 *Soal:*\n${soalText}\n\n⏳ Waktu: *${waktu} detik*\n✍️ Reply pesan ini untuk menjawab!\n💡 Ketik *bantuan* untuk meminta bantuan (maksimal 3 kali).\n🏳️ Ketik *nyerah* untuk menyerah.`,
                contextInfo: {
                    forwardingScore: 10,
                    isForwarded: true,
                    externalAdReply: {
                        title: "Tebak Gambar",
                        body: "Lihat gambar di sini!",
                        previewType: "PHOTO",
                        thumbnailUrl: thumbnailUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            games[m.chat] = {
                gameName: 'tebakgambar',
                soal: soalText,
                jawaban,
                deskripsi,
                messageId: soalMessage.key.id,
                startTime: Date.now(),
                duration: waktu,
                bantuanCount: 0
            };
            saveGames(games);

            const timerId = setTimeout(async () => {
                games = loadGames();
                if (games[m.chat] && games[m.chat].gameName === 'tebakgambar') {
                    await naze.sendMessage(m.chat, {
                        text: `⏰ *Waktu habis!* ⏰\n\nJawaban yang benar adalah: *${games[m.chat].jawaban}*.\nPermainan selesai! 🎮`
                    });
                    delete games[m.chat];
                    delete activeTimers[m.chat];
                    saveGames(games);
                }
            }, waktu * 1000);

            activeTimers[m.chat] = timerId;

        } catch (e) {
            console.error("[ERROR] Gagal memulai permainan tebak gambar:", e);
            m.reply('❌ Terjadi kesalahan saat memulai permainan. Coba lagi nanti!');
            delete games[m.chat];
            delete activeTimers[m.chat];
            saveGames(games);
        }
    }
};