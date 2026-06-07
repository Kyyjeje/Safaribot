require('../../settings');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    name: 'bratvid',
    alias: ['bratvideo'],
    description: '<teks>',
    run: async ({ naze, m, db }) => {
        try {
            const text = m.text?.split(' ').slice(1).join(' ') || (m.quoted?.text || '');
            if (!text) {
                return naze.sendMessage(m.chat, { text: `⚠️ Kirim/reply pesan dengan teks!\nContoh: ${m.prefix}${m.command} Halo` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            const tempDir = path.join(__dirname, '../../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const outputPath = path.join(tempDir, `${m.sender}-output.mp4`);
            const res = await axios.get(`https://brat.siputzx.my.id/mp4?text=${encodeURIComponent(text)}`, { responseType: 'arraybuffer' });
            fs.writeFileSync(outputPath, res.data);

            await naze.sendAsSticker(m.chat, outputPath, m, { packname: packname, author: author });

            fs.readdirSync(tempDir).forEach(file => fs.unlinkSync(path.join(tempDir, file)));
        } catch (e) {
            console.error(`Fatal error di bratvid: ${e.message}\nStack: ${e.stack}`);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};