const fetch = require('node-fetch');

module.exports = {
  name: "ytmp4",
  alias: ["youtubemp4", "youtubevideo"],
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
    
    const startTime = performance.now();

    const apiUrl = `https://youtube-video-fast-downloader-24-7.p.rapidapi.com/download_video/${videoId}?quality=247`;
    let result;

    for (let i = 0; i < global.rapid_api.length; i++) {
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': global.rapid_api[i],
          'x-rapidapi-host': 'youtube-video-fast-downloader-24-7.p.rapidapi.com'
        }
      };

      try {
        const response = await fetch(apiUrl, options);
        if (!response.ok) throw new Error(`Error HTTP! Status: ${response.status}`);
        result = await response.json();
        if (result.file && result.quality) break;
        throw new Error("Respons API tidak valid");
      } catch (error) {
        if (i === global.rapid_api.length - 1) {
          
          await global.handleError(naze, m, error, { sendRawError: true, useGemini: true });
          await global.sendMessageWithThumbnail(naze, m.chat, 'error', m);
          return m.reply("Gagal mengambil data: Semua kunci API gagal atau respons tidak valid.");
        }
      }
    }

    if (!result || !result.file || !result.quality) {
      
      await global.handleError(naze, m, new Error("Respons API tidak valid"), { sendRawError: true, useGemini: true });
      await global.sendMessageWithThumbnail(naze, m.chat, 'error', m);
      return m.reply("Gagal mendapatkan link unduhan. Coba URL lain.");
    }

    const endTime = performance.now();
    const durationMs = endTime - startTime;
    let durationText;
    if (durationMs < 60000) {
      durationText = `${(durationMs / 1000).toFixed(1).replace('.', ',')} detik`;
    } else {
      const minutes = Math.floor(durationMs / 60000);
      const seconds = ((durationMs % 60000) / 1000).toFixed(1).replace('.', ',');
      durationText = `${minutes} menit ${seconds} detik`;
    }

    const videoUrl = result.file;
    const quality = result.quality || "Unknown";
    const title = result.title || `video_${new Date().getTime()}`;
    let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const channel = "YouTube";

    try {
      const thumbResponse = await fetch(thumbnailUrl, { method: 'HEAD' });
      if (!thumbResponse.ok) throw new Error("Thumbnail tidak dapat diakses");
    } catch {
      thumbnailUrl = `${global.thumbnailyoutube}`;
    }

    try {
      await naze.sendMessage(m.chat, {
        video: { url: videoUrl },
        mimetype: "video/mp4",
        fileName: `${title}.mp4`,
        caption: `Kualitas: ${quality}\n⏱ Dikirim dalam: \`${durationText}\`\nURL Unduhan: \n${videoUrl}`,
        contextInfo: {
          externalAdReply: {
            title: title,
            body: channel,
            previewType: "PHOTO",
            thumbnailUrl: thumbnailUrl,
            mediaType: 1,
            renderLargerThumbnail: true,
            sourceUrl: url
          }
        }
      }, { quoted: m });
      
    } catch (error) {
      
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        await m.reply('Gagal mengirim video: Permintaan melebihi 30 detik. Silakan coba lagi.');
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ENETUNREACH') {
        await m.reply('Gagal mengirim video: Masalah koneksi jaringan.');
      } else {
        await global.handleError(naze, m, error, { sendRawError: true, useGemini: true });
        await m.reply(`Gagal mengirim video: ${error.message}`);
      }
      await global.sendMessageWithThumbnail(naze, m.chat, 'error', m);
    }
  }
};