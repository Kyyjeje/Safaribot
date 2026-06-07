require('../../settings');
const axios = require('axios');

module.exports = {
  name: 'waktupuasa',
  alias: ['waktupuasa'],
  description: '<on/off>',
  run: async ({ naze, m, text }) => {
    try {
      

      if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        if (!m.isBotAdmin) return  global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);


      if (!global.db) global.db = {};
      if (!global.db.groups) global.db.groups = {};
      if (!global.db.groups[m.chat]) global.db.groups[m.chat] = {};

      if (text === 'on') {
        if (global.db.groups[m.chat].waktupuasa) {
          
          await m.reply('Fitur waktu puasa sudah aktif sebelumnya.');
          return;
        }
        global.db.groups[m.chat].waktupuasa = true;
        
        await m.reply('Fitur waktu puasa berhasil diaktifkan.');
      } else if (text === 'off') {
        if (!global.db.groups[m.chat].waktupuasa) {
          
          await m.reply('Fitur waktu puasa sudah nonaktif sebelumnya.');
          return;
        }
        global.db.groups[m.chat].waktupuasa = false;
        
        await m.reply('Fitur waktu puasa berhasil dinonaktifkan.');
      } else {
        
        await m.reply(`*Format salah!* Gunakan perintah:\n\`${m.prefix}${m.command} on\`\n> untuk mengaktifkan\n\n\`${m.prefix}${m.command} off\`\n> untuk menonaktifkan`);
      }
    } catch (err) {
      
      await m.reply('Gagal mengatur fitur waktu puasa.');
      await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
    }
  }
};