module.exports = {
    name: "cantikcek",
    alias: ["cantikcek", "cekcantik"],
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
                `Jangan sedih ${nama}, cantik bukan cuma soal fisik, tapi juga hati yang baik! 💖`,
                `Cantik itu bukan cuma tampilan luar, tapi juga inner beauty yang bersinar! 🌸`,
                `${nama}, mungkin lo belum sadar, tapi semua orang punya keunikan sendiri! ✨`,
                `Bukan masalah kalau level cantik lo masih pemula, yang penting tetap percaya diri! 😘`,
                `${nama}, yakin deh, cantik itu soal mindset! Mulai hari ini, anggap diri lo stunning! 💃`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else if (persentase <= 50) {
            const pesanList = [
                `Hmm, ${nama}, aura kecantikan lo mulai terpancar nih! ✨`,
                `Banyak yang udah mulai sadar pesona lo, ${nama}. Lanjutkan! 😉`,
                `Glow up itu butuh proses, ${nama}, dan lo udah di jalan yang tepat! 💖`,
                `Cantik itu soal kepercayaan diri, dan lo punya itu, ${nama}! 💃`,
                `Tinggal sedikit polesan lagi nih, ${nama}, lo bisa jadi standar kecantikan baru! 😍`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else if (persentase <= 75) {
            const pesanList = [
                `GLOWING ALERT! ${nama}, lo udah masuk level stunning banget! 😍✨`,
                `Mau bare face atau full makeup, lo tetep cakep, ${nama}! 💖`,
                `Orang-orang mulai penasaran sama skincare lo, ${nama}. Spill dong! 😏`,
                `Wajah lo udah cukup buat bikin orang kagum, ${nama}. Asli, lo menawan! 😘`,
                `Banyak yang kepincut nih, ${nama}. Lo punya pesona yang nggak biasa! 💃`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else {
            const pesanList = [
                `Dewa kecantikan mana yang turun ke bumi dalam wujud ${nama}?! 👑🔥`,
                `NASA udah konfirmasi, kecantikan lo tuh fenomena luar biasa! 🚀✨`,
                `${nama}, lo tuh udah di level supermodel dunia! Auto bikin semua mata terpana! 😍`,
                `Gak ada kata lain selain PERFECT buat lo, ${nama}! 🌟`,
                `Fix, lo bukan manusia biasa, ${nama}. Lo itu Dewi Kecantikan! 💖👑`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        }

        const pesanRespon = `*📝 Pertanyaan :* ${m.body.split(" ")[0]}\n` +
                            `*👤 Nama             :* ${nama}\n` +
                            `*💖 Tingkat Cantik  :* ${persentase}%\n\n` +
                            `*💬 [Pesan] :* \n${pesan}`;

         // Gunakan targetJid untuk mentions, fallback ke m.sender jika tidak ada
        naze.sendMessage(m.chat, { 
            text: pesanRespon, 
            mentions: targetJid ? [targetJid] : [m.sender] 
        }, { quoted: m });
    }
};
