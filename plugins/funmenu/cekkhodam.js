module.exports = {
    name: "cekkhodam",
    description: '<nama>',
    run: async ({ naze, m, text, fetchJson }) => {
        if (!text) return m.reply("📖 *Cara Penggunaan:*\nKetik: *!cekkhodam [Nama Kamu]*\n\n📌 *Contoh:* !cekkhodam Budi");

        try {
            const data = await fetchJson("https://raw.githubusercontent.com/nazedev/database/refs/heads/master/random/cekkhodam.json");
            const hasil = data[Math.floor(Math.random() * data.length)];

            const message = `*🔮 Hasil Penelusuran Khodam*\n\n` +
                            `🔮 *Nama*: ${text}\n` +
                            `🕊️ *Khodam Anda*: *${hasil.nama}*\n\n` +
                            `📖 *Keterangan Khodam:*\n_${hasil.deskripsi}_`;

            naze.sendMessage(m.chat, { text: message }, { quoted: m });
        } catch (err) {
            m.reply("⚠️ Gagal mengambil data Khodam. Coba lagi nanti.");
        }
    }
};
