require('../../settings');
const axios = require("axios");

module.exports = {
    name: 'magicstudio',
    alias: ['magicstudio', 'magicimage', 'magicimg'],
    run: async ({ naze, m }) => {
        const body = (m.type === 'conversation') ? m.message.conversation : 
                     (m.type == 'extendedTextMessage') ? m.message.extendedTextMessage.text : '';
        const args = body.trim().split(/ +/).slice(1);
        if (!args.length) return m.reply("⚠️ Mohon masukkan prompt untuk membuat gambar!\n\nContoh: *.magicstudio mobil futuristik terbang*");
        await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
        const prompt = encodeURIComponent(args.join(" "));
        const apiUrl = `https://api.siputzx.my.id/api/ai/magicstudio?prompt=${prompt}`;
        try {
            
            let { data } = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            if (!data) return m.reply("❌ Gagal membuat gambar!");
            await naze.sendMessage(m.chat, { image: data, caption: `🖼️ *Gambar Hasil AI:*\n*${args.join(" ")}*` }, { quoted: m });
            
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};
