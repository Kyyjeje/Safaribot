require('../../settings');
const axios = require('axios');

module.exports = {
    name: 'flux',
    alias: ['fluxai', 'fluximage', 'fluxart'],
    description: '<text>',
    run: async ({ naze, m, text }) => {
        try {
            if (!text) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Flux Gambar:*\n` +
                              `  Perintah: \n\`${m.prefix}${m.command} <prompt>\`\n` +
                              `  Contoh: \n\`${m.prefix}${m.command} mobil futuristik terbang\``);
            }

            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
            
            
            await new Promise(resolve => setTimeout(resolve, 500));
            

            const apiUrl = `https://api.siputzx.my.id/api/ai/flux?prompt=${encodeURIComponent(text)}`;
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

            if (!response.data) throw new Error('Gagal menghasilkan gambar');
            await naze.sendMessage(m.chat, {
                image: response.data,
                caption: `🖼️ *Gambar Hasil Flux:*\n*${text}*`
            }, { quoted: m });
            
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};