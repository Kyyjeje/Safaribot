require('../../settings');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
    return new Promise(async (resolve, reject) => {
        try {
            let tmp = path.join(__dirname, '../../temp', Date.now() + '.' + ext);
            let out = tmp + '.' + ext2;
            await fs.promises.writeFile(tmp, buffer);
            spawn('ffmpeg', ['-y', '-i', tmp, ...args, out])
                .on('error', reject)
                .on('close', async (code) => {
                    try {
                        await fs.promises.unlink(tmp);
                        if (code !== 0) reject(new Error(`FFmpeg exited with code ${code}`));
                        resolve(await fs.promises.readFile(out));
                        await fs.promises.unlink(out);
                    } catch (e) {
                        reject(e);
                    }
                });
        } catch (e) {
            reject(e);
        }
    });
}

function toAudio(buffer, ext) {
    return ffmpeg(buffer, ['-vn', '-ac', '2', '-b:a', '128k', '-ar', '44100', '-f', 'mp3'], ext, 'mp3');
}

module.exports = {
    name: 'toaudio',
    alias: ['toaud', 'toaudiofile', 'toaudiosound'],
    description: '<reply video/audio>',
    run: async ({ naze, m }) => {
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';

        try {
            if (!/video|audio/.test(mime)) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Konversi ke Audio:*\n` +
                              `  Perintah: Reply video/audio dengan \n\`${m.prefix}${m.command}\`` );
            }

            //
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            let media = await quoted.download();
            let audio = await toAudio(media, 'mp4');

            await naze.sendMessage(m.chat, { audio: audio, mimetype: 'audio/mpeg' }, { quoted: m });
            
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};