require('../../settings');

module.exports = {
  name: 'promote',
  alias: ['promote'],
  description: '<nomor/reply>',
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
      const target = text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : m.quoted?.sender;

      if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        if (!m.isBotAdmin) return  global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);


      if (!text && !m.quoted) {
        
        await m.reply(`*Format salah!* Gunakan perintah:\n\`${m.prefix}${m.command} <nomor>\`\n> reply pesan atau masukkan nomor\n\nContoh: \`${m.prefix}${m.command} 6281234567890\``);
        return;
      }

      await naze.groupParticipantsUpdate(m.chat, [target], 'promote');
      
      await m.reply('Pengguna berhasil dipromosikan menjadi admin.');
    } catch (err) {
      
      await m.reply('Gagal mempromosikan pengguna.');
      await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
    }
  }
};