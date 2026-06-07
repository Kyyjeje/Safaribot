module.exports = {
    name: "hi",
        run: async ({ m }) => {
        let balasanHi = [
            "Ha hi ha hi, gigi lu kuning jirr! 😆",
            "Hi juga, tapi bayar pajak dulu! 🏦",
            "Hi hi hi, lu ngetik sambil ketawa ya? 🤨",
            "Hi apaan, salam dulu yang sopan! 🙄",
            "Hi, gimana kabar dompet? Masih kosong? 🗿"
        ];
        m.reply(balasanHi[Math.floor(Math.random() * balasanHi.length)]);
    }
};
