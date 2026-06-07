const fs = require('fs');
require('../../settings');

module.exports = {
    name: 'getfile',
    alias: ['getfile'],
    description: '<path file>',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            const from = m.chat || m.sender;
            const body = m.type === 'conversation' ? m.message.conversation :
                         m.type === 'imageMessage' ? m.message.imageMessage.caption :
                         m.type === 'videoMessage' ? m.message.videoMessage.caption :
                         m.type === 'extendedTextMessage' ? m.message.extendedTextMessage.text :
                         m.type === 'buttonsResponseMessage' ? m.message.buttonsResponseMessage.selectedButtonId :
                         m.type === 'listResponseMessage' ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                         m.type === 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId :
                         m.type === 'messageContextInfo' ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) :
                         m.type === 'editedMessage' ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage?.text || m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
            const args = body.trim().split(/ +/).slice(1);
            const filePath = args.join(' ').trim();

            if (!filePath) {
                
                return naze.sendMessage(from, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <path file>\`\n> Contoh: \`${m.prefix}${m.command} ./folder/subfolder/nama_file.json\`` }, { quoted: m });
            }

            const fileLocation = filePath.startsWith('.././/') ? filePath : `./${filePath}`;
            if (fs.existsSync(fileLocation) && fs.lstatSync(fileLocation).isFile()) {
                await naze.sendMessage(from, {
                    document: { url: fileLocation },
                    mimetype: 'application/octet-stream',
                    fileName: filePath.split('/').pop()
                }, { quoted: m });
                
            } else {
                
                await naze.sendMessage(from, { text: `❌ File *${filePath}* tidak ditemukan atau bukan file yang valid.` }, { quoted: m });
            }
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};