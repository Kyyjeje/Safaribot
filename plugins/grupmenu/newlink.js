require('../../settings');

module.exports = {
  name: 'newlink',
  alias: ['revoke', 'newurl', 'resetlinkgc'],
  run: async ({ naze, m }) => {
    if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
    if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
    if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

    try {
      
      await naze.groupRevokeInvite(m.chat);
      
      await m.reply(`Tautan undangan grup ${m.metadata.subject} berhasil disetel ulang.`);
    } catch (err) {
      
      await m.reply('Gagal menyetel ulang tautan undangan.');
      await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
    }
  }
};