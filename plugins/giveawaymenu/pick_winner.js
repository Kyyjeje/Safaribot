require('../../settings');
const fs = require('fs');
const path = require('path');

// Lokasi file database menggunakan __dirname
const dbPath = path.join(__dirname, '../../database/giveaways.json');

// Fungsi untuk memastikan folder database ada
const ensureDatabaseDir = () => {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Fungsi untuk membaca database dengan penanganan error
const loadGiveaways = () => {
    ensureDatabaseDir();
    try {
        if (!fs.existsSync(dbPath)) {
            fs.writeFileSync(dbPath, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(dbPath, 'utf8');
        if (!data || data.trim() === '') {
            fs.writeFileSync(dbPath, JSON.stringify([]));
            return [];
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('Error parsing giveaways.json:', error.message);
        fs.writeFileSync(dbPath, JSON.stringify([]));
        return [];
    }
};

// Fungsi untuk menyimpan ke database
const saveGiveaways = (data) => {
    ensureDatabaseDir();
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving giveaways.json:', error.message);
    }
};

// Fungsi untuk memilih pemenang secara acak
const pickRandomWinners = (participants, winnerCount) => {
    const shuffled = [...participants].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(winnerCount, shuffled.length));
};

module.exports = {
    name: "pick_winner",
    alias: ["pick_winner", ".pick_winner"],
    run: async ({ naze, m }) => {
        if (!m.isGroup) return naze.sendMessage(m.chat, { text: "❌ Fitur ini hanya bisa digunakan di grup." }, { quoted: m });

        let groupMetadata = await naze.groupMetadata(m.chat).catch(() => null);
        if (!groupMetadata) return m.reply("❌ Gagal mengambil data grup.");

        let isAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin || m.sender === groupMetadata.owner;
        if (!isAdmin) return naze.sendMessage(m.chat, { text: "❌ Fitur ini hanya bisa digunakan oleh admin/owner grup." }, { quoted: m });

        // Load data giveaway dari database
        let giveaways = loadGiveaways();

        // Cek apakah database kosong
        if (giveaways.length === 0) {
            return naze.sendMessage(m.chat, { text: "❌ Tidak ada daftar giveaway." }, { quoted: m });
        }

        // Cari giveaway aktif di grup ini
        const activeGiveaway = giveaways.find(g => g.groupId === m.chat && g.status === 'active');
        if (!activeGiveaway) {
            return naze.sendMessage(m.chat, { text: "❌ Tidak ada giveaway yang sedang berlangsung di grup ini." }, { quoted: m });
        }

        // Cek apakah ada peserta
        if (!activeGiveaway.participants || activeGiveaway.participants.length === 0) {
            return naze.sendMessage(m.chat, { text: "❌ Tidak ada orang yang ikut giveaway di grup ini." }, { quoted: m });
        }

        // Ambil jumlah pemenang yang diharapkan
        const winnerCount = activeGiveaway.winners;
        const participants = activeGiveaway.participants;

        // Pilih pemenang secara acak
        const winners = pickRandomWinners(participants, winnerCount);

        // Buat daftar peserta (seperti di list_giveaway)
        const participantList = activeGiveaway.participants.map((user, i) => `${i + 1}. @${user.id.split('@')[0]}`).join("\n");

        // Buat daftar pemenang dengan nomor urut
        const winnerList = winners.map((user, i) => `${i + 1}. @${user.id.split('@')[0]}`).join("\n");

        // Cek apakah jumlah pemenang kurang dari yang diharapkan
        let additionalMessage = '';
        if (winners.length < winnerCount) {
            const missingWinners = winnerCount - winners.length;
            additionalMessage = `\n\n⚠️ *Pemenang kurang ${missingWinners} orang* karena jumlah peserta tidak mencukupi.`;
        }

        // Buat pesan dengan format mirip list_giveaway
        let message = `🎉 *Detail Giveaway di ${activeGiveaway.groupName}* 🎉\n\n` +
                      `📜 *Hadiah*: ${activeGiveaway.prize}\n` +
                      `🏆 *Jumlah Pemenang*: ${activeGiveaway.winners} orang\n` +
                      `⏰ *Dibuat Pada*: ${new Date(activeGiveaway.createdAt).toLocaleString()}\n` +
                      `📊 *Status*: ${activeGiveaway.status}\n\n` +
                      `📋 *Daftar Peserta (${activeGiveaway.participants.length} orang)* \n\n` +
                      `🏅 *Pemenang Giveaway:*\n${winnerList}${additionalMessage}`;

        // Ubah status giveaway menjadi finished
        activeGiveaway.status = 'finished';
        saveGiveaways(giveaways);

        // Kirim pesan dengan mention ke semua peserta dan pemenang
        const mentions = activeGiveaway.participants.map(u => u.id);
        return naze.sendMessage(m.chat, { text: message, mentions }, { quoted: m });
    }
};