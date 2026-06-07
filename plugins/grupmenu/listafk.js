require('../../settings');
const moment = require('moment-timezone');

module.exports = {
  name: 'leaderboardafk',
  alias: ['afkleaderboard', 'listafk', 'afklist'],
  run: async ({ naze, m }) => {
    if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);

    try {
      

      const barisjudul = global.simbol.barisjudul;
      const tutupjudul = global.simbol.tutupjudul;
      const barisfitur = global.simbol.barisfitur;
      const penutup = global.simbol.penutup;

      const participants = m.metadata.participants;

      let afkList = [];
      for (let mem of participants) {
        const userId = mem.id;
        const user = global.db.users[userId];
        if (user && user.afkTime && user.afkTime > 0) {
          const afkDuration = Date.now() - user.afkTime;
          afkList.push({
            id: userId,
            afkTime: user.afkTime,
            afkDuration: afkDuration,
            afkReason: user.afkReason || 'Tanpa alasan'
          });
        }
      }

      if (afkList.length === 0) {
        await naze.sendMessage(m.chat, { text: `${barisfitur} Tidak ada anggota yang sedang AFK saat ini!`, mentions: [] }, { quoted: m });
        //
        return;
      }

      afkList.sort((a, b) => b.afkDuration - a.afkDuration);

      const formatDuration = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days} hari`;
        if (hours > 0) return `${hours} jam`;
        if (minutes > 0) return `${minutes} menit`;
        return `${seconds} detik`;
      };

      let teks = `${barisjudul} *Leaderboard AFK*\n${tutupjudul}\n`;
      const mentions = [];
      afkList.forEach((user, index) => {
        const rank = index + 1;
        const userTag = `@${user.id.split('@')[0]}`;
        const duration = formatDuration(user.afkDuration);
        teks += `${barisfitur} ${rank} ${userTag} - \`${duration}\` (${user.afkReason})\n`;
        mentions.push(user.id);
      });
      teks += `${penutup}`;

      await naze.sendMessage(m.chat, { text: teks, mentions: mentions }, { quoted: m });
      
    } catch (err) {
      
      await m.reply('Gagal menampilkan leaderboard AFK.');
      await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
    }
  }
};