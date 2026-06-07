require('../../settings');

module.exports = {
    name: 'toviewonce',
    alias: ['toonce', 'toviewoncefile', 'toonceview'],
    description: '<reply image/video>',
    run: async ({ naze, m }) => {
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';

        try {
            if (!/image|video/.test(mime)) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Konversi ke View Once:*\n` +
                              `  Perintah: Reply gambar/video dengan \n\`${m.prefix}${m.command}\`\n` +
                              `  Contoh: Reply gambar/video dengan \n\`${m.prefix}toviewonce\``);
            }

            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
            

            const mediaType = mime.includes('image') ? 'image' : 'video';
            const caption = quoted.caption || '';
            const media = await quoted.download();

            await naze.sendMessage(m.chat, { [mediaType]: media, viewOnce: true, caption }, { quoted: m });
            
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};