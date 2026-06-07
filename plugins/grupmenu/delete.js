require('../../settings');

module.exports = {
    name: 'delete',
    alias: ['delete', 'd', 'del', '❌'],
    description: '<reply pesan>',
    run: async ({ naze, m, reaction }) => {
        if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        // if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

        let targetMessage = m.quoted || (reaction && reaction.text === '❌' ? reaction.message : null);

        if (!targetMessage) {
            
            return m.reply(`*Format salah!*\nReply atau react pesan yang ingin dihapus dengan\n\`${m.prefix}${m.command}*\` atau ❌`);
        }

        try {
            
            await naze.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.chat,
                    fromMe: targetMessage.fromMe,
                    id: targetMessage.id,
                    participant: targetMessage.sender
                }
            });
            
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};