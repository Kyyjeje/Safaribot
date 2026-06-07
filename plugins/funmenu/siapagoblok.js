module.exports = {
    name: "siapagoblok",
    alias: ["sgoblok", "siapagoblok"],
    run: async ({ naze, m }) => {
        if (!m.isGroup) return naze.sendMessage(m.chat, { text: "❌ Fitur ini hanya bisa digunakan di grup." }, { quoted: m });

        let groupMetadata = await naze.groupMetadata(m.chat).catch(() => null);
        if (!groupMetadata) return m.reply("Gagal mengambil data grup.");

        let members = groupMetadata.participants.map(a => a.id);
        let randomMember = members[Math.floor(Math.random() * members.length)];

        // Daftar kalimat nyelekit & kocak
        let roasts = [
            "Bro, IQ-nya sepertinya mirip suhu ruangan. Bahkan es batu lebih pinter dikit 🧊😂",
            "Kebodohanmu tuh ibarat WiFi, menyebar ke seluruh grup tanpa batasan! 📶🤡",
            "Otakmu tuh kayak RAM 512MB, makin lama makin lemot 🤖🪨",
            "Selamat! Kamu resmi jadi beban server grup ini! 🗑️😆",
            "Kalau ada ujian kepintaran, kamu pasti lulus... di level tutorial. 🎮🪨",
            "Kamu ini bukti nyata bahwa evolusi juga bisa nge-lag! 🦍💨",
            "Ada dua tipe orang di dunia ini: yang pinter dan... ya kamu ini. 🎭😜",
            "Kecerdasanmu itu kayak sinyal di pedalaman, nyaris nggak ada! 📡😵",
            "Kalau disuruh nyari akal, kamu pasti nyasar. 🧭🪨",
            "IQ-mu kayak kentang rebus, lembek dan nggak berfungsi! 🥔💀",
            "Kalau otak bisa di-upgrade, kamu butuh yang versi Pro. 🛠️🤦‍♂️",
            "Kamu ibarat update Windows yang gagal, nyusahin semua orang! 💻🔥",
            "Kalau kepintaran bisa di-download, koneksi kamu pasti limited! 📶🧠",
            "Kecerdasanmu itu kayak baterai HP, cepet banget abisnya. 🔋🪨",
            "Kamu tuh kayak aplikasi bajakan, sering error dan nggak stabil! 🖥️😹",
            "Lu punya keahlian unik, yaitu jadi contoh nyata dari ‘tolol level dewa’ 🤡🪨",
            "Bahkan kura-kura aja lebih cepat mikir dibanding lu. 🐢💀",
            "Kalau goblok ada kompetisi, kamu pasti juara bertahan 10 tahun berturut-turut. 🏆🪨",
            "Lu tuh kayak kalkulator rusak, nggak bisa dipakai buat mikir! 🤖🔥",
            "Otakmu kayak software trial, fungsi terbatas dan sering error. 💾🪨"
        ];

        // Pilih roast secara acak
        let randomRoast = roasts[Math.floor(Math.random() * roasts.length)];

        let message = `🔥 *Siapa Orang Paling GOBLOK di Grup Ini?* 🔥\n\n` +
                      `📢 Setelah analisis mendalam dan voting dari AI super canggih...\n\n` +
                      `🤡 *Pemenangnya adalah...*\n` +
                      `🪨🥴 @${randomMember.split('@')[0]} 🪨🥴\n\n` +
                      `📜 *${randomRoast}* 📜\n\n` +
                      `Selamat yaa, jangan lupa bersyukur! 😂💀\n\n` +
                      `_*Yang lain jangan minder, masih ada kesempatan buat jadi juara minggu depan!*_ 🤣🔥`;

        naze.sendMessage(m.chat, { text: message, mentions: [randomMember] }, { quoted: m });
    }
};
