require('../../settings');

module.exports = {
  name: 'setnamegrup',
  alias: ['setname', 'setnamegc', 'setsubject', 'setsubjectgc'],
  description: '<teks/reply>',
  run: async ({ naze, m }) => {
    try {
      

      const body = (m.type === 'conversation') ? m.message.conversation :
                   (m.type === 'imageMessage') ? m.message.imageMessage.caption :
                   (m.type === 'videoMessage') ? m.message.videoMessage.caption :
                   (m.type === 'extendedTextMessage') ? m.message.extendedTextMessage.text :
                   (m.type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId :
                   (m.type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                   (m.type === 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId :
                   (m.type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) :
                   (m.type === 'editedMessage') ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage?.text || m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
      const args = body.trim().split(/ +/).slice(1);
      const text = args.join(' ');
      const teksnya = text ? text : m.quoted?.text;

      if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        if (!m.isBotAdmin) return  global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);


      if (!teksnya) {
        
        await m.reply(`*Format salah!* Gunakan perintah:\n\`${m.prefix}${m.command} <teks>\`\n> masukkan teks atau reply pesan\n\nContoh: \`${m.prefix}${m.command} Grup Baru\``);
        return;
      }

      await naze.groupUpdateSubject(m.chat, teksnya);
      
      await m.reply('Nama grup berhasil diubah.');
    } catch (err) {
      
      await m.reply('Gagal mengubah nama grup.');
      await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
    }
  }
};