require('../../settings');
const fetch = require("node-fetch");
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const gameFile = path.join(rootDir, 'database', 'games.json');

// Pastikan direktori dan file games.json ada
function ensureGameFile() {
    const dir = path.dirname(gameFile);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(gameFile)) {
        fs.writeFileSync(gameFile, '{}', 'utf8');
    }
}

// Fungsi untuk memuat data games
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

// Fungsi untuk menyimpan data games
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
    { soal: "Hewan apa yang paling pendiam?", jawaban: "Semute" },
    { soal: "Planet terbesar di tata surya?", jawaban: "Jupiter" },
    { soal: "Ibu kota Indonesia?", jawaban: "Jakarta" }
];

module.exports = {
    name: 'asahotak',
    alias: ['.asahotak'],
    run: async ({ naze, m }) => {
        let games = loadGames();

        if (games[m.chat]) {
            return m.reply('⚠️ *Permainan sudah aktif di chat ini!* Tunggu hingga selesai atau jawab soal yang ada.');
        }

        let soal, jawaban;
        try {
            const response = await fetch('https://api.siputzx.my.id/api/games/asahotak', {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            if (!response.ok) {
                throw new Error(`API error! Status: ${response.status} ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`API did not return JSON! Content-Type: ${contentType}, Response: ${text.slice(0, 100)}...`);
            }

            const result = await response.json();
            if (!result.status || !result.data || !result.data.soal || !result.data.jawaban) {
                throw new Error('Invalid API response structure');
            }

            soal = result.data.soal;
            jawaban = result.data.jawaban;
        } catch (e) {
            console.error("[ERROR] Gagal mengambil soal asah otak:", e.message);
            const randomIndex = Math.floor(Math.random() * fallbackQuestions.length);
            const fallback = fallbackQuestions[randomIndex];
            soal = fallback.soal;
            jawaban = fallback.jawaban;
            await m.reply('⚠️ *Gagal mengambil soal dari server, menggunakan soal cadangan.*');
        }

        try {
            const waktu = 60;

            const soalMessage = await naze.sendMessage(m.chat, {
                text: `🧠 *Permainan Asah Otak Dimulai!* 🧠\n\n💡 *Soal:*\n${soal}\n\n⏳ Waktu: *${waktu} detik*\n✍️ Reply pesan ini untuk menjawab!\n💡 Ketik *bantuan* untuk meminta bantuan (maksimal 3 kali).\n🏳️ Ketik *nyerah* untuk menyerah.`
            }, { quoted: m });

            games[m.chat] = {
                gameName: 'asahotak',
                soal,
                jawaban,
                messageId: soalMessage.key.id,
                startTime: Date.now(),
                duration: waktu,
                bantuanCount: 0
            };
            saveGames(games);

            // Inisialisasi global.activeTimers jika belum ada
            if (!global.activeTimers) {
                global.activeTimers = {};
            }

            const timerId = setTimeout(async () => {
                games = loadGames();
                if (games[m.chat] && games[m.chat].gameName === 'asahotak') {
                    await naze.sendMessage(m.chat, {
                        text: `⏰ *Waktu habis!* ⏰\n\nJawaban yang benar adalah: *${games[m.chat].jawaban}*.\nPermainan selesai! 🎮`
                    });
                    delete games[m.chat];
                    if (global.activeTimers[m.chat]) {
                        delete global.activeTimers[m.chat]; // Hapus timer dari memori global
                    }
                    saveGames(games);
                }
            }, waktu * 1000);

            global.activeTimers[m.chat] = timerId; // Simpan timer di memori global

        } catch (e) {
            console.error("[ERROR] Gagal memulai permainan asah otak:", e);
            m.reply('❌ Terjadi kesalahan saat memulai permainan. Coba lagi nanti!');
            delete games[m.chat];
            if (global.activeTimers && global.activeTimers[m.chat]) {
                delete global.activeTimers[m.chat]; // Bersihkan timer jika ada error
            }
            saveGames(games);
        }
    }
};