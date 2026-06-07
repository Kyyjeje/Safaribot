require('../../settings');
const axios = require("axios");

module.exports = {
    name: 'sticker',
    alias: ['stiker', 's', 'stickergif', 'stikergif', 'sgif'],
    description: '<reply image/video>',
    run: async ({ naze, m, args, text }) => {
        try {
            
           
            const quoted = m.quoted ? m.quoted : m;
            const mime = (quoted.msg || quoted).mimetype || '';

            if (!/image|video|sticker/.test(quoted.type || mime)) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Kirim/reply gambar/video/gif dengan caption: ${m.prefix}${m.command}` }, { quoted: m });
            }

            let media = await quoted.download();

            if (/image|webp/.test(mime)) {
                if (text === 'meta') {
                    await naze.sendAsSticker(m.chat, media, m, { packname: packname, author: author, isAvatar: 1 });
                } else {
                    await naze.sendAsSticker(m.chat, media, m, { packname: packname, author: author });
                }
                
            } else if (/video/.test(mime)) {
                if ((quoted.msg || quoted).seconds > 11) {
                    
                    return naze.sendMessage(m.chat, { text: `⚠️ Maksimal 10 detik!` }, { quoted: m });
                }
                await naze.sendAsSticker(m.chat, media, m, { packname: packname, author: author });
                
            } else {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Kirim/reply gambar/video/gif dengan caption: ${m.prefix}${m.command}` }, { quoted: m });
            }
        } catch (e) {
            console.error(`Fatal error di sticker: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};