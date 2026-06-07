require('../../settings');

module.exports = {
    name: 'hidetag',
    alias: ['hidetag', 'h'],
    description: '<teks/reply>',
    run: async ({ naze, m, q }) => {
        if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

        try {
            

            // Ambil teks dari input atau quoted message
            const body = (m.type === 'conversation') ? m.message.conversation :
                         (m.type === 'imageMessage') ? m.message.imageMessage.caption :
                         (m.type === 'videoMessage') ? m.message.videoMessage.caption :
                         (m.type === 'extendedTextMessage') ? m.message.extendedTextMessage.text :
                         (m.type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId :
                         (m.type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                         (m.type === 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId :
                         (m.type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) :
                         (m.type === 'editedMessage') ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage?.text || m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
            const args = body ? body.trim().split(/ +/).slice(1) : [];
            const teks = q || args.join(' ') || (m.quoted ? m.quoted.text : '');
            
            if (!teks) {
                
                return m.reply(`
🌟 Fitur Hidetag 🌟
━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *Teks tidak diberikan!*
Gunakan: *${m.prefix}${m.command} <teks>* atau reply pesan.
Contoh: *${m.prefix}${m.command} Halo semua!*
━━━━━━━━━━━━━━━━━━━━━━━
                `);
            }

            await naze.sendMessage(m.chat, {
                text: teks,
                mentions: m.metadata.participants.map(a => a.id)
            }, { quoted: m });
            
        } catch (err) {
            
            await m.reply('⚠️ Terjadi kesalahan saat menjalankan hidetag.');
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};