const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

module.exports = {
  name: "ytmp3",
  alias: ["youtubemp3", "youtubemusic", ".ytmp3", ".youtubemp3", ".youtubemusic"],
  description: '<URL youtube>',
  run: async ({ naze, m, text }) => {
    if (!text) {
      return m.reply(`Contoh: ${m.prefix}${m.command} <url_youtube>`);
    }

    let url = text.trim();
    if (!url.includes("youtu")) {
      return m.reply(`URL tidak valid! Pastikan URL berasal dari YouTube.\nContoh: ${m.prefix}${m.command} https://www.youtube.com/watch?v=abcdef12345`);
    }

    let videoId;
    if (url.includes("youtube.com/watch?v=")) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v');
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split(/[\?&]/)[0];
    }
    if (!videoId) {
      return m.reply(`Gagal mengambil ID video dari URL!\nContoh: ${m.prefix}${m.command} https://www.youtube.com/watch?v=abcdef12345`);
    }

    await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

    // API untuk mendapatkan link unduhan
    const apiUrl = 'https://youtube-mp3-2025.p.rapidapi.com/v1/social/youtube/audio';
    let result;

    for (let i = 0; i < global.rapid_api.length; i++) {
      const options = {
        method: 'POST',
        headers: {
          'x-rapidapi-key': global.rapid_api[i],
          'x-rapidapi-host': 'youtube-mp3-2025.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: videoId })
      };

      try {
        const response = await fetch(apiUrl, options);
        if (!response.ok) throw new Error(`Error HTTP! Status: ${response.status}`);
        result = await response.json();
        if (result.error || !result.linkDownload) throw new Error("Respons API tidak valid atau link unduhan tidak ditemukan");
        break;
      } catch (error) {
        if (i === global.rapid_api.length - 1) {
          await global.sendMessageWithThumbnail(naze, m.chat, 'error', m);
          await global.handleError(naze, m, error, { sendRawError: true, useGemini: true });
          return m.reply(`Gagal mengambil data: Semua kunci API gagal. Error: ${error.message}`);
        }
      }
    }

    const title = result.title || `audio_${new Date().getTime()}`;
    let thumbnailUrl = result.thumbnail?.thumbnails?.[result.thumbnail.thumbnails.length - 1]?.url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    try {
      const thumbResponse = await fetch(thumbnailUrl, { method: 'HEAD' });
      if (!thumbResponse.ok) thumbnailUrl = `${global.thumbnailyoutube || 'https://i.ytimg.com/vi/default.jpg'}`;
    } catch {
      thumbnailUrl = `${global.thumbnailyoutube || 'https://i.ytimg.com/vi/default.jpg'}`;
    }

    const downloadUrl = result.linkDownload;

    // Kirim file audio
    await naze.sendMessage(m.chat, {
      audio: { url: downloadUrl },
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: "YouTube",
          previewType: "PHOTO",
          thumbnailUrl: thumbnailUrl,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: url
        }
      }
    }, { quoted: m });

    // Kirim file sebagai dokumen
    await naze.sendMessage(m.chat, {
      document: { url: downloadUrl },
      mimetype: "audio/mpeg",
      fileName: `${title}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: "YouTube",
          previewType: "PHOTO",
          thumbnailUrl: thumbnailUrl,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: url
        }
      }
    }, { quoted: m });

    await m.reply(`✅ Unduhan selesai! Judul: ${title}`);
  }
};