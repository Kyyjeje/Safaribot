require('../../settings');
const axios = require('axios');

function isUrl(string) {
  const regex = /^(https?:\/\/)?(www\.)?(open.spotify.com\/(track|album)\/[a-zA-Z0-9]{22})$/;
  return regex.test(string);
}

module.exports = {
  name: 'spotifydownload',
  alias: ['spotifydl', 'spotifydownloader', 'downloadspotify'],
  description: '<URL spotify>',
  run: async ({ naze, m, args, text }) => {
    //
    await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

    if (!text) {
      
      return m.reply(`🔗 Contoh penggunaan:\n${m.prefix}${m.command} https://open.spotify.com/track/0JiVRyTJcJnmlwCZ854K4p`);
    }

    if (!isUrl(text)) {
      
      return m.reply(`❌ URL tidak valid! Pastikan URL adalah tautan Spotify track atau album.\nContoh: ${m.prefix}${m.command} https://open.spotify.com/track/0JiVRyTJcJnmlwCZ854K4p`);
    }

    await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
    try {
      const response = await axios.get(`https://api.siputzx.my.id/api/d/spotify?url=${encodeURIComponent(text)}`, { timeout: 20000 });

      if (!response.data.status) {
        
        return m.reply('❌ Gagal mengambil data dari API!');
      }

      const data = response.data.data;
      const { title, artis, image, download, durasi } = data;

      await naze.sendMessage(m.chat, {
        audio: { url: download },
        mimetype: 'audio/mpeg',
        caption: `🎵 Judul: ${title}\n🎤 Artis: ${artis}\n💿 Album: ${title}\n⏱️ Durasi: ${Math.floor(durasi / 60)} menit ${durasi % 60} detik`,
        contextInfo: {
          externalAdReply: {
            title: `Spotify - ${title}`,
            body: `Artis: ${artis}`,
            previewType: 'PHOTO',
            thumbnailUrl: image,
            mediaType: 1,
            renderLargerThumbnail: true,
            sourceUrl: text
          }
        }
      }, { quoted: m });
      
    } catch (e) {
      
      if (e.name === 'AbortError' || e.message.includes('timeout')) {
        await m.reply('Gagal mengambil data: Permintaan melebihi 20 detik. Silakan coba lagi.');
      } else if (e.code === 'ETIMEDOUT' || e.code === 'ENETUNREACH') {
        await m.reply('Gagal mengunduh media: Masalah koneksi jaringan.');
      } else {
        await global.handleError(naze, m, e, { sendRawError: false, useGemini: true });
        await m.reply(`Gagal mengambil data: ${e.message}`);
      }
      await global.sendMessageWithThumbnail(naze, m.chat, 'error', m);
    }
  }
};