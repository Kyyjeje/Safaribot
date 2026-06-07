module.exports = {
    name: "ceksifat",
    run: async ({ naze, m }) => {
        if (!m.isGroup) return m.reply("Fitur ini hanya bisa digunakan di dalam grup.");

        const sifatPositif = [
            "Bijak", "Sabar", "Kreatif", "Humoris", "Mudah bergaul", "Mandiri", "Setia", "Jujur",
            "Dermawan", "Idealis", "Adil", "Sopan", "Tekun", "Rajin", "Pemaaf", "Murah hati",
            "Ceria", "Percaya diri", "Penyayang", "Disiplin", "Optimis", "Berani", "Bersyukur",
            "Bertanggung jawab", "Bisa diandalkan", "Tenang", "Kalem", "Logis"
        ];

        const sifatNegatif = [
            "Sombong", "Minder", "Pendendam", "Sensitif", "Perfeksionis", "Caper", "Pelit", "Egois",
            "Pesimis", "Penyendiri", "Manipulatif", "Labil", "Penakut", "Vulgar", "Tidak setia",
            "Pemalas", "Kasar", "Rumit", "Boros", "Keras kepala", "Tidak bijak", "Pembelot",
            "Serakah", "Tamak", "Penggosip", "Rasis", "Ceroboh", "Intoleran"
        ];

        const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];
        const getRandomPercentage = () => Math.floor(Math.random() * 100) + "%";

        const targetUser = m.mentionedJid?.[0] || m.sender;
        const username = `@${targetUser.split("@")[0]}`;

        const message = `✨ *Analisis Sifat* ✨\n\n` +
                        `👤 *Nama*: ${username}\n\n` +
                        `💖 *Kepribadian Positif:* ${pickRandom(sifatPositif)}\n` +
                        `⚡ *Kelemahan:* ${pickRandom(sifatNegatif)}\n\n` +
                        `📊 *Penilaian Karakter:*\n` +
                        `💪 Keberanian: *${getRandomPercentage()}*\n` +
                        `🤝 Kepedulian: *${getRandomPercentage()}*\n` +
                        `😟 Kecemasan: *${getRandomPercentage()}*\n` +
                        `😱 Ketakutan: *${getRandomPercentage()}*\n` +
                        `🌟 Akhlak Baik: *${getRandomPercentage()}*\n` +
                        `👹 Akhlak Buruk: *${getRandomPercentage()}*\n\n` +
                        `🌿 Hasil ini hanya untuk hiburan, jangan terlalu serius ya!`;

        naze.sendMessage(m.chat, { text: message, mentions: [targetUser] }, { quoted: m });
    }
};
