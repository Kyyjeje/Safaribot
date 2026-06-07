require('../../settings');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');

module.exports = {
    name: 'stickercrop',
    alias: ['scrop'],
    description: '<reply image>',
    run: async ({ naze, m, args, text }) => {
        try {
            
            

            const quoted = m.quoted ? m.quoted : m;
            const mime = (quoted.msg || quoted).mimetype || '';

            if (!/image|video|sticker/.test(quoted.type || mime)) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Kirim/reply gambar/video/gif dengan caption: ${m.prefix}${m.command}` }, { quoted: m });
            }

            const dataDir = path.join(__dirname, 'data');
            const tempDir = path.join(__dirname, '../../temp');
            if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            let media = await quoted.download();
            const mediaExt = mime.split('/')[1];
            const mediaPath = path.join(dataDir, `media.${mediaExt}`);
            const outputPath = path.join(tempDir, `output.${mediaExt}`);

            fs.writeFileSync(mediaPath, media);

            const cropImage = async (input, output) => {
                let metadata = await sharp(input).metadata();
                let size = Math.min(metadata.width, metadata.height);
                await sharp(input)
                    .resize(size, size, { fit: 'cover' })
                    .toFile(output);
            };

            const cropVideo = async (input, output) => {
                return new Promise((resolve, reject) => {
                    ffmpeg(input)
                        .videoFilters('crop=in_w:in_w')
                        .on('end', () => resolve(true))
                        .on('error', (err) => reject(err))
                        .save(output);
                });
            };

            if (/image|webp/.test(mime)) {
                await cropImage(mediaPath, outputPath);
                media = fs.readFileSync(outputPath);
                await naze.sendAsSticker(m.chat, media, m, { packname: ' ', author: ' ' });
                
            } else if (/video/.test(mime)) {
                if ((quoted.msg || quoted).seconds > 11) {
                    
                    return naze.sendMessage(m.chat, { text: `⚠️ Maksimal 10 detik!` }, { quoted: m });
                }
                await cropVideo(mediaPath, outputPath);
                media = fs.readFileSync(outputPath);
                await naze.sendAsSticker(m.chat, media, m, { packname: '', author: '' });
                
            } else {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Kirim/reply gambar/video/gif dengan caption: ${m.prefix}${m.command}` }, { quoted: m });
            }
        } catch (e) {
            console.error(`Fatal error di stickercrop: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        } finally {
            try {
                const files = fs.readdirSync(tempDir);
                for (const file of files) {
                    fs.unlinkSync(path.join(tempDir, file));
                }
            } catch (err) {
                console.error(`Gagal menghapus file di folder temp: ${err.message}`);
            }
        }
    }
};