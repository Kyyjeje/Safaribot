const fetch = require('node-fetch');
require('../../settings');

module.exports = {
  name: 'mediafire',
  alias: ['mfdl', 'mediafiredownload', 'mediafiredl'],
  description: '<url mediafire>',
  run: async ({ naze, m }) => {
    //
    await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

    const url = m.text.split(' ')[1];
    if (!url || !url.includes('mediafire.com/file')) {
      
      return m.reply(`Kirim link MediaFire, contoh penggunaan: \n*${m.prefix}${m.command} <url>*`);
    }

    await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
    try {
      const apiUrl = `https://api.siputzx.my.id/api/d/mediafire?url=${encodeURIComponent(url)}`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
        timeout: 150000
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const { status, data } = await response.json();
      if (!status || !data?.downloadLink) throw new Error('Gagal mendapatkan link download');

      await naze.sendMessage(m.chat, {
        text: `📄 Nama File: ${data.fileName}\n📏 Ukuran: ${data.fileSize}\n📁 Jenis: ${data.fileType}\n🔗 Link: ${data.downloadLink}`
      }, { quoted: m });
      

      const fileResponse = await fetch(data.downloadLink, {
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
        timeout: 30000
      });
      if (!fileResponse.ok) throw new Error(`Gagal mendownload file: ${fileResponse.status}`);

      const fileBuffer = await fileResponse.buffer();
      if (fileBuffer.length < 1024) throw new Error('File terlalu kecil atau kosong');

      await naze.sendMessage(m.chat, {
        document: fileBuffer,
        fileName: data.fileName,
        mimetype: data.mimeType || 'application/octet-stream',
        caption: '✅ File berhasil didownload!'
      }, { quoted: m });
      
    } catch (e) {
      
      if (e.name === 'AbortError' || e.message.includes('timeout')) {
        await m.reply('Gagal mengambil data: Permintaan melebihi 20 detik. Silakan coba lagi.');
      } else if (e.code === 'ETIMEDOUT' || e.code === 'ENETUNREACH') {
        await m.reply('Gagal mengunduh media: Masalah koneksi jaringan.');
      } else {
        await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        await m.reply(`Gagal mendownload file: ${e.message}`);
      }
      await global.sendMessageWithThumbnail(naze, m.chat, 'error', m);
    }
  }
};