module.exports = {
    name: 'hai',
    alias: ['hai'],
       run: async ({ m }) => {
        let balasanHai = [
            `Hai juga @user ! Apa kabar? 🤗`,
            "Hai hai hai, ada perlu apa nih? 😆",
            "Hai, udah makan belum? Kalau belum, aku juga. 🤣",
            "Hai, tapi inget... *utang jangan lupa bayar!* 😎",
            "Hai! Tapi kalau cuma hai doang, gua balik tidur. 💤"
        ];
        m.reply(balasanHai[Math.floor(Math.random() * balasanHai.length)]);
    }
};
