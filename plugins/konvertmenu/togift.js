require('../../settings');
const fs = require('fs');
const path = require('path');

function getRandom(ext) {
    return `${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
}

module.exports = {
    name: 'togift',
    alias: ['togif', 'togiffile', 'togifanim'],
    description: '<reply video/sticker>',
    run: async ({ naze, m }) => {
        await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';

        try {
            if (!/webp|video/.test(mime)) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Konversi ke GIF:*\n` +
                              `  Perintah: Reply video/stiker dengan \n\`${m.prefix}${m.command}\`\n` +
                              `  Contoh: Reply video/stiker dengan \n\`${m.prefix}togift\``);
            }

            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
            

            const tempDir = path.join(__dirname, '../../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const media = await naze.downloadAndSaveMediaMessage(quoted);
            if (!fs.existsSync(media)) throw new Error(`File tidak ditemukan: ${media}`);

            let tempFile = path.join(tempDir, getRandom(mime.includes('webp') ? '.mp4' : path.extname(media)));
            fs.copyFileSync(media, tempFile);

            if (mime.includes('webp')) {
                const stats = fs.statSync(media);
                if (stats.size > 100000) {
                    const mp4Temp = path.join(tempDir, getRandom('.mp4'));
                    fs.renameSync(tempFile, mp4Temp);
                    tempFile = mp4Temp;
                }
            }

            const buffer = fs.readFileSync(tempFile);
            await naze.sendMessage(m.chat, { video: buffer, gifPlayback: true }, { quoted: m });
            

            [media, tempFile].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};