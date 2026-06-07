require('../../settings');
const axios = require('axios');

module.exports = {
    name: 'bingimage',
    alias: ['bimg', 'bing','bingimg','imgbing'],
    description: '<teks>',
    run: async ({ naze, m, args, text }) => {
        try {
            

            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Harap masukkan kata kunci untuk pencarian gambar.\nContoh: ${m.prefix}${m.command} mobil terbang` }, { quoted: m });
            }

            let { data } = await axios.get(`https://api.siputzx.my.id/api/s/bimg?query=${encodeURIComponent(text)}`);
            let topImage = data.data[0];

            if (!topImage) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Gambar tidak ditemukan, coba kata kunci lain.` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            let imageUrl = topImage;
            const caption = `✨ Berikut adalah gambar yang ditemukan berdasarkan kata kunci *${text}*.\n\n🔗 Gambar URL: \n${imageUrl}`;

            await naze.sendMessage(m.chat, { image: { url: imageUrl }, caption: caption }, { quoted: m });
            
        } catch (e) {
            console.error(`Fatal error di bingimage: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};