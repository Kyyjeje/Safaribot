module.exports = {
    name: "ngakak",
       run: async ({ m }) => {
        let balasanNgakak = [
            "Gitu doang ngakak? Selera humor lu receh amat 🗿☕",
            "Halah, ngakak aja pelit. Ketawa yang lebar dong! 🤣",
            "Hah? Ngakak beneran atau lagi sakit ayan? 😆",
            "Yah, ini doang? Lu ketawa apa lagi disunat? 🤨",
            "Ngakak mulu, duit tetap nol kan? 🗿💸"
        ];
        m.reply(balasanNgakak[Math.floor(Math.random() * balasanNgakak.length)]);
    }
};
