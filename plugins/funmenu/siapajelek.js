module.exports = {
    name: "siapajelek",
    alias: ["sjelek", ".siapajelek"],
    run: async ({ naze, m }) => {
        if (!m.isGroup) return naze.sendMessage(m.chat, { text: "❌ Fitur ini hanya bisa digunakan di grup." }, { quoted: m });

        let groupMetadata = await naze.groupMetadata(m.chat).catch(() => null);
        if (!groupMetadata) return m.reply("Gagal mengambil data grup.");

        let members = groupMetadata.participants.map(a => a.id);
        let randomMember = members[Math.floor(Math.random() * members.length)];

        // Daftar kalimat roasting brutal
        let roasts = [
            "Gua kira CGI, ternyata muka lu emang bug grafik. 🎮💀",
            "Bro, muka lu tuh kayak foto JPEG yang resolusinya 144p. 🖼️📉",
            "Lu ini bukti kalau filter Instagram itu penting banget. 🤳😂",
            "Kalau muka bisa di-update, lu butuh patch darurat. 🔧🚨",
            "Muka lu tuh kayak sinyal 1 bar, nyari cantik/gantengnya susah banget! 📶🗿",
            "Kalau ada kontes muka mirip sandal jepit, lu menang telak. 🩴🤣",
            "Kecantikan/kegantengan lu itu kayak XP Windows, sudah tidak didukung lagi. 💻🪦",
            "Muka lu kayak template meme yang belum diedit. 🤡🪨",
            "NASA butuh teknologi kaya muka lu, soalnya itu alien level tertinggi. 👽🚀",
            "Lu ini kalau selfie, kamera malah ngasih peringatan ‘Error: Deteksi Wajah Gagal’. 📷⚠️",
            "Kalau kecantikan/kegantengan itu WiFi, lu koneksi 3G di gunung. 🏔️📡",
            "Muka lu tuh kayak test crash mobil, hancur banget! 🚗💥",
            "Lu mirip puzzle 1000 keping, tapi baru setengah jadi. 🧩😂",
            "Orang lain makeup buat makin cakep, lu makeup malah jadi horor. 🎭👻",
            "Muka lu tuh kayak loading screen yang ga kelar-kelar. 🔄🗿",
            "Filter kamera paling canggih pun nyerah kalau dipake lu. 📸💀",
            "Kalau mukalu dijual di NFT, pasti gak ada yang beli. 🖼️💸",
            "Kalau ada mesin pencari ketampanan/kecantikan, namalu nggak bakal muncul. 🔍🤣",
            "Lu kayak karakter game yang belum dirender dengan baik. 🎮🫣",
            "Bahkan bayangan lu pun nyoba kabur pas lihat muka aslinya. ☀️🏃‍♂️💨"
        ];

        // Pilih roasting secara acak
        let randomRoast = roasts[Math.floor(Math.random() * roasts.length)];

        let message = `🔥 *Siapa Orang Paling JELEK di Grup Ini?* 🔥\n\n` +
                      `📢 Setelah analisis mendalam dengan teknologi AI super mutakhir...\n\n` +
                      `🎭 *Pemenangnya adalah...*\n` +
                      `🗿🥴 @${randomMember.split('@')[0]} 🗿🥴\n\n` +
                      `📜 *${randomRoast}* 📜\n\n` +
                      `Selamat ya, jangan lupa skincare biar ada perubahan! 😂💀`;

        naze.sendMessage(m.chat, { text: message, mentions: [randomMember] }, { quoted: m });
    }
};
