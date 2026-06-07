require('../../settings');
const Jimp = require('jimp');
const fs = require('fs').promises;

async function generateProfilePicture(buffer) {
  const jimp = await Jimp.read(buffer);
  const min = jimp.getWidth();
  const max = jimp.getHeight();
  const cropped = jimp.crop(0, 0, min, max);
  return {
    img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
    preview: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG)
  };
}

module.exports = {
  name: 'seppgroup',
  alias: ['setppgroups', 'setppgrup', 'setppgc'],
  description: '<reply image> [full]',
  run: async ({ naze, m, q }) => {
    try {
      

      if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        if (!m.isBotAdmin) return  global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);


      const quoted = m.quoted ? m.quoted : m;
      const mime = (quoted.msg || quoted).mimetype || '';

      if (!m.quoted) {
        
        await m.reply(`*Format salah!* Gunakan perintah:\n\`${m.prefix}${m.command}\`\n> reply gambar untuk mengatur profil grup\n\n\`${m.prefix}${m.command} full\`\n> reply gambar untuk profil full`);
        return;
      }

      if (!/image/.test(mime) || /webp/.test(mime)) {
        
        await m.reply(`*Format salah!* Gunakan perintah:\n\`${m.prefix}${m.command}\`\n> reply gambar (bukan sticker) untuk mengatur profil grup`);
        return;
      }

      const media = await naze.downloadAndSaveMediaMessage(quoted, 'ppgc.jpeg');

      if (q && q.toLowerCase() === 'full') {
        const { img } = await generateProfilePicture(media);
        await naze.query({
          tag: 'iq',
          attrs: {
            to: m.chat,
            type: 'set',
            xmlns: 'w:profile:picture'
          },
          content: [{
            tag: 'picture',
            attrs: { type: 'image' },
            content: img
          }]
        });
        await fs.unlink(media);
      } else {
        await naze.updateProfilePicture(m.chat, { url: media });
        await fs.unlink(media);
      }

      
      await m.reply('Foto profil grup berhasil diubah.');
    } catch (err) {
      
      await m.reply('Gagal mengatur foto profil grup.');
      await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
    }
  }
};