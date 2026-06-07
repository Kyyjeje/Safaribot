const { globalSettings } = require('../../settings');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'listimage',
    alias: ['listimg','listgambar','gambarlist','imagelist','imglist'],
    run: async ({ naze, m }) => {
        try {
            

            const filePath = path.join(__dirname, '../../data/media/database/image.json');
            if (!fs.existsSync(filePath)) {
                
                return m.reply('Database image tidak ditemukan.');
            }

            const Image = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            if (!Array.isArray(Image) || Image.length === 0) {
                
                return m.reply('Tidak ada gambar yang tersedia.');
            }

            let teks = `${global.simbol.barisjudul} *Image List*\n${global.simbol.tutupjudul}\n`;
            for (let x of Image) {
                teks += `${global.simbol.barisfitur} ${x}\n`;
            }
            teks += `${global.simbol.penutup}\n\n*Total: ${Image.length}*`;

            await m.reply(teks);
            
        } catch (err) {
            
            await global.handleError(naze, m, err, {
                sendRawError: true,
                useGemini: true
            });
        }
    }
};