const axios = require('axios');
require('../../settings');

module.exports = {
  name: 'safelinku',
  alias: ['sfl', 'safelinkudl', 'safelinkbypass'],
  description: '<url safelinku>',
  run: async ({ naze, m }) => {
    // Send wait message only once
    await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

    const url = m.text.split(' ')[1];
    if (!url || !url.includes('sfl.gl')) {
      return m.reply(`Kirim link SafelinkU, contoh penggunaan: \n*${m.prefix}${m.command} <url>*`);
    }

    try {
      const response = await axios.get("https://fgsi.koyeb.app/api/tools/skip/tutwuri", {
        params: {
          apikey: "fgsiapi-38d7e952-6d",
          url: url,
        },
        headers: {
          accept: "application/json",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        },
        timeout: 15000,
      });

      console.log('Safelinku API Response:', response.data);

      if (!response.data?.status || !response.data?.data?.url) {
        throw new Error(response.data?.message || 'Gagal mendapatkan link asli dari SafelinkU.');
      }

      await naze.sendMessage(m.chat, {
        text: `🔗 Link Asli: ${response.data.data.url}`,
      }, { quoted: m });

    } catch (e) {
      console.error('Safelinku Plugin Error:', e.response?.data || e.message);
      if (e.response?.status === 403) {
        await m.reply('Gagal membypass SafelinkU: Server menolak akses (403 Forbidden). Silakan coba lagi nanti atau periksa URL.');
      } else if (e.name === 'AxiosError' && e.code === 'ECONNABORTED') {
        await m.reply('Gagal mengambil data: Permintaan melebihi 15 detik. Silakan coba lagi.');
      } else if (e.code === 'ETIMEDOUT' || e.code === 'ENETUNREACH') {
        await m.reply('Gagal mengunduh data: Masalah koneksi jaringan.');
      } else {
        await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        await m.reply(`Gagal membypass SafelinkU: ${e.response?.data?.message || e.message}`);
      }
      await global.sendMessageWithThumbnail(naze, m.chat, 'error', m);
    }
  }
};