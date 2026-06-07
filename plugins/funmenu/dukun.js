const fetch = require('node-fetch');

module.exports = {
    name: "dukun",
    alias: ["dukunsakti", "dukunhebat", "peramal", "ramalan"], 
    description: '<nama>',
    run: async ({ naze, m, text }) => {
        if (!text) return m.reply(`🌙 *Bisikan Alam Gaib...* 🌙\n\n❗ *Masukkan nama untuk membaca energimu!*\n\n_Contoh:_ .dukun Putu`);

        try {
            m.reply('🔮 *Memanggil kekuatan gaib...* 🌑\nEnergi mulai berkumpul, harap tenang...');

            let url = `https://api.siputzx.my.id/api/ai/dukun?content=${encodeURIComponent(text)}`;
            let response = await fetch(url);
            let json = await response.json();

            if (json.status && json.data) {
                let hasil = json.data.trim();

                let result = `🌌 *Penerawangan Gaib* 🌌\n\n` +
                            `👤 *Nama:* ${text}\n` +
                            `📜 *Hasil Penerawangan:*\n\n` +
                            `_${hasil}_\n\n` +
                            `☠️ *Pesan Dari Alam Lain:* Percayalah pada firasatmu... dan jangan abaikan pertanda yang datang!`;

                m.reply(result);
            } else {
                m.reply('⚠️ *Energi terganggu!* 🌫️\nSepertinya ada gangguan dari alam lain... coba lagi nanti.');
            }
        } catch (error) {
            console.error(`[ERROR - dukun]: ${error.message}`);
            m.reply('💀 *Kekuatan gelap menghalangi penerawangan!* 🚫\nCoba lagi nanti atau periksa koneksimu.');
        }
    }
};
