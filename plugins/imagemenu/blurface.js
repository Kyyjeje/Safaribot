require('../../settings');
const axios = require('axios');
const FormData = require('form-data');
const { fromBuffer } = require('file-type');

async function UguuSe(buffer) {
    const form = new FormData();
    const { ext } = await fromBuffer(buffer) || { ext: 'jpg' };
    form.append('files[]', buffer, { filename: `data.${ext}` });
    const { data } = await axios.post('https://uguu.se/upload.php', form, {
        headers: form.getHeaders()
    });
    if (!data.files?.[0]?.url) throw new Error('Upload gagal: URL tidak valid');
    return data.files[0].url;
}

module.exports = {
    name: 'blurface',
    alias: ['faceblur', 'blurwajah', 'blurfaceeffect','wajahblur'],
    description: '<reply image/sticker>',
    run: async ({ naze, m }) => {
        try {
            const quoted = m.quoted ? m.quoted : m;
            const mime = (quoted.msg || quoted).mimetype || '';
            if (!/image|webp/.test(mime)) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Blur Wajah:*\n` +
                              `  Perintah: Reply gambar/stiker dengan \n\`${m.prefix}${m.command}\``);
            }

                    await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
            
            await new Promise(resolve => setTimeout(resolve, 500));
            

            const media = await quoted.download();
            const url = await UguuSe(media);
            const removeBgUrl = `https://api.siputzx.my.id/api/iloveimg/blurface?image=${encodeURIComponent(url)}`;
            const response = await axios.get(removeBgUrl, { responseType: 'arraybuffer' });

            if (!response.data) throw new Error('Gagal memproses gambar');
            await naze.sendMessage(m.chat, {
                image: response.data,
                caption: '✅ *Berhasil blur wajah pada gambar!*'
            }, { quoted: m });
            
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};