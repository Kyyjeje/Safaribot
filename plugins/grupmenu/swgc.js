require('../../settings');
const { generateWAMessageContent,generateWAMessageFromContent, jidNormalizedUser } = require('baileys');
const crypto = require('crypto');

module.exports = {
  name: 'upswgroup',
  alias: ['swgc', 'upswgc'],
  description: 'Upload ke Status Grup',
  run: async ({ naze, m }) => {
    try {
      // === AMBIL BODY & PREFIX + COMMAND ===
      let body = '';
      if (m.type === 'conversation') body = m.message.conversation || '';
      else if (m.type === 'imageMessage') body = m.message.imageMessage.caption || '';
      else if (m.type === 'videoMessage') body = m.message.videoMessage.caption || '';
      else if (m.type === 'extendedTextMessage') body = m.message.extendedTextMessage.text || '';

      // Hapus prefix + command (contoh: .swgc hai → hai)
      const prefixRegex = new RegExp(`^${m.prefix}${m.command}\\s*`, 'i');
      const args = body.replace(prefixRegex, '').trim();

      const quoted = m.quoted;
      const isMedia = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(m.type);
      const isQuotedMedia = quoted && ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(quoted.type);

      // Cek grup + admin
      if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
      if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
      if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

      // === TUTORIAL KALAU KOSONG ===
      if (!isMedia && !isQuotedMedia && !args && !body.includes(m.prefix + m.command)) {
        await naze.sendMessage(m.chat, { react: { text: 'ℹ️', key: m.key } });
        return m.reply(
`*Upload Status Grup*

Cara pakai:
• Reply media → ketik \`${m.prefix}swgc\`
• Kirim media + caption \`${m.prefix}swgc\` (tanpa teks juga boleh)
• Kirim media + caption \`${m.prefix}swgc Halo semua!\`
Semua akan masuk ke Status Grup!`
        );
      }

      await naze.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

      let buffer = null;
      let captionText = args;  // teks setelah .swgc
      let mimeType = '';

      // Prioritas 1: Reply media
      if (isQuotedMedia) {
        buffer = await quoted.download();
        captionText = args || quoted.caption || quoted.text || '';
        mimeType = quoted.mimetype || '';
      }
      // Prioritas 2: Kirim media langsung (dengan atau tanpa caption)
      else if (isMedia) {
        buffer = await m.download();
        captionText = args || m.message[m.type]?.caption?.replace(prefixRegex, '').trim() || '';
        mimeType = m.message[m.type]?.mimetype || '';
      }

      // Kalau cuma teks (tanpa media)
      if (!buffer && captionText) {
        buffer = null;
      }

      // === BENTUK CONTENT YANG BENAR ===
      let content = {};
      if (buffer) {
        if (/image/.test(mimeType)) content = { image: buffer, caption: captionText };
        else if (/video/.test(mimeType)) content = { video: buffer, caption: captionText };
        else if (/audio/.test(mimeType)) content = { audio: buffer, mimetype: 'audio/mpeg', ptt: false };
        else if (/sticker/.test(mimeType)) content = { sticker: buffer };
        else if (/document/.test(mimeType)) content = { document: buffer, mimetype: mimeType || 'application/octet-stream', fileName: 'file' };
        else {
          await naze.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
          return m.reply('Media tidak didukung!');
        }
      } else {
        content = { text: captionText };
      }

      // === FIX 100% UNTUK BAILEYS TERBARU ===
      const timestamp = Math.floor(Date.now() / 1000);
      const botJid = jidNormalizedUser(naze.user.id);

      const uploaded = await generateWAMessageContent(content, {
        upload: naze.waUploadToServer
      }, {
        userJid: botJid,
        messageTimestamp: timestamp
      });

      const messageSecret = crypto.randomBytes(32);

      const statusMsg = generateWAMessageFromContent(m.chat, {
        messageContextInfo: { messageSecret },
        groupStatusMessageV2: {
          message: {
            ...(uploaded.message || uploaded),
            messageContextInfo: { messageSecret }
          }
        }
      }, {
        userJid: botJid,
        messageTimestamp: timestamp
      });

      await naze.relayMessage(m.chat, statusMsg.message, { messageId: statusMsg.key.id });

      await naze.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
      await m.reply(`*Berhasil upload ke Status Grup!*\n\n${captionText || 'Media tanpa teks'}`);

    } catch (err) {
      console.error('Error swgc:', err);
      await naze.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      await m.reply(`Gagal upload status grup!\n\`\`\`${err.message}\`\`\``);
      await global.handleError?.(naze, m, err, { sendRawError: true, useGemini: true });
    }
  }
};