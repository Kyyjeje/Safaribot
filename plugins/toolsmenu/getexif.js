require('../../settings');
const util = require('util');
const { Image } = require('node-webpmux');

module.exports = {
    name: 'getexif',
    alias: [],
    description: '(reply sticker)',
    run: async ({ naze, m }) => {
        try {
            

            if (!m.quoted) {
                
                return naze.sendMessage(m.chat, { text: `Reply sticker!\nContoh: ${m.prefix}${m.command} (reply sticker)` }, { quoted: m });
            }
            if (!/sticker|webp/.test(m.quoted.type)) {
                
                return naze.sendMessage(m.chat, { text: `Reply sticker!\nContoh: ${m.prefix}${m.command} (reply sticker)` }, { quoted: m });
            }

            const img = new Image();
            await img.load(await m.quoted.download());
            const exifData = JSON.parse(img.exif.slice(22).toString());

            
            return naze.sendMessage(m.chat, { text: util.format(exifData) }, { quoted: m });
        } catch (err) {
            console.error(`Gagal mengambil Exif: ${err.message}`);
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};