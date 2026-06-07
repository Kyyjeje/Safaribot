require('../../settings');
const { generateWAMessageContent } = require('baileys');

module.exports = {
    name: 'toptv',
    alias: ['toptvmessage', 'toptvvideo'],
    description: '<reply video>',
    run: async ({ naze, m }) => {
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';

        try {
            if (!/video/.test(mime)) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Konversi ke PTV:*\n` +
                              `  Perintah: Reply video dengan \n\`${m.prefix}${m.command}\``);
            }

            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
            
            await new Promise(resolve => setTimeout(resolve, 500));
            

            const video = await quoted.download();
            const msg = await generateWAMessageContent({ video }, { upload: naze.waUploadToServer });

            await naze.relayMessage(m.chat, { ptvMessage: msg.videoMessage }, {});
            
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};