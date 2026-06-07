require('../../settings');

module.exports = {
  name: 'pesanharian',
  alias: ['pesandaily','dailypesan','harianpesan','messagedaily','dailymessage','pesan-daily','daily-pesan'],
  description: '<on/off>',
  run: async ({ naze, m, text }) => {
    try {
      if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
      if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
      if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

      if (!global.db) global.db = {};
      if (!global.db.groups) global.db.groups = {};
      if (!global.db.groups[m.chat]) global.db.groups[m.chat] = {};

      if (text === 'on') {
        if (global.db.groups[m.chat].dailyActive) {
          await m.reply('Fitur pesan harian sudah aktif sebelumnya.');
          return;
        }
        global.db.groups[m.chat].dailyActive = true;
        await m.reply(`Fitur pesan harian berhasil diaktifkan pada waktu \`07:30\`.`);
      } else if (text === 'off') {
        if (!global.db.groups[m.chat].dailyActive) {
          await m.reply('Fitur pesan harian sudah nonaktif sebelumnya.');
          return;
        }
        global.db.groups[m.chat].dailyActive = false;
        await m.reply('Fitur pesan harian berhasil dinonaktifkan.');
      } else {
        await m.reply(`*Format salah!* Gunakan perintah:\n\`${m.prefix}${m.command} on\`\n> untuk mengaktifkan\n\n\`${m.prefix}${m.command} off\`\n> untuk menonaktifkan`);
      }
    } catch (err) {
      await m.reply('Gagal mengatur fitur pesan harian.');
      await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
    }
  }
};