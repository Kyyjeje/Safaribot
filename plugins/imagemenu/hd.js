require('../../settings');
const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');
const { fromBuffer } = require('file-type');

async function uguuUpload(buffer) {
    const { ext } = await fromBuffer(buffer) || { ext: 'jpg' };
    const form = new FormData();
    form.append('files[]', buffer, { filename: `upload.${ext}` });
    const { data } = await axios.post('https://uguu.se/upload.php', form, {
        headers: form.getHeaders(),
        timeout: 15000
    });
    if (!data.files?.[0]?.url) throw new Error('Upload gagal');
    return data.files[0].url;
}

async function validateAndResizeImage(buffer) {
    const { width, height, format } = await sharp(buffer).metadata();
    if (!['jpeg', 'png', 'jpg'].includes(format)) throw new Error('Format gambar tidak didukung');
    if (width < 256 || height < 256) return sharp(buffer).resize({ width: 256, height: 256, fit: 'inside' }).toBuffer();
    if (width > 5760 || height > 3240) return sharp(buffer).resize({ width: 5760, height: 3240, fit: 'inside' }).toBuffer();
    return buffer;
}

async function remini(imageBuffer) {
    const formData = new FormData();
    formData.append('model_version', 1);
    formData.append('image', Buffer.from(imageBuffer), { filename: 'enhance_image_body.jpg', contentType: 'image/jpeg' });
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(new Error('Timeout Remini')), 30000);
        formData.submit({
            url: 'https://inferenceengine.vyro.ai/enhance',
            host: 'inferenceengine.vyro.ai',
            path: '/enhance',
            protocol: 'https:',
            headers: { 'User-Agent': 'okhttp/4.9.3' }
        }, (err, res) => {
            clearTimeout(timeoutId);
            if (err) return reject(err);
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk))
               .on('end', () => resolve(Buffer.concat(chunks)))
               .on('error', reject);
        });
    });
}

module.exports = {
    name: 'hd',
    alias: ['tohd', 'remini', 'enhanceimage'],
    description: '<reply image/sticker>',
    run: async ({ naze, m }) => {
        try {
            const mediaMessage = m.quoted ? m.quoted : m;
            const mime = (mediaMessage.msg || mediaMessage).mimetype || '';
            if (!/image|webp/.test(mime)) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Tingkatkan Kualitas Gambar:*\n` +
                              `  Perintah: Reply gambar/stiker dengan \n\`${m.prefix}${m.command}\`\n` +
                              `  Contoh: Reply gambar/stiker dengan \n\`${m.prefix}hd\``);
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
            
            
            
            await new Promise(resolve => setTimeout(resolve, 500));
            

            const media = await mediaMessage.download();
            const validatedImg = await validateAndResizeImage(media);
            const imageUrl = await uguuUpload(validatedImg);

            try {
                const response = await axios.get('https://fastapi2.alifproject.cloud/api/ai/upscalev2', {
                    headers: {
                        'User-Agent': 'Mozilla/5.0',
                        'Accept': 'application/json',
                        'Authorization': 'Bearer alif_64d5307e-9a02-4e5d-8d53-9ac2a15f0186'
                    },
                    params: { url: imageUrl }
                });
                if (response.data.status === 'success' && response.data.data.result_url) {
                    await naze.sendMessage(m.chat, {
                        image: { url: response.data.data.result_url },
                        caption: '✅ Berhasil meningkatkan kualitas gambar!'
                    }, { quoted: m });
                    
                    return;
                }
            } catch (e) {
                // Fallback ke upscale v1
            }

            try {
                const response = await axios.get('https://fastapi2.alifproject.cloud/api/ai/upscale', {
                    headers: {
                        'User-Agent': 'Mozilla/5.0',
                        'Accept': 'image/*',
                        'Authorization': 'Bearer alif_64d5307e-9a02-4e5d-8d53-9ac2a15f0186'
                    },
                    params: { url: imageUrl },
                    responseType: 'arraybuffer'
                });
                const imageBuffer = Buffer.from(response.data);
                const { format } = await sharp(imageBuffer).metadata();
                if (!['jpeg', 'png', 'jpg'].includes(format)) throw new Error('Format hasil upscale tidak valid');
                await naze.sendMessage(m.chat, {
                    image: imageBuffer,
                    caption: '✅ Berhasil meningkatkan kualitas gambar!'
                }, { quoted: m });
                
                return;
            } catch (e) {
                // Fallback ke Remini
            }

            const enhanced1 = await remini(validatedImg);
            const enhanced2 = await remini(enhanced1);
            if (enhanced2.length < 1024) throw new Error('Hasil terlalu kecil');
            const { format } = await sharp(enhanced2).metadata();
            if (!['jpeg', 'png', 'jpg'].includes(format)) throw new Error('Format hasil tidak valid');
            await naze.sendMessage(m.chat, {
                image: enhanced2,
                caption: '✅ Berhasil meningkatkan kualitas gambar!'
            }, { quoted: m });
            
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};