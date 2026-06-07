require('../../settings');

module.exports = {
    name: 'demote',
    alias: ['demote','jadiadmin'],
    description: '<nomor/@tag/reply>',
    run: async ({ naze, m }) => {
        const body = m.type === 'conversation' ? m.message.conversation :
                     m.type === 'imageMessage' ? m.message.imageMessage.caption :
                     m.type === 'videoMessage' ? m.message.videoMessage.caption :
                     m.type === 'extendedTextMessage' ? m.message.extendedTextMessage.text :
                     m.type === 'buttonsResponseMessage' ? m.message.buttonsResponseMessage.selectedButtonId :
                     m.type === 'listResponseMessage' ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                     m.type === 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId :
                     m.type === 'messageContextInfo' ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) :
                     m.type === 'editedMessage' ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage ? m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage.text : m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
        const args = body.trim().split(/ +/).slice(1);
        const quoted = m.quoted ? m.quoted : m;
        const text = args.join(' ');

        if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

        if (!text && !m.quoted) {
            
            return m.reply(`*Format salah!*\nGunakan perintah: *${m.prefix}${m.command} <nomor/tag>*\nContoh: *${m.prefix}${m.command} 6281234567890*`);
        }

        try {
            
            const numbersOnly = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender;
            await naze.groupParticipantsUpdate(m.chat, [numbersOnly], 'demote');
            
        } catch (err) {
            
            await m.reply('Gagal menurunkan status admin!');
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};