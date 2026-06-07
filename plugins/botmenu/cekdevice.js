const path = require("path");

module.exports = {
    name: 'cekdevice',
    alias: ['isdevice','cekhp'],
    description: '<reply/non-reply>',
    run: async ({ naze, m, store, text }) => {
        try {
            
            let teks = m.quoted 
                ? `🏷️ Device dari pesan reply: \n*${m.quoted.device}*`
                : `🏷️ Device pengirim: \n*${m.device}*`;
            await naze.sendMessage(m.chat, { text: teks }, { quoted: m });
            
        } catch (e) {
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};