require('../../settings');

function parseDuration(durationStr) {
    const timeUnits = {
        's': 1000,
        'min': 60 * 1000,
        'h': 60 * 60 * 1000,
        'd': 24 * 60 * 60 * 1000,
        'w': 7 * 24 * 60 * 60 * 1000,
        'm': 30 * 24 * 60 * 60 * 1000,
        'y': 365 * 24 * 60 * 60 * 1000
    };

    const match = durationStr.match(/^(\d+)(s|min|h|d|w|m|y)$/i);
    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    return value * timeUnits[unit];
}

function formatDuration(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    let result = [];
    if (days > 0) result.push(`${days} hari`);
    if (hours > 0) result.push(`${hours} jam`);
    if (minutes > 0) result.push(`${minutes} menit`);
    if (seconds > 0 && days === 0 && hours === 0 && minutes === 0) result.push(`${seconds} detik`);

    return result.length > 0 ? result.join(' ') : 'sebentar';
}

module.exports = {
  name: 'unmute',
  alias: ['unsilence'],
  description: '<nomor/reply/@tag>',
  run: async ({ naze, m, text }) => {
    try {
      if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
      if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
      if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

      const body = m.type === 'conversation' ? m.message.conversation :
                   m.type === 'imageMessage' ? m.message.imageMessage.caption :
                   m.type === 'videoMessage' ? m.message.videoMessage.caption :
                   m.type === 'extendedTextMessage' ? m.message.extendedTextMessage.text :
                   m.type === 'buttonsResponseMessage' ? m.message.buttonsResponseMessage.selectedButtonId :
                   m.type === 'listResponseMessage' ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                   m.type === 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId :
                   m.type === 'messageContextInfo' ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) :
                   m.type === 'editedMessage' ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage?.text || m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
      const args = body.trim().split(/ +/).slice(1);
      const input = args.join(' ').trim();

      const groupMetadata = await naze.groupMetadata(m.chat);

      let targetUser = null;
      if (m.quoted && m.quoted.sender) {
        targetUser = m.quoted.sender;
      } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        const mentionedId = m.mentionedJid[0];
        const participant = groupMetadata.participants.find(p => p.lid === mentionedId || p.id === mentionedId);
        if (participant) {
          targetUser = participant.jid;
        } else {
          targetUser = mentionedId;
        }
      } else if (input) {
        const phoneMatch = input.match(/(\+?\d[\d\s-]{8,14}\d)/);
        if (phoneMatch) {
          let phoneNumber = phoneMatch[1].replace(/[\s-+]/g, '');
          if (!phoneNumber.startsWith('62')) phoneNumber = '62' + phoneNumber.replace(/^0/, '');
          targetUser = phoneNumber + '@s.whatsapp.net';
        }
      }

      if (!targetUser) {
        await m.reply(`*Format salah!* Gunakan perintah:\n\`${m.prefix}${m.command} <nomor/reply/@tag>\`\n> reply pesan, tag, atau masukkan nomor\n\nContoh: \`${m.prefix}${m.command} +6281234567890\``);
        return;
      }

      if (!global.db.muteUser || !global.db.muteUser[m.chat] || !global.db.muteUser[m.chat][targetUser]) {
        await m.reply(`User @${targetUser.split('@')[0]} tidak sedang dimute di grup ini.`, { mentions: [targetUser] });
        return;
      }

      delete global.db.muteUser[m.chat][targetUser];

      if (Object.keys(global.db.muteUser[m.chat]).length === 0) {
        delete global.db.muteUser[m.chat];
      }

      await naze.sendMessage(m.chat, {
        text: `User @${targetUser.split('@')[0]} berhasil dibuka mutenya.\nWaktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`,
        mentions: [targetUser]
      }, { quoted: m });
      
    } catch (err) {
      await m.reply('Gagal membuka mute pengguna.');
      await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
    }
  }
};