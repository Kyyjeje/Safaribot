module.exports = {
    name: "p",
       run: async ({ m }) => {
        let pesanVariasi = [
            "🙏 *Salam dulu yang mulia, biar makin berkah ngobrolnya!*",
            "🤝 *Adab dulu yang mulia! Ucapkan salam sebelum berbicara.*",
            "🗿 *OTAK KEMANA? SALAM DULU BARU NGOMONG!*",
            "🥴 *MULUT MINTA DITAMPAR NIH? SALAM DULU!*",
            "😒 *P P P, APAAN P? UDAH BESAR MASIH GAK PAHAM ADAB?*"
        ];
        m.reply(pesanVariasi[Math.floor(Math.random() * pesanVariasi.length)]);
    }
};
