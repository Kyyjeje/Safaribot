require('../../settings');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { downloadContentFromMessage } = require('baileys');

module.exports = {
    name: 'toimage',
    alias: ['toimg', 'toimagefile', 'toimgstatic'],
    description: '<reply sticker>',
    run: async ({ naze, m }) => {
        await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';

        try {
            if (!/webp/.test(mime)) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Konversi ke Gambar:*\n` +
                              `  Perintah: Reply stiker dengan \n\`${m.prefix}${m.command}\`\n` +
                              `  Contoh: Reply stiker dengan \n\`${m.prefix}toimage\``);
            }

            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
            

            const tempDir = path.join(__dirname, '../../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const mediaPath = path.join(tempDir, `${Math.floor(Math.random() * 10000)}.webp`);
            const outputPath = path.join(tempDir, `${Math.floor(Math.random() * 10000)}.png`);

            const stream = await downloadContentFromMessage(quoted.msg, 'sticker');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            fs.writeFileSync(mediaPath, Buffer.concat(chunks));

            await new Promise((resolve, reject) => {
                ffmpeg(mediaPath)
                    .output(outputPath)
                    .on('end', resolve)
                    .on('error', reject)
                    .run();
            });

            if (!fs.existsSync(outputPath)) throw new Error('File hasil konversi tidak ditemukan');
            const buffer = fs.readFileSync(outputPath);

            await naze.sendMessage(m.chat, { image: buffer }, { quoted: m });
            

            [mediaPath, outputPath].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};