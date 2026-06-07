require('../../settings');

module.exports = {
    name: 'addmsg',
    alias: ['msgadd'],
    description: '(reply pesan) <nama>',
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
            const quoted = m.quoted ? m.quoted : m;
            const text = args.join(' ');
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            if (!quoted) {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <nama>\`\n> Contoh: \`${m.prefix}${m.command} waalaikumsalam\`\n> Reply pesan yang ingin disimpan` }, { quoted: m });
            }

            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <nama>\`\n> Contoh: \`${m.prefix}${m.command} waalaikumsalam\`\n> Masukkan nama pesan` }, { quoted: m });
            }

            let msgs = global.db.database;
            if (text.toLowerCase() in msgs) {
                
                return naze.sendMessage(m.chat, { text: `❌ "${text}" telah terdaftar di list pesan!` }, { quoted: m });
            }

            msgs[text.toLowerCase()] = quoted;
            delete msgs[text.toLowerCase()].chat;

            
            await naze.sendMessage(m.chat, { text: `✅ Berhasil menambahkan pesan di list pesan sebagai "${text}"\nAkses otomatis dengan mengirim "${text}"\nLihat list Pesan Dengan \`${m.prefix}listmsg\`` }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};