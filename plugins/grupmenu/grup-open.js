require('../../settings');

module.exports = {
    name: 'grup-open',
    alias: ['grup-open', 'group-open', 'buka-grup', 'grupopen'],
    run: async ({ naze, m }) => {
        if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

        try {
            
            await naze.groupSettingUpdate(m.chat, 'not_announcement');
            
            await m.reply('🔓 *Group telah dibuka!*\nSemua anggota dapat mengirim pesan.');
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};