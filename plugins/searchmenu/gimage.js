require('../../settings');
const axios = require('axios');

module.exports = {
    name: 'googleimage',
    alias: ['imgsearch', 'gimage', 'googleimg'],
    description: '<teks>',
    run: async ({ naze, m, args, text }) => {
        try {
            
            

            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Harap masukkan kata kunci untuk pencarian gambar.\nContoh: ${m.prefix}${m.command} mobil terbang` }, { quoted: m });
            }

            let { data } = await axios.get(`https://api.siputzx.my.id/api/images?query=${encodeURIComponent(text)}`);
            let topImage = data.data[0];

            if (!topImage || !topImage.url) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Gambar tidak ditemukan, coba kata kunci lain.` }, { quoted: m });
            }

            let imageUrl = topImage.url;
            const caption = `✨ Berikut adalah gambar yang ditemukan berdasarkan kata kunci *${text}*.\n\n🔗 Lihat lebih lanjut: \n${imageUrl}`;

            await naze.sendMessage(m.chat, { image: { url: imageUrl }, caption: caption }, { quoted: m });
            
        } catch (e) {
            console.error(`Fatal error di googleimage: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};