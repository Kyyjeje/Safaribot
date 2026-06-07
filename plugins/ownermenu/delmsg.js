require('../../settings');

module.exports = {
    name: 'delmsg',
    alias: ['delmsg'],
    description: '<nama/allmsg>',
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
            const text = args.join(' ').trim();
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <nama>\`\n> Contoh: \`${m.prefix}${m.command} pesan1\`\n> atau \`${m.prefix}${m.command} allmsg\`\n> Untuk menghapus pesan atau semua pesan` }, { quoted: m });
            }

            let msgs = global.db.database;
            if (text === 'allmsg') {
                global.db.database = {};
                
                await naze.sendMessage(m.chat, { text: '✅ Berhasil menghapus seluruh pesan dari list pesan' }, { quoted: m });
            } else {
                if (!(text.toLowerCase() in msgs)) {
                    
                    return naze.sendMessage(m.chat, { text: `❌ '${text}' tidak terdaftar di dalam list pesan` }, { quoted: m });
                }
                delete msgs[text.toLowerCase()];
                
                await naze.sendMessage(m.chat, { text: `✅ Berhasil menghapus '${text}' dari list pesan` }, { quoted: m });
            }
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};