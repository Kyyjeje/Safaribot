require('../../settings');
const axios = require('axios');

module.exports = {
    name: 'gsmarena',
    alias: ['gsmtalk', 'gsmsearch'],
    run: async ({ naze, m, args, text }) => {
        try {
            
            

            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Harap masukkan nama smartphone yang ingin dicari.\nContoh: ${m.prefix}${m.command} Poco F4` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            let { data } = await axios.get(`https://api.siputzx.my.id/api/s/gsmarena?query=${encodeURIComponent(text)}`);
            let topPhone = data.data[0];

            if (!topPhone || !topPhone.name || !topPhone.thumbnail || !topPhone.description) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Smartphone tidak ditemukan, coba kata kunci lain.` }, { quoted: m });
            }

            let phoneImageUrl = topPhone.thumbnail;
            let phoneName = topPhone.name;
            let phoneDescription = topPhone.description;
            const caption = `📱 *Smartphone: ${phoneName}*\n\n📝 *Deskripsi:* ${phoneDescription}\n\n🔗 *Lihat lebih lanjut:* \nhttps://www.gsmarena.com/${topPhone.id}`;

            await naze.sendMessage(m.chat, { image: { url: phoneImageUrl }, caption: caption }, { quoted: m });
            
        } catch (e) {
            console.error(`Fatal error di gsmarena: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};