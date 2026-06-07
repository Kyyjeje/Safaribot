require('../../settings');
const axios = require('axios');

module.exports = {
    name: 'kodepos',
    alias: ['kode-pos'],
    description: '<daerah>',
    run: async ({ naze, m, args, text }) => {
        try {
            
            

            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Masukkan nama desa atau kelurahan yang ingin dicari kode posnya!\nContoh: ${m.prefix}${m.command} Pasiran Jaya` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            let response = await axios.get(`https://api.siputzx.my.id/api/tools/kodepos?form=${encodeURIComponent(text)}`);
            let res = response.data;

            if (!res.status || !res.data.length) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Kode pos tidak ditemukan. Pastikan nama desa/kelurahan yang dimasukkan benar.` }, { quoted: m });
            }

            let result = res.data[0];
            let replyMessage = `📍 *Hasil Pencarian Kode Pos*\n\n` +
                               `🏠 *Desa/Kelurahan*: ${result.desa || '-'}\n` +
                               `🏢 *Kecamatan*: ${result.kecamatan || '-'}\n` +
                               `🏙️ *Kota/Kabupaten*: ${result.kota || '-'}\n` +
                               `🌍 *Provinsi*: ${result.provinsi || '-'}\n` +
                               `📮 *Kode Pos*: ${result.kodepos || '-'}\n\n` +
                               `🔎 Data diperoleh dari API.`;

            await naze.sendMessage(m.chat, { text: replyMessage }, { quoted: m });
            
        } catch (e) {
            console.error(`Fatal error di kodepos: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};