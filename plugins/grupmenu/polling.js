require('../../settings');
const { generateWAMessage } = require('baileys');
const { generateMessageID } = require('baileys/lib/Utils/generics');
const crypto = require('crypto');

async function sendPoll(naze, jid, pollName, options, selectableCount = 1, toAnnouncement = false, quoted = null) {
  try {
    const pollContent = {
      poll: {
        name: pollName,
        values: options,
        selectableCount: selectableCount,
        toAnnouncementGroup: toAnnouncement
      },
      viewOnce: true
    };

    const pollMsg = await generateWAMessage(
      jid,
      pollContent,
      {
        userJid: naze.user.id,
        messageId: generateMessageID(),
        quoted: quoted
      }
    );
    return await naze.relayMessage(jid, pollMsg.message, { messageId: pollMsg.key.id });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  name: 'poll',
  alias: ['polling', 'vote'],
  //description: '<judul> | <opsi1> | <opsi2> [| <opsi3>]',
  run: async ({ naze, m, text }) => {
    try {
      

      if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        if (!m.isBotAdmin) return  global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);


      if (!text) {
        
        await m.reply(`*Format salah!* Gunakan perintah:\n\`${m.prefix}${m.command} <judul> | <opsi1> | <opsi2> [| <opsi3> ...]\`\n> masukkan judul dan minimal 2 opsi\n\nContoh: \`${m.prefix}${m.command} Siapa mau kue? | Aku mau | Aku gamau\``);
        return;
      }

      const [pollName, ...options] = text.split('|').map(item => item.trim());
      if (!pollName || options.length < 2) {
        
        await m.reply(`*Format salah!* Gunakan perintah:\n\`${m.prefix}${m.command} <judul> | <opsi1> | <opsi2> [| <opsi3> ...]\`\n> masukkan judul dan minimal 2 opsi\n\nContoh: \`${m.prefix}${m.command} Siapa mau kue? | Aku mau | Aku gamau\``);
        return;
      }

      const selectableCount = 1;
      if (selectableCount > options.length) {
        
        await m.reply(`Jumlah pilihan (${selectableCount}) tidak boleh lebih dari jumlah opsi (${options.length}).`);
        return;
      }

      await sendPoll(naze, m.chat, pollName, options, selectableCount, false, m);
      
    } catch (err) {
      
      await m.reply('Gagal membuat polling.');
      await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
    }
  }
};