require('../../settings');

module.exports = {
  name: 'setppgcpanjang',
  alias: ['setppgc'],
  description: '<reply image>',
  run: async ({ naze, m }) => {
    try {
      

      if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        if (!m.isBotAdmin) return  global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);


      const quoted = m.quoted ? m.quoted : m;
      const mime = (quoted.msg || quoted).mimetype || '';

      if (!m.quoted && !/image/.test(mime)) {
        
        await m.reply(`*Format salah!* Gunakan perintah:\n\`${m.prefix}${m.command}\`\n> reply atau kirim gambar untuk mengatur profil grup`);
        return;
      }

      if (!/image/.test(mime) || /webp/.test(mime)) {
        
        await m.reply(`*Format salah!* Gunakan perintah:\n\`${m.prefix}${m.command}\`\n> reply atau kirim gambar (bukan sticker) untuk mengatur profil grup`);
        return;
      }

      const imageBuffer = await quoted.download();
      if (!imageBuffer) {
        
        await m.reply('Gagal mengunduh gambar.');
        return;
      }

      await naze.updateProfilePicture(m.chat, imageBuffer);
      
      await m.reply('Foto profil grup berhasil diubah.');
    } catch (err) {
      
      await m.reply('Gagal mengatur foto profil grup.');
      await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
    }
  }
};