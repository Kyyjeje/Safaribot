module.exports = {
    name: 'dih',
    alias: ['dih', 'diih', 'dihh'],
        run: async ({ m }) => {
        let balasanDih = [
            "Dih diih, biar apa lu begitu??? 😑",
            "Dih? Astaga, ini tahun berapa masih bilang dih? 🤡",
            "Dih diih diih, mau gua kasih piring sekalian? 🍽️",
            "Dih? Lu kurang kerjaan ya? 🧐",
            "Dih apaan? Mau ribut? 😎"
        ];
        m.reply(balasanDih[Math.floor(Math.random() * balasanDih.length)]);
    }
};
