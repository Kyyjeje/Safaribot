module.exports = {
    name: "siapacantik",
    alias: ["scantik", "siapacantik"],
    run: async ({ naze, m }) => {
        if (!m.isGroup) return naze.sendMessage(m.chat, { text: "❌ Fitur ini hanya bisa digunakan di grup." }, { quoted: m });

        let groupMetadata = await naze.groupMetadata(m.chat).catch(() => null);
        if (!groupMetadata) return m.reply("Gagal mengambil data grup.");

        let members = groupMetadata.participants.map(a => a.id);
        let randomMember = members[Math.floor(Math.random() * members.length)];

        // Daftar kalimat acak untuk pujian
        let compliments = [
            "Kecantikanmu itu kayak sunrise, bikin semua orang terpukau! 🌅✨",
            "Serius deh, kalau ada kontes kecantikan, pasti kamu auto juara! 👑🔥",
            "Wajahmu kayak lukisan mahal, gak ada yang bisa menandingi! 🎨😍",
            "Bidadari kah yang turun ke grup ini? Karena kamu beneran luar biasa! 👼💕",
            "Pesonamu itu kayak magnet, semua mata pasti tertuju padamu! 🧲😏",
            "Orang-orang butuh filter biar cakep, kamu? Udah cakep dari sananya! 📸💖",
            "Cermin aja sampe iri ngeliat betapa cantiknya kamu! 🪞💋",
            "Kalau cantik itu dosa, kamu udah auto masuk daftar pencarian! 🚨🔥",
            "Cahaya kecantikanmu tuh bukan main, bikin semua orang meleleh! 🔥😳",
            "Jangan senyum lama-lama, takut ada yang pingsan saking terpukaunya! 😵💘",
            "Pantes aja grup ini makin cerah, ternyata ada kamu di dalamnya! ☀️😆",
            "Banyak yang bilang bidadari itu mitos, tapi kamu bukti nyatanya! 👼🌸",
            "Kalau senyuman bisa nyembuhin stres, senyumanmu bisa jadi terapi dunia! 😍💆",
            "Tolong jangan terlalu cantik, kasian yang lain minder! 🤭💃",
            "Kamu itu kayak bintang, bersinar paling terang di antara yang lain! ⭐✨",
            "Cantikmu tuh ibarat software premium, gak ada crack-nya! 🔥😂",
            "Seriusan deh, kalau Instagram ada ranking kecantikan, kamu top global! 🏆📸",
            "Hati-hati ya, kecantikan berlebih bisa bikin hati orang bergetar! 💓😳",
            "Ngelihat kamu tuh bikin hari yang suram jadi penuh warna! 🌈😊",
            "Bidadari kalau lihat kamu mungkin bakal resign, karena kamu lebih wow! 😆✨"
        ];

        // Pilih pujian secara acak
        let randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];

        let message = `🎀 *Siapa Orang Paling CANTIK di Grup Ini?* 🎀\n\n` +
                      `📢 Setelah investigasi yang sangat ketat, akhirnya ditemukan seorang wanita yang paling menawan di grup ini!\n\n` +
                      `💃✨ Orang tersebut adalah...\n` +
                      `🫦💖 @${randomMember.split('@')[0]} 💖🫦\n\n` +
                      `💌 *${randomCompliment}* 💌\n\n` +
                      `Selamat yaaa! 🥳🎉\n\n` +
                      `_*Jangan iri ya yang lain, kecantikan datang dari hati!*_ 💝`;

        naze.sendMessage(m.chat, { text: message, mentions: [randomMember] }, { quoted: m });
    }
};
