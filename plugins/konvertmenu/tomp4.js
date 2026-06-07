require('../../settings');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const util = require('util');
const { execFile } = require('child_process');
const ffmpeg = require('ffmpeg-static');

const execFilePromise = util.promisify(execFile);
const getRandom = (ext) => `${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;

const oc = {
    upload: async (webpBuffer) => {
        const form = new FormData();
        form.append('file', webpBuffer, { filename: `${Date.now()}.webp`, contentType: 'image/webp' });
        form.append('class', 'video');
        form.append('from', 'webp');
        form.append('to', 'mp4');
        form.append('source', 'online');

        const response = await axios.post('https://host21.onlineconverter.com/file/send', form, {
            headers: { 'Referer': 'https://www.onlineconverter.com/', ...form.getHeaders() }
        });
        if (response.status !== 200) throw new Error(`Upload gagal: Status ${response.status}`);
        return response.data;
    },
    cekProgress: async (url) => {
        const id = url.match(/https:\/\/www.onlineconverter.com\/convert\/(\w+)/)?.[1];
        if (!id) throw new Error('URL upload tidak valid');
        let status;
        do {
            const response = await axios.get(`https://host21.onlineconverter.com/file/${id}`);
            if (response.status !== 200) throw new Error(`Cek progres gagal: Status ${response.status}`);
            status = response.data;
            if (status === 'i') throw new Error('Terlalu banyak permintaan, cooldown 1 jam');
            if (status === 'd') return `https://host21.onlineconverter.com/file/${id}/download`;
            await new Promise(resolve => setTimeout(resolve, 5000));
        } while (['w', 's', 'c'].includes(status));
    },
    run: async (webpBuffer) => {
        const url = await oc.upload(webpBuffer);
        const result = await oc.cekProgress(url);
        const response = await axios.get(result, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    }
};

module.exports = {
    name: 'tomp4',
    alias: ['tovideo', 'tomp4file', 'tovideomp4'],
    description: '<reply sticker/video>',
    run: async ({ naze, m }) => {
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';

        try {
            if (!/webp|video/.test(mime)) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Konversi ke MP4:*\n` +
                              `  Perintah: Reply stiker/video dengan \n\`${m.prefix}${m.command}\`\n` +
                              `  Contoh: Reply stiker/video dengan \n\`${m.prefix}tomp4\``);
            }

            
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
            

            const tempDir = path.join(__dirname, '../../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

            const mediaPath = await naze.downloadAndSaveMediaMessage(quoted);
            const inputExt = path.extname(mediaPath);
            const inputFixed = path.join(tempDir, getRandom(inputExt));
            fs.copyFileSync(mediaPath, inputFixed);

            let outputBuffer;
            let filesToClean = [mediaPath, inputFixed];

            if (/webp/.test(mime)) {
                try {
                    const webpBuffer = fs.readFileSync(inputFixed);
                    outputBuffer = await oc.run(webpBuffer);
                } catch (e) {
                    const gifPath = path.join(tempDir, getRandom('.gif'));
                    await execFilePromise(ffmpeg, ['-i', inputFixed, gifPath]);
                    filesToClean.push(gifPath);
                    const output = path.join(tempDir, getRandom('.mp4'));
                    await execFilePromise(ffmpeg, [
                        '-i', gifPath,
                        '-c:v', 'libx264',
                        '-preset', 'fast',
                        '-crf', '28',
                        '-pix_fmt', 'yuv420p',
                        '-vf', "scale='min(480,iw)':'trunc(ih/2)*2'",
                        '-y', output
                    ]);
                    if (!fs.existsSync(output)) throw new Error('Konversi FFmpeg gagal');
                    outputBuffer = fs.readFileSync(output);
                    filesToClean.push(output);
                }
            } else {
                const output = path.join(tempDir, getRandom('.mp4'));
                await execFilePromise(ffmpeg, [
                    '-i', inputFixed,
                    '-c:v', 'libx264',
                    '-preset', 'fast',
                    '-crf', '28',
                    '-pix_fmt', 'yuv420p',
                    '-vf', "scale='min(480,iw)':'trunc(ih/2)*2'",
                    '-y', output
                ]);
                if (!fs.existsSync(output)) throw new Error('Konversi FFmpeg gagal');
                outputBuffer = fs.readFileSync(output);
                filesToClean.push(output);
            }

            await naze.sendMessage(m.chat, { video: outputBuffer, caption: '✅ Berhasil dikonversi ke MP4' }, { quoted: m });
            

            filesToClean.forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};