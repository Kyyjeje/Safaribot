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

module.exports = {
    name: "list_giveaway",
    alias: ["list_giveaway", ".list_giveaway"],
    run: async ({ naze, m }) => {
        const botNumber = await naze.decodeJid(naze.user.id);
    	const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

		if (!isOwner) return m.reply(mess.owner)
        if (!m.isGroup) return naze.sendMessage(m.chat, { text: "❌ Fitur ini hanya bisa digunakan di grup." }, { quoted: m });

        // Load data giveaway dari database
        let giveaways = loadGiveaways();

        // Cari giveaway aktif di grup ini
        const activeGiveaway = giveaways.find(g => g.groupId === m.chat && g.status === 'active');
        if (!activeGiveaway) {
            return naze.sendMessage(m.chat, { text: "❌ Tidak ada giveaway aktif di grup ini!" }, { quoted: m });
        }

        // Cek apakah ada peserta
        if (!activeGiveaway.participants || activeGiveaway.participants.length === 0) {
            return naze.sendMessage(m.chat, { text: "❌ Belum ada yang ikut giveaway di grup ini." }, { quoted: m });
        }

        // Buat daftar peserta dengan nomor urut sesuai urutan di database
        const list = activeGiveaway.participants.map((user, i) => `${i + 1}. @${user.id.split('@')[0]}`).join("\n");

        // Buat pesan dengan detail giveaway
        const message = `🎉 *Detail Giveaway di ${activeGiveaway.groupName}* 🎉\n\n` +
                        `📜 *Hadiah*: ${activeGiveaway.prize}\n` +
                        `🏆 *Jumlah Pemenang*: ${activeGiveaway.winners} orang\n` +
                        `⏰ *Dibuat Pada*: ${new Date(activeGiveaway.createdAt).toLocaleString()}\n` +
                        `📊 *Status*: ${activeGiveaway.status}\n\n` +
                        `📋 *Daftar Peserta (${activeGiveaway.participants.length} orang):*\n${list}`;

        // Kirim pesan dengan mention ke semua peserta
        return naze.sendMessage(m.chat, { text: message, mentions: activeGiveaway.participants.map(u => u.id) }, { quoted: m });
    }
};