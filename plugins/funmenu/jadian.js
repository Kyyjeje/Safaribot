module.exports = {
    name: "jadian",
    alias: ["jadian"],
    run: async ({ naze, m }) => {
        if (!m.isGroup) return naze.sendMessage(m.chat, { text: "❌ Fitur ini hanya bisa digunakan di grup." }, { quoted: m });

        let groupMetadata = await naze.groupMetadata(m.chat).catch(() => null);
        if (!groupMetadata) return m.reply("❌ Gagal mengambil data grup.");

        let members = groupMetadata.participants.map(a => a.id);
        if (members.length < 2) return naze.sendMessage(m.chat, { text: "❌ Minimal harus ada 2 anggota di grup untuk menggunakan fitur ini." }, { quoted: m });

        let jadian1 = members[Math.floor(Math.random() * members.length)];
        let jadian2 = members[Math.floor(Math.random() * members.length)];

        while (jadian1 === jadian2) {
            jadian2 = members[Math.floor(Math.random() * members.length)];
        }

        // Daftar pesan random
        let messages = [
            "🔥 Wahh, akhirnya ada pasangan baru di grup ini! Jangan lupa traktirannya ya! 🤭💖",
            "😏 Fix, abis ini bakal sering ada panggilan 'ayang' di grup. Jangan lupa update status! 🤣💘",
            "💑 Selamat! Sekarang kalian bisa saling kirim pesan 'selamat pagi' tiap hari! 🌅💖",
            "👀 Apakah ini awal dari kisah cinta yang bakal viral di grup? Kita tunggu update-nya! 🎥💕",
            "💘 Udah nggak bisa menghindar lagi, jodoh emang nggak kemana! 💑✨",
            "😂 Aduh, jangan sampai ini cuma prank ya! Kita semua jadi saksi nih! 👀💞",
            "🌹 Semoga langgeng sampe ke pelaminan yaa! Awas kalo putus, denda traktiran nih! 🤭💍",
            "💞 Pasangan baru di grup! Siap-siap dengerin lagu cinta tiap malam nih! 🎶💖",
            "😳 Wah, apakah ini kode dari semesta? Udah boleh bikin couple name nih! 💑✨",
            "💌 Cupid baru aja nembak panahnya! Selamat buat pasangan baru! 🎯💖",
            "🤣 Ada yang baru jadian! Gimana rasanya tiba-tiba dapet pasangan dari bot? 😂🔥",
            "🔥 Cinta bisa datang dari mana saja, termasuk dari perintah bot! Jangan disia-siakan ya! 💘🤭",
            "🥰 Sekarang udah ada yang nemenin tiap malam. Siap-siap spam 'good night' tiap hari ya! 🌙💖",
            "💞 Gimana rasanya tiba-tiba dapet jodoh? Kaget tapi seneng kan? 😆💑",
            "👀 Jangan lupa kasih bukti kalau ini beneran jadian, kita tunggu foto couple-nya ya! 📸💖",
            "✨ Wah, ini kayak di film! Dari stranger jadi lover dalam sekejap! 🎥💕",
            "🤣 Fix, abis ini ada yang mulai chat diem-diem di belakang layar! 💬💘",
            "💍 Cincin udah siap? Ini tanda-tanda harus mulai menabung buat pernikahan! 🤭💖",
            "😆 Hati-hati, habis ini bakal ada yang baper! Jangan PHP ya! 💘💣",
            "🎊 Sekarang udah ada yang bisa dipanggil 'sayang'. Jangan malu-malu ya! 😍🔥"
        ];

        // Pilih kalimat acak
        let randomMessage = messages[Math.floor(Math.random() * messages.length)];

        let message = `❤️ *Selamat untuk pasangan baru di grup ini!* ❤️\n\n` +
                      `💑 @${jadian1.split('@')[0]} ❤️ @${jadian2.split('@')[0]}\n\n` +
                      `💬 [ *PESAN* ]\n` +
                      `${randomMessage}`;

        naze.sendMessage(m.chat, { text: message, mentions: [jadian1, jadian2] }, { quoted: m });
    }
};
