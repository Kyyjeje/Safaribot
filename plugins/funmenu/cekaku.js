const topCommand = require('../botmenu/topcommand');
module.exports = {
    name: "cekaku",
    run: async ({ naze, m }) => {
        topCommand.incrementFeatureUsage('cekaku'); // Kirim nama fitur langsung
        if (!m.isGroup) return m.reply("Fitur ini hanya bisa digunakan di grup!");

        const getUsername = (id) => naze.getName(id) || `@${id.split('@')[0]}`;
        const username = getUsername(m.sender);

        const sifat = ["Baik", "Tidak ramah", "Chapri", "Nibba/nibbi", "Mengganggu", "Rusak", "Orang marah", "Sopan", "Beban", "Hebat", "Cringe", "Pembohong"];
        const hobi = ['Memasak', 'Menari', 'Bermain', 'Bermain game', 'Melukis', 'Membantu Orang Lain', 'Menonton anime', 'Membaca', 'Bersepeda', 'Bernyanyi', 'Berbincang-bincang', 'Berbagi Meme', 'Menggambar', 'Menghabiskan Uang Orang Tua', 'Bermain Truth or Dare', 'Menghabiskan Waktu Sendirian'];
        const percentages = Array.from({ length: 100 }, (_, i) => (i + 1) + '%');
        const cakep = ['Ya', 'Tidak', 'Sangat jelek', 'Sangat tampan'];
        const watak = ['Peduli', 'Murah hati', 'Orang marah', 'Maaf', 'Tunduk', 'Baik', 'Maafkan aku', 'Berhati baik', 'Sabar', 'UwU', 'Terbaik', 'Membantu'];

        const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

        const profileText = `*≡《 👤 Check ${username} 》≡*\n\n` +
                            `*🌟 Nama:* ${m.pushName || 'Tanpa Nama'}\n` +
                            `*🧬 Karakteristik:* ${pickRandom(sifat)}\n` +
                            `*🎨 Hobi:* ${pickRandom(hobi)}\n` +
                            `*❤️ Bucin Level:* ${pickRandom(percentages)}\n` +
                            `*💪 Greatness Level:* ${pickRandom(percentages)}\n` +
                            `*💋 Ganteng/Cantik:* ${pickRandom(cakep)}\n` +
                            `*🌈 Watak:* ${pickRandom(watak)}\n` +
                            `*👍 Moral Baik:* ${pickRandom(percentages)}\n` +
                            `*👎 Moral Buruk:* ${pickRandom(percentages)}\n` +
                            `*🧠 Kecerdasan:* ${pickRandom(percentages)}\n` +
                            `*🛡️ Keberanian:* ${pickRandom(percentages)}\n` +
                            `*😱 Penakut:* ${pickRandom(percentages)}\n`;

        naze.sendMessage(m.chat, { text: profileText }, { quoted: m });
    }
};