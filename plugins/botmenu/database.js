const axios = require('axios');
const countryCodes = require('../../database/countryCodes');
const { globalSettings } = require('../../settings');

module.exports = {
    name: 'totalpengguna',
    alias: ['database', 'db', 'totaluser', 'keterangan|totalpengguna', 'keterangan|db', 'keterangan|database'],
    run: async ({ naze, m }) => {
        if (m.text?.toLowerCase().startsWith('keterangan|')) {
            const cmd = m.text.split('|')[1];
            if (['totalpengguna', 'db', 'database'].includes(cmd)) {
                const penjelasan = `
🌍 *Fitur Total Pengguna*

📊 *Fungsi*: Menampilkan jumlah pengguna bot berdasarkan kode negara.
🔎 *Manfaat*: Memantau sebaran pengguna bot secara global.
🛠️ *Cara Penggunaan*: \`.database\`
💡 *Contoh*: \`.database\`
⚠️ *Catatan*: Kode negara diambil dari awalan nomor. Jika tidak terdeteksi, ditandai sebagai "Negara Tidak Diketahui".
                `.trim();
                return await naze.sendMessage(m.chat, { text: penjelasan }, { quoted: m });
            }
        }

        try {
            const userKeys = Object.keys(global.db.users);
            const countryCount = {};
            const unknownCountryCount = {};

            for (const user of userKeys) {
                const countryCode = user.split('@')[0].slice(0, 3);
                const countryName = countryCodes[countryCode] || countryCodes[countryCode.slice(0, 2)] || `Negara Tidak Diketahui (${countryCode})`;

                if (countryName.startsWith('Negara Tidak Diketahui')) {
                    unknownCountryCount[countryCode] = (unknownCountryCount[countryCode] || 0) + 1;
                } else {
                    countryCount[countryName] = (countryCount[countryName] || 0) + 1;
                }
            }

            const sortedCountries = Object.entries(countryCount).sort((a, b) => b[1] - a[1]);
            const sortedUnknownCountries = Object.entries(unknownCountryCount).sort((a, b) => b[1] - a[1]);

            let runtimeText = `🧑‍ *Pengguna*: ${userKeys.length} *user*\n\n🌍 *Statistik Asal Negara*\n`;
            for (const [country, count] of sortedCountries) {
                runtimeText += `*${country}*: ${count} pengguna\n`;
            }

            if (sortedUnknownCountries.length > 0) {
                runtimeText += `\n🚫 *Kode Negara Tidak Diketahui*\n`;
                for (const [code, count] of sortedUnknownCountries) {
                    runtimeText += `+${code}: ${count} pengguna\n`;
                }
            }

            await m.reply(runtimeText);
        } catch (err) {
            await global.handleError(naze, m, err, {
                sendRawError: true,
                useGemini: true
            });
        }
    }
};