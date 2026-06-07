require('../../settings');

module.exports = {
  name: 'tagall',
  alias: ['taganggota', 'tagallmember'], // Pastikan ini array
  description: '<teks>',
  run: async ({ naze, m, text }) => {
    try {
      if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
      if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
      if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

      // Ambil pesan dari reply (jika ada) atau dari teks setelah perintah
      let message;
      if (m.quoted) {
        // Jika ada reply, ambil teks dari pesan yang di-reply
        message = m.quoted.message.conversation || m.quoted.message.extendedTextMessage?.text || '';
      } else {
        // Jika tidak ada reply, gunakan text (teks setelah perintah)
        message = text ? text.trim() : '';
      }

      let teks = `✨ Tag Semua Anggota ✨\n*Pesan:* \n${message || '(Tidak ada keterangan)'}\n\n\`Daftar Anggota:\`\n`;
      for (let mem of m.metadata.participants) {
        teks += `- @${mem.id.split('@')[0]}\n`;
      }
      teks += ``;

      await naze.sendMessage(m.chat, { text: teks, mentions: m.metadata.participants.map(a => a.id) }, { quoted: m });
    } catch (err) {
      await naze.sendMessage(m.chat, { text: 'Gagal menandai semua anggota.' }, { quoted: m });
      await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
    }
  }
};