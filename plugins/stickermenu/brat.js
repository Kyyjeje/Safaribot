require('../../settings');

module.exports = {
    name: 'brat',
    alias: ['bratsticker', 'bratstiker', 'bratstick'],
    description: '<teks>',
    run: async ({ naze, m, db }) => {
        try {
            const text = m.text?.split(' ').slice(1).join(' ') || (m.quoted?.text || '');
            if (!text) {
                return naze.sendMessage(m.chat, { text: `⚠️ Kirim/reply pesan dengan teks!\nContoh: ${m.prefix}${m.command} Halo` }, { quoted: m });
            }
            //await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            await naze.sendAsSticker(m.chat, `https://brat.siputzx.my.id/image?text=${encodeURIComponent(text)}`, m, { packname: packname, author: author });
            
        } catch (e) {
            try {
                await naze.sendMessage(m.chat, { image: { url: `https://brat.siputzx.my.id/image?text=${encodeURIComponent(text)}` } }, { quoted: m });
                
            } catch (err) {
                console.error(`Fatal error di brat1: ${err.message}\nStack: ${err.stack}`);
                await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
            }
        }
    }
};