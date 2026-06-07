require('../../settings');

module.exports = {
  name: 'tagadmin',
  alias: ['tagadmins', 'tagadministrator'],
  description: '<teks>',
  run: async ({ naze, m, text }) => {
    try {
      if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
      if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
      if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

      let message;
      if (m.quoted) {
        message = m.quoted.message.conversation || m.quoted.message.extendedTextMessage?.text || '';
      } else {
        message = text ? text.trim() : '';
      }

      let teks = `✨ Tag Semua Admin ✨\n*Pesan:* \n${message || '(Tidak ada keterangan)'}\n\n\`Daftar Admin:\`\n`;
      const admins = m.metadata.participants.filter(mem => mem.admin); 
      for (let mem of admins) {
        teks += `- @${mem.id.split('@')[0]}\n`;
      }
      teks += ``;

      if (admins.length === 0) {
        return await naze.sendMessage(m.chat, { text: 'Tidak ada admin di grup ini.' }, { quoted: m });
      }

      await naze.sendMessage(m.chat, { text: teks, mentions: admins.map(a => a.id) }, { quoted: m });
    } catch (err) {
      await naze.sendMessage(m.chat, { text: 'Gagal menandai semua admin.' }, { quoted: m });
      await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
    }
  }
};