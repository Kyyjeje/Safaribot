module.exports = {
    name: "jomblocek",
    alias: [".jomblocek",'cekjomblo'],
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
                `Gila ${nama}, lo hampir nggak ada jomblo vibes sama sekali! 🤩`,
                `Selamat ${nama}, lo udah termasuk spesies langka yang nggak perlu galau! 🎉`,
                `${nama}, sinyal jodoh lo kuat banget! Kapan undangan nih? 😏`,
                `Lo itu definisi idaman, ${nama}. Gak mungkin jomblo lama-lama! 💘`,
                `${nama}, ini sih jomblo cuma mitos buat lo. Hati-hati banyak yang ngincer! 😎`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else if (persentase <= 50) {
            const pesanList = [
                `${nama}, lo nggak terlalu jomblo kok, tapi masih ada harapan! Semangat! ✨`,
                `Lumayan ${nama}, masih ada kesempatan buat ninggalin status jomblo ini! 🔥`,
                `Lo masuk kategori jomblo santai, ${nama}. Nggak buru-buru tapi juga nggak terlalu bebas. 😂`,
                `Ada yang naksir lo kok, ${nama}. Cuma mungkin lo nggak sadar aja! 😆`,
                `Jomblo, tapi masih elegan. Itu lo banget, ${nama}. Sabar, jodoh otw! 🚀`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else if (persentase <= 75) {
            const pesanList = [
                `${nama}, jomblo udah mulai jadi bagian hidup lo ya? 😅`,
                `Hmm, ${nama}, ini udah cukup lama sih jomblo-nya. Gimana kalau mulai cari? 😂`,
                `${nama}, lo kayak aplikasi yang lupa di-update, lama nggak dapet pasangan! 🤣`,
                `Niat cari jodoh ada, tapi prakteknya masih nol. Gitu ya, ${nama}? 😆`,
                `${nama}, kalau jomblo itu hobi, lo udah level profesional nih! 🏆`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else {
            const pesanList = [
                `Fix ${nama}, lo tuh jomblo akut! Ada rencana pensiun dari status ini? 🤯`,
                `${nama}, kalau jomblo ada kasta, lo udah level Dewa Jomblo! 👑`,
                `NASA udah konfirmasi, jomblo lo ini bukan lagi normal, tapi fenomena langka! 🚀`,
                `Kalo ada museum jomblo, nama lo bakal terpampang di sana, ${nama}! 🤣`,
                `Udah deh ${nama}, jomblo ini bukan sekadar nasib, tapi udah jadi identitas lo! 🔥`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        }

        const pesanRespon = `*📝 Pertanyaan :* ${m.body.split(" ")[0]}\n` +
                            `*👤 Nama             :* ${nama}\n` +
                            `*🔮 Jawaban      :* ${persentase}%\n\n` +
                            `*💬 [Pesan] :* \n${pesan}`;

       // Gunakan targetJid untuk mentions, fallback ke m.sender jika tidak ada
        naze.sendMessage(m.chat, { 
            text: pesanRespon, 
            mentions: targetJid ? [targetJid] : [m.sender] 
        }, { quoted: m });
    }
};
