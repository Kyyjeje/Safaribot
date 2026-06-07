require('../../settings');

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
  name: 'listmute',
  alias: ['mutelist'],
  run: async ({ naze, m }) => {
    if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
    if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);

    try {
      

      if (!db.muteUser || !db.muteUser[m.chat] || Object.keys(db.muteUser[m.chat]).length === 0) {
        await m.reply('Tidak ada pengguna yang sedang dimute di grup ini.');
        //
        return;
      }

      const groupMetadata = await naze.groupMetadata(m.chat);
      const groupName = groupMetadata.subject;
      const currentTime = new Date();
      let muteList = `*Daftar Pengguna Dimute di ${groupName}*\n\n`;
      let mentions = [];

      for (const [userId, muteInfo] of Object.entries(db.muteUser[m.chat])) {
        const endTime = new Date(muteInfo.endTime);
        const isExpired = currentTime >= endTime;

        if (isExpired) {
          delete db.muteUser[m.chat][userId];
          continue;
        }

        const remainingTime = formatDuration(endTime - currentTime);
        muteList += `User: @${userId.split('@')[0]}\n` +
                    `Mulai Mute: ${new Date(muteInfo.startTime).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n` +
                    `Sisa Waktu: ${remainingTime}\n` +
                    `Berakhir: ${endTime.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n` +
                    `Alasan: ${muteInfo.reason}\n\n`;
        mentions.push(userId);
      }

      if (Object.keys(db.muteUser[m.chat]).length === 0) {
        delete db.muteUser[m.chat];
        await m.reply('Tidak ada pengguna yang sedang dimute di grup ini.');
        
        return;
      }

      await naze.sendMessage(m.chat, { text: muteList, contextInfo: { mentionedJid: mentions } }, { quoted: m });
      
    } catch (err) {
      
      await m.reply('Gagal menampilkan daftar mute.');
      await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
    }
  }
};