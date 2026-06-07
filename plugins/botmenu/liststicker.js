const { globalSettings } = require('../../settings');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'liststicker',
    alias: ['liststick','liststiker','stickerlist'],
    run: async ({ naze, m }) => {
        try {
            

            const StickerPath = path.join(__dirname, '../../data/media/database/sticker.json');
            const stickerDir = path.join(__dirname, '../../data/media/sticker/');

            const body = m.type === 'conversation' ? m.message.conversation :
                         m.type === 'imageMessage' ? m.message.imageMessage.caption || '' :
                         m.type === 'videoMessage' ? m.message.videoMessage.caption || '' :
                         m.type === 'extendedTextMessage' ? m.message.extendedTextMessage.text || '' :
                         m.type === 'buttonsResponseMessage' ? m.message.buttonsResponseMessage.selectedButtonId || '' :
                         m.type === 'listResponseMessage' ? m.message.listResponseMessage.singleSelectReply.selectedRowId || '' :
                         m.type === 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId || '' :
                         m.type === 'messageContextInfo' ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) || '' :
                         m.type === 'editedMessage' ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage?.text || m.message.editedMessage.message.protocolMessage.editedMessage.conversation) || '' : '';

            const Sticker = JSON.parse(fs.readFileSync(StickerPath));
            for (let namanya of Sticker) {
                if (body === namanya) {
                    const stickerPath = path.join(stickerDir, `${namanya}.webp`);
                    if (!fs.existsSync(stickerPath)) {
                        
                        return m.reply('Sticker tidak ditemukan di direktori.');
                    }

                    const stickerbuffy = fs.readFileSync(stickerPath);
                    await naze.sendMessage(m.chat, { sticker: stickerbuffy }, { quoted: m });
                    
                    return;
                }
            }

            let teks = `${global.simbol.barisjudul} *Sticker List*\n${global.simbol.tutupjudul}\n`;
            for (let x of Sticker) {
                teks += `${global.simbol.barisfitur} ${x}\n`;
            }
            teks += `${global.simbol.penutup}\n\n*Total: ${Sticker.length}*`;

            await m.reply(teks);
            
        } catch (err) {
            
            await global.handleError(naze, m, err, {
                sendRawError: true,
                useGemini: true
            });
        }
    }
};