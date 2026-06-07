const path = require("path");

module.exports = {
    name: 'cekpushname',
    alias: ['pushname'],
    description: '<reply/non-reply>',
    run: async ({ naze, m, store, text }) => {
        try {
            
            let teks = m.quoted 
                ? `🏷️ Pushname dari yang di-reply: \n*${m.quoted.pushName}*`
                : `🏷️ Pushname pengirim: \n*${m.pushName}*`;
            await naze.sendMessage(m.chat, { text: teks }, { quoted: m });
            
        } catch (e) {
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};