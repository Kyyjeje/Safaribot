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
    name: 'compress',
    alias: ['compressimg', 'kompresimg', 
           'compressimage', 'kompresimage',
           'compressgambar', 'kompresgambar', 
           'imgcompress', 'imgkompres', 
           'imagecompress', 'imagekompres', 
           'gambarcompress', 'gambarkompes'],
    description: '<reply image>',
    run: async ({ naze, m }) => {
        try {
            const quoted = m.quoted ? m.quoted : m;
            const mime = (quoted.msg || quoted).mimetype || '';
            if (!/image|webp/.test(mime)) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Kompres Gambar:*\n` +
                              `  Perintah: Reply gambar dengan \n\`${m.prefix}${m.command}\`\n` +
                              `  Contoh: Reply gambar dengan \n\`${m.prefix}compress\``);
            }

            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
            
            await new Promise(resolve => setTimeout(resolve, 500));
            

            const media = await quoted.download();
            const url = await UguuSe(media);
            const compressUrl = `https://api.siputzx.my.id/api/iloveimg/compress?image=${encodeURIComponent(url)}`;
            const response = await axios.get(compressUrl, { responseType: 'arraybuffer' });

            if (!response.data) throw new Error('Gagal mengompresi gambar');
            await naze.sendMessage(m.chat, {
                image: response.data,
                caption: '✅ *Berhasil mengompresi gambar!*'
            }, { quoted: m });
            
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};