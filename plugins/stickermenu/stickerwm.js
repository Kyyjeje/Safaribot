require('../../settings');

module.exports = {
    name: 'stickerwm',
    alias: ['swm', 'curi', 'colong', 'take', 'stickergifwm', 'sgifwm'],
    description: '<reply sticker>',
    run: async ({ naze, m, args, text }) => {
        try {
            
       
            const mime = (m.quoted?.msg || m.quoted)?.mimetype || '';

            if (!/image|video|sticker/.test(m.quoted?.type || mime)) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Kirim/reply gambar/video/gif dengan caption: ${m.prefix}${m.command}\nDurasi Image/Video/Gif 1-9 Detik` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            let media = await (m.quoted ? m.quoted.download() : m.download());
            let teks1 = text.split('|')[0]?.trim() || ' ';
            let teks2 = text.split('|')[1]?.trim() || ' ';

            if (/image|webp/.test(mime)) {
                if (text === 'meta') {
                    await naze.sendAsSticker(m.chat, media, m, { packname: teks1, author: teks2, isAvatar: 1 });
                } else {
                    await naze.sendAsSticker(m.chat, media, m, { packname: teks1, author: teks2 });
                }
                
            } else if (/video/.test(mime)) {
                if ((m.quoted?.msg || m.quoted)?.seconds > 11) {
                    
                    return naze.sendMessage(m.chat, { text: `⚠️ Maksimal 10 detik!` }, { quoted: m });
                }
                await naze.sendAsSticker(m.chat, media, m, { packname: teks1, author: teks2 });
                
            } else {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Kirim/reply gambar/video/gif dengan caption: ${m.prefix}${m.command}` }, { quoted: m });
            }
        } catch (e) {
            console.error(`Fatal error di stickerwm: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};