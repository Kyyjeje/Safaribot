module.exports = {
    name: "imutcek",
    alias: [".imutcek", "cekimut"],
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
                `Aduh ${nama}, lo lebih ke cool daripada imut nih! 😎`,
                `${nama}, imutnya masih dikit sih, tapi bisa dilatih kok! 🤭✨`,
                `Hmm, ${nama}, lo lebih ke elegan daripada imut! 🧐`,
                `${nama}, bukan gak imut, cuma lebih berwibawa aja! 🦁💖`,
                `Imut? Hmm, masih jauh... tapi jangan sedih, lo tetap keren kok! 😆`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else if (persentase <= 50) {
            const pesanList = [
                `${nama}, ada aura imutnya dikit nih! 🥰`,
                `Imutnya udah mulai muncul, ${nama}, tapi masih malu-malu! 😳`,
                `Kalau ada kursus jadi imut, lo udah level dasar nih, ${nama}! 🤭`,
                `Sedikit imut, sedikit cool, kombinasi yang menarik, ${nama}! ✨`,
                `Lo masuk kategori "kadang imut, kadang sangar", ${nama}! 😂`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else if (persentase <= 75) {
            const pesanList = [
                `${nama}, OMG! Lo tuh udah masuk kategori imut banget! 🥺💕`,
                `Fix, ${nama}, kalau ada lomba keimutan, lo bisa juara 2! (Juara 1 tetap kucing) 🐱`,
                `Mau dipeluk nggak, ${nama}? Soalnya lo keliatan gemesin banget nih! 😘`,
                `Banyak yang gemes sama lo nih, ${nama}! Jangan salahkan mereka! 🤭💕`,
                `Lo tuh ibarat tokoh anime yang bikin semua orang bilang "Awww"! 🥺✨`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else {
            const pesanList = [
                `AWWW ${nama}, lo adalah definisi dari IMUT SEJATI! 🥺💕`,
                `NASA udah konfirmasi, keimutan lo ini bukan normal lagi, tapi Luar Biasa! 🚀💖`,
                `Fix, lo 1000% certified IMUT! Nggak ada yang bisa ngalahin! ✨🥰`,
                `Lo bukan cuma imut, tapi juga bikin orang lain pengen bawa pulang! 😍`,
                `Kalau ada ranking keimutan, lo pasti di puncak, ${nama}! 🏆💕`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        }

        const pesanRespon = `*📝 Pertanyaan :* ${m.body.split(" ")[0]}\n` +
                            `*👤 Nama          :* ${nama}\n` +
                            `*🐣 Tingkat Imut :* ${persentase}%\n\n` +
                            `*💬 [Pesan] :* \n${pesan}`;

         // Gunakan targetJid untuk mentions, fallback ke m.sender jika tidak ada
        naze.sendMessage(m.chat, { 
            text: pesanRespon, 
            mentions: targetJid ? [targetJid] : [m.sender] 
        }, { quoted: m });
    }
};
