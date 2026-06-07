require('../../settings');

module.exports = {
  name: 'totag',
  alias: ['totag'],
  description: '<reply>',
  run: async ({ naze, m }) => {
    try {
      

      if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        if (!m.isBotAdmin) return  global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);


      if (!m.quoted) {
        
        await m.reply(`*Format salah!* Gunakan perintah:\n\`${m.prefix}${m.command}\`\n> reply pesan untuk menandai semua anggota`);
        return;
      }

      delete m.quoted.chat;
      await naze.sendMessage(m.chat, { forward: m.quoted.fakeObj, mentions: m.metadata.participants.map(a => a.id) });
      
    } catch (err) {
      
      await m.reply('Gagal menandai semua anggota.');
      await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
    }
  }
};