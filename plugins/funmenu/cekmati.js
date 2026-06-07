module.exports = {
    name: "cekmati",
    run: async ({ naze, m }) => {
        if (!m.isGroup) return m.reply("Fitur ini hanya bisa digunakan di dalam grup.");
        const getRandomTime = () => ({
            years: Math.floor(Math.random() * 80) + 1,
            months: Math.floor(Math.random() * 12),
            days: Math.floor(Math.random() * 30),
            hours: Math.floor(Math.random() * 24),
            minutes: Math.floor(Math.random() * 60),
            seconds: Math.floor(Math.random() * 60)
        });

        const deathTime = getRandomTime();
        const username = m.pushName || `@${m.sender.split("@")[0]}`;

        const message = `🌟 *Ramalan Kehidupan* 🌟\n\n` +
                        `🧑 *Pengguna*: ${username}\n` +
                        `⏳ *Sisa Umur*: ${deathTime.years} tahun, ${deathTime.months} bulan, ${deathTime.days} hari, ${deathTime.hours} jam, ${deathTime.minutes} menit, ${deathTime.seconds} detik lagi\n\n` +
                        `⚠️ *Pesan*: "Waktumu terbatas, ${username}. Jangan lupa untuk selalu berbuat baik dan cepat bertaubat. Setiap detik adalah anugerah, gunakanlah dengan bijak."\n\n` +
                        `💭 *Ingat*: Hanya Tuhan yang tahu kapan kita akan dipanggil. Ini hanyalah sebuah hiburan, jangan diambil serius. 😊`;

        naze.sendMessage(m.chat, { text: message, mentions: [m.sender] }, { quoted: m });
    }
};
