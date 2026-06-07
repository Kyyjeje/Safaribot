module.exports = {
    name: "gaycek",
    alias: [".gaycek", "cekgay"],
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

        if (persentase <= 25) {
            const pesanList = [
                `${nama}, lo masih hetero sejati nih! 🏋️‍♂️😆`,
                `Gak ada tanda-tanda ke arah sana, ${nama}. Lurus kayak jalan tol! 🚗💨`,
                `${nama}, aura maskulin lo masih kuat banget! 🔥`,
                `Lo terlalu straight buat ini, ${nama}. 😂`,
                `Sepertinya, lo masih 100% suka lawan jenis, ${nama}! 😎`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else if (persentase <= 50) {
            const pesanList = [
                `${nama}, ada sedikit bibit, tapi masih 50:50! 😏`,
                `Kadang-kadang suka kepikiran gak nih, ${nama}? 🤔🌈`,
                `Hmm, masih ada peluang, ${nama}. Masih bisa berubah haluan! 😂`,
                `Lo ada di fase coba-coba nih, ${nama}. Pelan-pelan aja! 🤭`,
                `Jangan kaget kalau tiba-tiba hati lo bergetar pas liat yang sejenis, ${nama}. 😆`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else if (persentase <= 75) {
            const pesanList = [
                `${nama}, wah, udah mulai ke arah sana nih! 🌈🔥`,
                `Jujur aja, ${nama}, ada ketertarikan, kan? Hehehe! 😏`,
                `Sepertinya ada sinyal kuat nih, ${nama}. Jangan ditahan! 🤭`,
                `${nama}, lo udah setengah jalan! Tinggal selangkah lagi! 😆`,
                `Fix, ${nama}, hati lo mulai terbuka untuk semua kemungkinan! 💖🌈`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else {
            const pesanList = [
                `Fix ${nama}, lo 100% certified rainbow warrior! 🌈🔥`,
                `Selamat ${nama}, lo sudah mencapai enlightenment sejati! 😆`,
                `Lo udah resmi masuk klub pelangi, ${nama}! 🏳️‍🌈✨`,
                `NASA udah konfirmasi, ${nama} itu gay icon masa kini! 😂`,
                `Lo bukan lagi biasa, ${nama}. Lo udah jadi legenda di komunitas ini! 👑🌈`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        }

        const pesanRespon = `*📝 Pertanyaan :* ${m.body.split(" ")[0]}\n` +
                            `*👤 Nama             :* ${nama}\n` +
                            `*🏳️‍🌈 Tingkat Gay :* ${persentase}%\n\n` +
                            `*💬 [Pesan] :* \n${pesan}`;

        // Gunakan targetJid untuk mentions, fallback ke m.sender jika tidak ada
        naze.sendMessage(m.chat, { 
            text: pesanRespon, 
            mentions: targetJid ? [targetJid] : [m.sender] 
        }, { quoted: m });
    }
};
