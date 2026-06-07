require('../../settings');
const { generateWAMessage } = require('baileys');
const { generateMessageID } = require('baileys/lib/Utils/generics');

module.exports = {
  name: 'pinchat',
  alias: ['pinpesan'],
  description: '<reply> [24h/7d/30d]',
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
      const isUnpin = body === '.unpin' || args[0]?.toLowerCase() === 'unpin';

      if (!m.isGroup) {
        await global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        return;
      }

      if (!m.isBotAdmin) {
        await global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);
        return;
      }

      if (isUnpin) {
        if (!m.quoted) {
          
          await m.reply(`*Format salah!* Gunakan perintah:\n\`${m.prefix}unpin\`\n> reply pesan yang ingin di-unpin`);
          return;
        }

        await naze.sendMessage(m.chat, { pin: { type: 0, key: m.quoted.key } });
        
        await m.reply('Pesan berhasil di-unpin.');
        return;
      }

      if (!m.quoted) {
        
        await m.reply(`*Format salah!* Gunakan perintah:\n\`${m.prefix}${m.command} [24h/7d/30d]\`\n> reply pesan yang ingin di-pin\n\nContoh: \`${m.prefix}${m.command} 7d\``);
        return;
      }

      let duration = 86400;
      let durationText = '24 jam';
      if (args[0]) {
        const timeArg = args[0].toLowerCase();
        if (timeArg === '7d') {
          duration = 604800;
          durationText = '7 hari';
        } else if (timeArg === '30d') {
          duration = 2592000;
          durationText = '30 hari';
        } else if (timeArg !== '24h') {
          
          await m.reply(`*Format salah!* Gunakan perintah:\n\`${m.prefix}${m.command} [24h/7d/30d]\`\n> reply pesan yang ingin di-pin\n\nContoh: \`${m.prefix}${m.command} 7d\``);
          return;
        }
      }

      
      await naze.sendMessage(m.chat, { pin: { type: 1, time: duration, key: m.quoted.key } });
      
      await m.reply(`Pesan berhasil di-pin selama ${durationText}.`);
    } catch (err) {
      
      await m.reply('Gagal mem-pin pesan.');
      await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
    }
  }
};