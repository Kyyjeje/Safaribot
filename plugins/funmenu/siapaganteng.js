module.exports = {
    name: "siapaganteng",
    alias: ["sganteng", "siapaganteng"],
    run: async ({ naze, m }) => {
        if (!m.isGroup) return naze.sendMessage(m.chat, { text: "❌ Fitur ini hanya bisa digunakan di grup." }, { quoted: m });

        let groupMetadata = await naze.groupMetadata(m.chat).catch(() => null);
        if (!groupMetadata) return m.reply("Gagal mengambil data grup.");

        let members = groupMetadata.participants.map(a => a.id);
        let randomMember = members[Math.floor(Math.random() * members.length)];

        // Daftar kalimat acak untuk pujian
        let compliments = [
            "Ketampananmu itu udah level Sultan, auto bikin semua orang kagum! 👑🔥",
            "Serius deh, kalau ada kontes ketampanan, kamu pasti jadi pemenangnya! 🏆😎",
            "Wajahmu itu kayak film box office, semua orang pasti mau nonton! 🎥✨",
            "Karisma dan ketampananmu itu bagaikan pahlawan dalam anime! 💥🦸‍♂️",
            "Aura tampanmu ini udah kayak karakter utama di film action! 🎬🚀",
            "Gantengnya level internasional, jangan-jangan kamu artis K-Pop undercover? 😏💖",
            "Kalau ada yang butuh definisi 'ganteng', cukup tunjukin fotomu aja! 📸😆",
            "Tolong jangan terlalu tampan, takut server dunia ambruk karena overload! 🌍🔥",
            "Banyak yang pake skincare mahal, tapi kamu? Udah ganteng dari sananya! 😌✨",
            "Seriusan, kalau jadi model pasti brand-brand langsung rebutan! 👔📷",
            "Gantengnya kamu tuh udah kayak karakter di drama Korea, bikin hati meleleh! 💘🎭",
            "Gak heran kalau banyak yang naksir, aura kamu tuh udah beda level! 💯😍",
            "Jangan sering-sering senyum, takut ada yang jatuh hati terus gak bisa move on! 😆💓",
            "Siapa yang butuh filter kalau udah setampan ini? Natural beauty bro! 🕶🔥",
            "Kalau ketampanan itu senjata, kamu udah jadi jenderal perang! 🏹💥",
            "Fix! Kamu ini bukan manusia biasa, tapi keturunan dewa ketampanan! ⚡💎",
            "Ketampananmu tuh ibarat WiFi, semua orang pasti pengen konek! 📶💙",
            "Awas, ketampanan overload! Jangan-jangan server dunia bakal error! 🤯🔥",
            "Hati-hati ya, banyak orang bisa salah fokus kalau kamu ada di grup ini! 🤭💖",
            "Ketampananmu bikin efek samping, banyak yang jadi gak bisa tidur! 😴💘"
        ];

        // Pilih pujian secara acak
        let randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];

        let message = `🔥 *Siapa Orang Paling GANTENG di Grup Ini?* 🔥\n\n` +
                      `📢 Setelah seleksi ketat, akhirnya ditemukan sosok pria yang paling menawan di grup ini!\n\n` +
                      `😎✨ Orang tersebut adalah...\n` +
                      `🤴🏻💎 @${randomMember.split('@')[0]} 💎🤴🏻\n\n` +
                      `💌 *${randomCompliment}* 💌\n\n` +
                      `Selamat yaa, bro! 🎉🔥\n\n` +
                      `_*Yang lain jangan iri ya, ganteng itu juga bisa dilatih!*_ 💪😂`;

        naze.sendMessage(m.chat, { text: message, mentions: [randomMember] }, { quoted: m });
    }
};
