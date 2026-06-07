require('../../settings');

module.exports = {
    name: 'autoread',
    alias: ['autoread'],
    description: '<on/off>',
    run: async ({ naze, m }) => {
        try {
            
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
            const text = args.join(' ');
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            if (text === 'on') {
                if (db.set[botNumber].autoread) {
                    
                    return naze.sendMessage(m.chat, { text: '*Sudah Aktif Sebelumnya*' }, { quoted: m });
                }
                db.set[botNumber].autoread = true;
                
                await naze.sendMessage(m.chat, { text: '*Auto Read Aktif!*' }, { quoted: m });
            } else if (text === 'off') {
                db.set[botNumber].autoread = false;
                
                await naze.sendMessage(m.chat, { text: '*Auto Read Tidak Aktif!*' }, { quoted: m });
            } else {
                
                await naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} on\`\n> Untuk mengaktifkan auto read\n\n\`${m.prefix}${m.command} off\`\n> Untuk menonaktifkan auto read` }, { quoted: m });
            }
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};