require('../../settings');
const axios = require('axios');

module.exports = {
    name: 'readsw',
    alias: ['readsw'],
    description: '<on/off>',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            

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
            const text = args.join(' ').toLowerCase();

            if (!global.db.set) global.db.set = {};
            if (!global.db.set[botNumber]) global.db.set[botNumber] = {};

            if (text === 'on') {
                if (global.db.set[botNumber].readsw) {
                    
                    return naze.sendMessage(m.chat, { text: '*Sudah Aktif Sebelumnya*' }, { quoted: m });
                }
                global.db.set[botNumber].readsw = true;
                
                await naze.sendMessage(m.chat, { text: '*Read Story Aktif!*' }, { quoted: m });
            } else if (text === 'off') {
                if (!global.db.set[botNumber].readsw) {
                    
                    return naze.sendMessage(m.chat, { text: '*Sudah Tidak Aktif Sebelumnya*' }, { quoted: m });
                }
                global.db.set[botNumber].readsw = false;
                
                await naze.sendMessage(m.chat, { text: '*Read Story Tidak Aktif!*' }, { quoted: m });
            } else {
                
                await naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} on\` _(untuk mengaktifkan)_\n> \`${m.prefix}${m.command} off\` _(untuk menonaktifkan)_` }, { quoted: m });
            }
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};