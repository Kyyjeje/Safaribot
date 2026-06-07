const { globalSettings } = require('../../settings');

module.exports = {
    name: 'getmsg',
    alias: ['getmessage'],
    description: '<nama pesan>',
    run: async ({ naze, m }) => {
        try {
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            const body = m.type === 'conversation' ? m.message.conversation :
                         m.type === 'imageMessage' ? m.message.imageMessage.caption || '' :
                         m.type === 'videoMessage' ? m.message.videoMessage.caption || '' :
                         m.type === 'extendedTextMessage' ? m.message.extendedTextMessage.text || '' :
                         m.type === 'buttonsResponseMessage' ? m.message.buttonsResponseMessage.selectedButtonId || '' :
                         m.type === 'listResponseMessage' ? m.message.listResponseMessage.singleSelectReply.selectedRowId || '' :
                         m.type === 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId || '' :
                         m.type === 'messageContextInfo' ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) || '' :
                         m.type === 'editedMessage' ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage?.text || m.message.editedMessage.message.protocolMessage.editedMessage.conversation) || '' : '';

            const args = body.trim().split(/ +/).slice(1);
            const text = args.join(' ');

            if (!text) {
                
                return m.reply('Example: .getmsg <file name>\n\nLihat list pesan dengan .listmsg');
            }

            if (!global.db || !global.db.database) {
                
                return m.reply('Database pesan tidak ditemukan atau kosong.');
            }

            const msgs = global.db.database;
            if (!(text.toLowerCase() in msgs)) {
                
                return m.reply(`'${text}' tidak terdaftar di list pesan`);
            }

            await naze.relayMessage(m.chat, msgs[text.toLowerCase()], {});
            
        } catch (err) {
            
            await global.handleError(naze, m, err, {
                sendRawError: true,
                useGemini: true
            });
        }
    }
};