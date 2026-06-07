require('../../settings');
const fetch = require('node-fetch');

module.exports = {
  name: 'gdrive',
  alias: ['googledrive', 'gdrivedl', 'gdrivefile'],
  description: '<URL gdrive>',
  run: async ({ naze, m, text }) => {
    await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

    if (!text) {
      
      return m.reply(`Contoh: ${m.prefix}${m.command} https://drive.google.com/file/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ`);
    }

    if (!text.includes('drive.google.com')) {
      
      return m.reply(`URL tidak valid! Pastikan URL berasal dari Google Drive.\nContoh: ${m.prefix}${m.command} https://drive.google.com/file/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ`);
    }

    await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

    try {
      let res = await fetch(`https://api.siputzx.my.id/api/d/gdrive?url=${text}`, { timeout: 20000 });
      let data = await res.json();

      if (!data.status || !data.data) {
        
        return m.reply('Gagal mengambil data file. Periksa kembali link Google Drive.');
      }

      let { name, download, link } = data.data;
      let fileExt = name.split('.').pop().toLowerCase();
      let mimeTypes = {
        'mp3': 'audio/mpeg', 'wav': 'audio/wav', 'ogg': 'audio/ogg', 'flac': 'audio/flac',
        'jpg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif', 'webp': 'image/webp',
        'mp4': 'video/mp4', 'mkv': 'video/x-matroska', 'avi': 'video/x-msvideo',
        'zip': 'application/zip', 'rar': 'application/vnd.rar', 'pdf': 'application/pdf',
        'doc': 'application/msword', 'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };

      let mimetype = mimeTypes[fileExt] || 'application/octet-stream';
      let infoMessage = `📥 *Google Drive Downloader*\n\n📂 *Nama:* ${name}\n📄 *Tipe:* ${fileExt.toUpperCase()}\n🔗 *Link:* ${link}`;

      if (mimetype.startsWith('audio/')) {
        await naze.sendMessage(m.chat, { audio: { url: download }, mimetype, fileName: name }, { quoted: m });
      } else if (mimetype.startsWith('image/')) {
        await naze.sendMessage(m.chat, { image: { url: download }, caption: infoMessage }, { quoted: m });
      } else if (mimetype.startsWith('video/')) {
        await naze.sendMessage(m.chat, { video: { url: download }, caption: infoMessage }, { quoted: m });
      } else {
        await naze.sendMessage(m.chat, { document: { url: download }, mimetype, fileName: name }, { quoted: m });
      }

      await naze.sendMessage(m.chat, { text: infoMessage }, { quoted: m });
      

    } catch (error) {
      
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        await m.reply('Gagal mengambil data: Permintaan melebihi 20 detik. Silakan coba lagi.');
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ENETUNREACH') {
        await m.reply('Gagal mengunduh file: Masalah koneksi jaringan.');
      } else {
        await global.handleError(naze, m, error, { sendRawError: true, useGemini: true });
        await m.reply(`Gagal mengunduh file: ${error.message}`);
      }
      await global.sendMessageWithThumbnail(naze, m.chat, 'error', m);
    }
  }
};