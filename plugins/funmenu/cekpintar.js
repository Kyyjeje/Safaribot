module.exports = {
    name: "pintarcek",
    alias: [".pintarcek", "cekpintar"],
    description: '<reply/@tag>',
    run: async ({ naze, m }) => {
        if (!m.isGroup) return m.reply("Fitur ini hanya bisa digunakan di dalam grup.");

         let nama;
        let targetJid;

        // Cek jika pesan adalah reply
        if (m.quoted && m.quoted.sender) {
            targetJid = m.quoted.sender;
            nama = `@${targetJid.split("@")[0]}`;
        } else if (m.mentionedJid?.length) {
            // Jika ada mention
            targetJid = m.mentionedJid[0];
            nama = `@${targetJid.split("@")[0]}`;
        } else {
            // Jika tidak ada mention atau reply, gunakan teks atau pengirim
            let teks = m.body.split(" ").slice(1).join(" ");
            if (teks) {
                nama = teks;
                targetJid = m.sender; // Default ke pengirim jika hanya nama teks
            } else {
                nama = `@${m.sender.split("@")[0]}`;
                targetJid = m.sender;
            }
        }
        // Persentase pintar dengan metode yang lebih balance
        let persentase = Math.floor(Math.random() * 100) + 1;
        if (persentase < 20 && Math.random() > 0.5) persentase += Math.floor(Math.random() * 20);

        let pesan;

        if (persentase >= 75) {
            const pesanList = [
                `🔥 Gokil ${nama}, otak lo itu emas! Einstein aja minder kalo ketemu lo! 🤯`,
                `NASA lagi nyari lo nih, ${nama}. Otak lo level intergalaksi! 🚀`,
                `IQ lo udah setara superkomputer, ${nama}! Bikin startup kapan nih? 😎`,
                `Kalau ada ranking orang terpintar di dunia, ${nama} pasti nomor 1! 🏆`,
                `${nama}, kayaknya lo udah bisa gantiin dosen buat ngajar deh! 🤓`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else if (persentase >= 50) {
            const pesanList = [
                `Nice ${nama}, otak lo masih fresh! Jangan lupa update ilmu terus ya! 📚`,
                `Lo cukup pinter, ${nama}. Tapi jangan puas dulu, terus belajar biar makin jenius! 😉`,
                `IQ lo di atas rata-rata, ${nama}. Cuma kadang suka nge-lag dikit, wajar lah! 😂`,
                `Lo udah pinter, ${nama}, tinggal dikit lagi buat jadi next level genius! 🚀`,
                `Kalau terus kayak gini, ${nama}, lo bakal jadi ilmuwan di masa depan nih! 🔬`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else if (persentase >= 25) {
            const pesanList = [
                `Santai aja ${nama}, lo gak bodoh kok. Cuma perlu sering-sering baca buku aja! 📖`,
                `Masih bisa ditingkatin nih, ${nama}. Upgrade otak lo ke versi terbaru ya! 🧠`,
                `Gak buruk, ${nama}, tapi lo bisa lebih pinter lagi kalau mau usaha! 💪`,
                `Lo cukup ngerti banyak hal, ${nama}, tinggal diasah aja biar makin jago! ✨`,
                `IQ lo normal, ${nama}, tapi kalau mau jadi genius, jangan malas belajar ya! 📘`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else {
            const pesanList = [
                `Jangan sedih ${nama}, masih ada harapan! Banyakin baca biar makin pinter! 📚`,
                `Belajar itu penting, ${nama}. Mulai dari yang kecil dulu ya! 😉`,
                `Gak ada orang yang bodoh, ${nama}, yang ada cuma yang males belajar! 💡`,
                `Tenang aja, ${nama}, otak bisa diasah! Yang penting jangan nyerah buat belajar! 🚀`,
                `Lo masih jauh dari jenius, ${nama}, tapi semua bisa berubah kalau lo mau usaha! 🔥`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        }

        const pesanRespon = `*📝 Pertanyaan        :* ${m.body.split(" ")[0]}\n` +
                            `*👤 Nama                 :* ${nama}\n` +
                            `*🧠 Tingkat Pintar :* *${persentase}%* \n\n` +
                            `*💬 [Pesan] :* \n${pesan}`;

        // Gunakan targetJid untuk mentions, fallback ke m.sender jika tidak ada
        naze.sendMessage(m.chat, { 
            text: pesanRespon, 
            mentions: targetJid ? [targetJid] : [m.sender] 
        }, { quoted: m });
    }
};
