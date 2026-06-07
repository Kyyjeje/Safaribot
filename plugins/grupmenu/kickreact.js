require('../../settings');

module.exports = {
    name: 'kickreact',
    alias: ['kickreact', '🔫'],
    description: '<reaction pesan>',
    run: async ({ naze, m }) => {
        if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);
        if (!m.message.reactionMessage) return;
        
        const emoji = m.message.reactionMessage.text;
        const messageId = m.message.reactionMessage.key.id;
        const sender = m.message.reactionMessage.key.participant;

        if (emoji !== '🔫') return;

        try {
            
            await naze.groupParticipantsUpdate(m.chat, [sender], 'remove');
            await naze.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.chat,
                    fromMe: false,
                    id: messageId,
                    participant: sender
                }
            });
            
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};