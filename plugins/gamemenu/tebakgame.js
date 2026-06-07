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

const fallbackQuestions = [
    { img: "https://telegra.ph/file/c403f026120b36463cb71.jpg", jawaban: "Guitar Hero" },
    { img: "https://telegra.ph/file/abc123def456ghi789jkl.jpg", jawaban: "Minecraft" }
];

module.exports = {
    name: 'tebakgame',
    alias: ['.tebakgame'],
    run: async ({ naze, m }) => {
        let games = loadGames();

        if (games[m.chat]) {
            return m.reply('⚠️ *Permainan sudah aktif di chat ini!* Tunggu hingga selesai atau jawab soal yang ada.');
        }

        let soalText, jawaban, thumbnailUrl;
        try {
            const response = await fetch('https://api.siputzx.my.id/api/games/tebakgame', {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (!response.ok) {
                throw new Error(`API error! Status: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            if (!result.status || !result.data || !result.data.img || !result.data.jawaban) {
                throw new Error('Invalid API response structure');
            }

            soalText = `Tebak nama game dari gambar ini!`;
            jawaban = result.data.jawaban;
            thumbnailUrl = result.data.img;
        } catch (e) {
            console.error("[ERROR] Gagal mengambil soal tebak game:", e.message);
            const randomIndex = Math.floor(Math.random() * fallbackQuestions.length);
            const fallback = fallbackQuestions[randomIndex];
            soalText = `Tebak nama game dari gambar ini!`;
            jawaban = fallback.jawaban;
            thumbnailUrl = fallback.img;
            await m.reply('⚠️ *Gagal mengambil soal dari server, menggunakan soal cadangan.*');
        }

        try {
            const waktu = 60;

            const soalMessage = await naze.sendMessage(m.chat, {
                text: `🎮 *Permainan Tebak Game Dimulai!* 🎮\n\n💡 *Soal:*\n${soalText}\n\n⏳ Waktu: *${waktu} detik*\n✍️ Reply pesan ini untuk menjawab!\n💡 Ketik *bantuan* untuk meminta bantuan (maksimal 2 kali).\n🏳️ Ketik *nyerah* untuk menyerah.`,
                contextInfo: {
                    forwardingScore: 10,
                    isForwarded: true,
                    externalAdReply: {
                        title: "Tebak Game",
                        body: "Lihat gambar game di sini!",
                        previewType: "PHOTO",
                        thumbnailUrl: thumbnailUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

            games[m.chat] = {
                gameName: 'tebakgame',
                soal: soalText,
                jawaban,
                messageId: soalMessage.key.id,
                startTime: Date.now(),
                duration: waktu,
                bantuanCount: 0
            };
            saveGames(games);

            const timerId = setTimeout(async () => {
                games = loadGames();
                if (games[m.chat] && games[m.chat].gameName === 'tebakgame') {
                    await naze.sendMessage(m.chat, {
                        text: `⏰ *Waktu habis!* ⏰\n\nJawaban yang benar adalah: *${games[m.chat].jawaban}*\nPermainan selesai! 🎮`
                    });
                    delete games[m.chat];
                    delete activeTimers[m.chat];
                    saveGames(games);
                }
            }, waktu * 1000);

            activeTimers[m.chat] = timerId;

        } catch (e) {
            console.error("[ERROR] Gagal memulai permainan tebak game:", e);
            m.reply('❌ Terjadi kesalahan saat memulai permainan. Coba lagi nanti!');
            delete games[m.chat];
            delete activeTimers[m.chat];
            saveGames(games);
        }
    }
};