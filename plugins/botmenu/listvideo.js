const { globalSettings } = require('../../settings');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'listvideo',
    alias: ['listvid','videolist','vidlist'],
    run: async ({ naze, m }) => {
        try {
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            const filePath = path.join(__dirname, '../../data/media/database/video.json');
            if (!fs.existsSync(filePath)) {
                
                return m.reply('Database video tidak ditemukan.');
            }

            const Video = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            if (!Array.isArray(Video) || Video.length === 0) {
                
                return m.reply('Tidak ada video yang tersedia.');
            }

            let teks = `${global.simbol.barisjudul} *Video List*\n${global.simbol.tutupjudul}\n`;
            for (let x of Video) {
                teks += `${global.simbol.barisfitur} ${x}\n`;
            }
            teks += `${global.simbol.penutup}\n\n*Total: ${Video.length}*`;

            await m.reply(teks);
            
        } catch (err) {
            
            await global.handleError(naze, m, err, {
                sendRawError: true,
                useGemini: true
            });
        }
    }
};