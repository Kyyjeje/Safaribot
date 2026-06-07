module.exports = {
    name: 'goblok',
    alias: ['goblokk'],
       run: async ({ m }) => {
        let balasanGoblok = [
            "Yang goblok mah elu, gua kagak 🥱",
            "Lu goblok, gua jenius. Beda kasta bro 🧐",
            "Goblok panggil goblok, anjay pertemanan 🤣",
            "Halah, otak kaga nyampe malah nuduh gua goblok 😴",
            "Goblok goblok, tapi lu tetap nyari gua kan? 🗿"
        ];
        m.reply(balasanGoblok[Math.floor(Math.random() * balasanGoblok.length)]);
    }
};
