module.exports = {
    name: "bau",
    run: async ({ m }) => {
        let pesanVariasi = [
            "🤢 *Wah, ada bau apa nih? Kok bisa-bisanya baru ngomong langsung bau gini!*",
            "💨 *Bau apa ini? Kayaknya bukan bau harum bunga, deh!*",
            "😷 *Aduh, kayaknya ada yang makan petai deh, baunya nyengat!*",
            "🦨 *Bau apa nih, kayak bau kambing kesiram keringat!*",
            "🤧 *Bau-bau gini, apa jangan-jangan habis makan jengkol?*",
            "🫢 *Baru buka mulut, langsung atmosfir berubah... Keren sih, bau kamu legendaris!*",
            "😵 *Ada yang nyemprot parfum rasa rendang ya?*",
            "🧼 *Mandi tuh, jangan cuma ngandelin angin malam!*",
            "🫠 *Ini bukan bau biasa... ini bau yang menyentuh jiwa.*",
            "🥴 *Eh, tolong... AC-nya kalah wangi sama kamu!*",
            "👃 *Idung gue pengen pensiun... baunya menusuk kalbu!*",
            "🔥 *Bau kamu kayak efek ultimate... semua langsung tumbang!*",
            "🍂 *Kayak bau sepatu dijemur pas hujan ya?*",
            "📉 *Kadar oksigen turun drastis... tolong jangan napas dulu!*",
            "🛑 *Silakan cuci mulut dengan sabun dan doa!*",
            "🍽️ *Bau mulutnya kayak menu khas horror!*",
            "🧄 *Kamu sarapan bawang mentah ya barusan?*",
            "🥵 *Ini bukan bau biasa, ini senjata biokimia!*",
            "🐽 *Bahkan babi pun minggir...*",
            "🚫 *Oksigen tercemar... butuh evakuasi darurat!*"
        ];
        m.reply(pesanVariasi[Math.floor(Math.random() * pesanVariasi.length)]);
    }
};
