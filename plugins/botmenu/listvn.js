const { globalSettings } = require('../../settings');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'listvn',
    alias: ['listvoicenote','vnlist','voicenotelist'],
    run: async ({ naze, m }) => {
        try {
            

            const filePath = path.join(__dirname, '../../data/media/database/vn.json');
            if (!fs.existsSync(filePath)) {
                
                return m.reply('Database vn tidak ditemukan.');
            }

            const VoiceNote = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            if (!Array.isArray(VoiceNote) || VoiceNote.length === 0) {
                
                return m.reply('Tidak ada voice yang tersedia.');
            }

            let teks = `${global.simbol.barisjudul} *VoiceNote List*\n${global.simbol.tutupjudul}\n`;
            for (let x of VoiceNote) {
                teks += `${global.simbol.barisfitur} ${x}\n`;
            }
            teks += `${global.simbol.penutup}\n\n*Total: ${VoiceNote.length}*`;

            await m.reply(teks);
            
        } catch (err) {
            
            await global.handleError(naze, m, err, {
                sendRawError: true,
                useGemini: true
            });
        }
    }
};