require('../../settings');
const axios = require('axios');

module.exports = {
    name: 'toqr',
    alias: ['qr', 'qrcode', 'toqrcode'],
    description: '<text>',
    run: async ({ naze, m, text }) => {
        try {
            if (!text) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Konversi ke QR Code:*\n` +
                              `  Perintah: \n\`${m.prefix}${m.command} <teks>\`\n` +
                              `  Contoh: \n\`${m.prefix}toqr Halo apa kabar?\``);
            }

            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
            

            let qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=700x700&data=${encodeURIComponent(text)}`;
            await naze.sendMessage(m.chat, { image: { url: qrUrl }, caption: '✅ Berhasil dikonversi ke QR Code' }, { quoted: m });
            
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};