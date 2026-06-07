require('../../settings');

module.exports = {
    name: 'grup-close',
    alias: ['grup-close', 'group-close', 'tutup-grup', 'grupclose','closegrup'],
    run: async ({ naze, m }) => {
        if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

        try {
            
            await naze.groupSettingUpdate(m.chat, 'announcement');
            
            await m.reply('🔒 *Group telah ditutup!*\nHanya admin yang dapat mengirim pesan.');
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};