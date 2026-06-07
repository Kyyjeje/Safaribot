require('../../settings');
const { jidNormalizedUser } = require('baileys');

module.exports = {
  name: 'setout',
  alias: ['setout'],
  description: '<teks/default>',
  run: async ({ naze, m }) => {
    try {
      

      let body = '';
      if (m.type === 'conversation') {
        body = m.message.conversation;
      } else if (m.type === 'imageMessage') {
        body = m.message.imageMessage.caption;
      } else if (m.type === 'videoMessage') {
        body = m.message.videoMessage.caption;
      } else if (m.type === 'extendedTextMessage') {
        body = m.message.extendedTextMessage.text;
      } else if (m.type === 'buttonsResponseMessage') {
        body = m.message.buttonsResponseMessage.selectedButtonId || '';
      } else if (m.type === 'listResponseMessage') {
        body = m.message.listResponseMessage.singleSelectReply.selectedRowId || '';
      } else if (m.type === 'templateButtonReplyMessage') {
        body = m.message.templateButtonReplyMessage.selectedId || '';
      } else if (m.type === 'interactiveResponseMessage') {
        const nativeFlowResponse = m.message.interactiveResponseMessage?.nativeFlowResponseMessage;
        if (nativeFlowResponse && nativeFlowResponse.paramsJson) {
          const params = JSON.parse(nativeFlowResponse.paramsJson);
          body = params.id || '';
        }
      } else if (m.type === 'messageContextInfo') {
        body = (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) || '';
      } else if (m.type === 'editedMessage') {
        body = (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage?.text || m.message.editedMessage.message.protocolMessage.editedMessage.conversation) || '';
      }

      const args = body.trim().split(/ +/).slice(1);
      const text = args.join(' ').trim();

      if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        if (!m.isBotAdmin) return  global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);


      if (!global.db) global.db = {};
      if (!global.db.groups) global.db.groups = {};
      if (!global.db.groups[m.chat]) global.db.groups[m.chat] = { welcome: true };

      if (!text) {
        const initialOut = global.db.groups[m.chat].setout || 'Default';
        
        await m.reply(`*Pesan keluar saat ini*:\n${initialOut}\n\n*Format salah!* Gunakan perintah:\n\`${m.prefix}${m.command} <teks>\`\n> atur pesan keluar\n\n\`${m.prefix}${m.command} default\`\n> kembali ke pesan default\n\nContoh: \`${m.prefix}${m.command} Selamat tinggal @user dari @grup\`\nCatatan: Gunakan @user untuk nama pengguna, @grup untuk nama grup.`);
        return;
      }

      if (text.toLowerCase() === 'default') {
        delete global.db.groups[m.chat].setout;
        
        await m.reply('Pesan keluar telah dikembalikan ke default.');
        return;
      }

      global.db.groups[m.chat].setout = text;
      
      await m.reply(`Pesan keluar telah diatur menjadi:\n${text.replace(/@user/g, '@namauser').replace(/@grup/g, '@namagrup')}`);
    } catch (err) {
      
      await m.reply('Gagal mengatur pesan keluar.');
      await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
    }
  }
};