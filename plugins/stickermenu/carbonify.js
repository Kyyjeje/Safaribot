require('../../settings');
const axios = require("axios");

module.exports = {
    name: 'carbonify',
    alias: ['karbonify', '.carbonify', '.karbonify'],
    description: '<teks>',
    run: async ({ naze, m, args, text }) => {
        
        if (!text) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Kirim/reply pesan dengan teks!\nContoh: ${m.prefix}${m.command} Ini contoh teks` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

        try {
            await naze.sendAsSticker(m.chat, `https://api.siputzx.my.id/api/m/carbonify?input=${encodeURIComponent(text || m.quoted.text)}`, m, { packname: packname, author: author });
            
        
        } catch (err) {
            console.error(`Fatal error di carbonify: ${err.message}\nStack: ${err.stack}`);
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};
