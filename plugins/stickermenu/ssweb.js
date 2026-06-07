require('../../settings');
const axios = require('axios');

module.exports = {
    name: 'ssweb',
    alias: ['.ss'],
    description: '<url website>',
    run: async ({ naze, m, args, text }) => {
        try {
            

            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Masukkan URL yang valid!\nContoh: ${m.prefix}${m.command} https://github.com/nazedev/naze-md` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            const url = text.startsWith('http') ? text : `https://${text}`;
            const screenshotUrl = `https://api.siputzx.my.id/api/tools/ssweb?url=${url}&device=desktop`;

            await naze.sendMessage(m.chat, { image: { url: screenshotUrl }, caption: 'Berhasil mengambil screenshot.' }, { quoted: m });
            
        } catch (e) {
            console.error(`Fatal error di ssweb: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};