module.exports = {
    name: "lesbicek",
    alias: [".lesbicek", "ceklesbi"],
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
                `Wah ${nama}, lo masih lurus banget nih! 🌿`,
                `${nama}, kayaknya lo belum ada tanda-tanda masuk klub ini! 😆`,
                `Fix, ${nama}, lo masih team "cari cowok"! 🚹`,
                `${nama}, gak ada lesby vibes sama sekali, asli lurus! 😁`,
                `Sepertinya lo masih 100% hetero, ${nama}! 😆`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else if (persentase <= 50) {
            const pesanList = [
                `Hmmm, ${nama}, kayaknya ada sedikit lesby vibes nih! 🌈`,
                `Udah mulai ada kecenderungan ya, ${nama}? 🤭`,
                `Lesby detected di angka kecil! Masih bisa goyah atau gimana nih, ${nama}? 😂`,
                `Dikit lagi masuk klub nih, ${nama}! 😆`,
                `Ada bibit-bibit lesby nih, ${nama}! Tapi belum total! 🌸`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else if (persentase <= 75) {
            const pesanList = [
                `${nama}, fix lo udah 75% masuk klub lesby! 🌈🔥`,
                `Lo udah bukan lurus-lurus amat, ${nama}! Lesby mode ON! 😏`,
                `Cowo? Apaan tuh? ${nama} lebih tertarik ke yang lain nih! 😉`,
                `Udah mulai nyaman sama sesama nih, ${nama}? 🥰`,
                `Bukan setengah-setengah lagi, ${nama}! Lo udah hampir full team pelangi! 🌈`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else {
            const pesanList = [
                `WOAH ${nama}, lo udah 100% lesby certified! 🏳️‍🌈💖`,
                `NASA udah konfirmasi, ${nama} tuh lesby sejati! 🚀✨`,
                `Gak ada yang bisa menggoyahkan lo lagi, ${nama}! Welcome to the club! 🥰`,
                `Lesby level dewa! ${nama}, lo udah auto masuk inner circle nih! 💕`,
                `Gak perlu dites lagi, ${nama}, lo udah Queen of Lesby! 👑✨`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        }

        const pesanRespon = `*📝 Pertanyaan :* ${m.body.split(" ")[0]}\n` +
                            `*👤 Nama          :* ${nama}\n` +
                            `*🌈 Tingkat Lesby :* ${persentase}%\n\n` +
                            `*💬 [Pesan] :* \n${pesan}`;

      // Gunakan targetJid untuk mentions, fallback ke m.sender jika tidak ada
        naze.sendMessage(m.chat, { 
            text: pesanRespon, 
            mentions: targetJid ? [targetJid] : [m.sender] 
        }, { quoted: m });
    }
};
