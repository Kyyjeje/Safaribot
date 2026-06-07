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

module.exports = {
    name: "delete_giveaway",
    alias: ["delete_giveaway", ".delete_giveaway"],
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
        const giveawayIndex = giveaways.findIndex(g => g.groupId === m.chat && g.status === 'active');
        if (giveawayIndex === -1) {
            return naze.sendMessage(m.chat, { text: "❌ Tidak ada giveaway yang sedang berlangsung di grup ini." }, { quoted: m });
        }

        // Hapus giveaway dari database
        giveaways.splice(giveawayIndex, 1);
        saveGiveaways(giveaways);

        return naze.sendMessage(m.chat, { text: "✅ Giveaway berhasil dihapus!" }, { quoted: m });
    }
};