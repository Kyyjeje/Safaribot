module.exports = {
    name: "oi",
       run: async ({ m }) => {
        let balasanOi = [
            "Paan bro? Ada apa? 🗿☕",
            "Oi oi oi, ada masalah kah? 🤨",
            "Oi apaan? Ada yang bisa gua bantu? 😎",
            "Oi! Lu manggil, kagak ada kopi nih? ☕",
            "Oi oi oi... Kirain manggil banci depan gang. 😆"
        ];
        m.reply(balasanOi[Math.floor(Math.random() * balasanOi.length)]);
    }
};
