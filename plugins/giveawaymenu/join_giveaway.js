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
    name: "join_giveaway",
    alias: ["join_giveaway", ".join_giveaway"],
    run: async ({ naze, m }) => {
        if (!m.isGroup) return naze.sendMessage(m.chat, { text: "❌ Fitur ini hanya bisa digunakan di grup." }, { quoted: m });

        // Load data giveaway dari database
        let giveaways = loadGiveaways();

        // Cek apakah ada giveaway aktif di grup ini
        const activeGiveaway = giveaways.find(g => g.groupId === m.chat && g.status === 'active');
        if (!activeGiveaway) {
            return naze.sendMessage(m.chat, { text: "❌ Tidak ada giveaway aktif di grup ini!" }, { quoted: m });
        }

        // Cek apakah user sudah terdaftar
        if (!activeGiveaway.participants.some(user => user.id === m.sender)) {
            activeGiveaway.participants.push({ id: m.sender });
            saveGiveaways(giveaways);
            const position = activeGiveaway.participants.length;
            return naze.sendMessage(m.chat, { text: `✅ @${m.sender.split('@')[0]} berhasil ikut giveaway! \nKamu berada di urutan ke-${position}.`, mentions: [m.sender] }, { quoted: m });
        } else {
            return naze.sendMessage(m.chat, { text: "❌ Kamu sudah terdaftar di giveaway ini!" }, { quoted: m });
        }
    }
};