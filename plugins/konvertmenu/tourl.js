require('../../settings');
const axios = require('axios');
const FormData = require('form-data');
const { fromBuffer } = require('file-type');

async function UguuUpload(buffer) {
    return new Promise(async (resolve, reject) => {
        try {
            const form = new FormData();
            const { ext } = (await fromBuffer(buffer)) || { ext: 'bin' };
            form.append('files[]', buffer, { filename: `upload.${ext}` });
            const { data } = await axios.post('https://uguu.se/upload.php', form, {
                headers: { ...form.getHeaders() }
            });
            if (!data.files || !data.files[0]) throw new Error('Upload gagal: Struktur respons tidak valid');
            resolve(data.files[0].url);
        } catch (e) {
            reject(e);
        }
    });
}

async function CatboxUpload(buffer) {
    return new Promise(async (resolve, reject) => {
        try {
            const form = new FormData();
            const { ext } = (await fromBuffer(buffer)) || { ext: 'bin' };
            form.append('fileToUpload', buffer, { filename: `upload.${ext}` });
            form.append('reqtype', 'fileupload');
            const { data } = await axios.post('https://catbox.moe/user/api.php', form, {
                headers: { ...form.getHeaders() }
            });
            if (!data || typeof data !== 'string' || !data.startsWith('https://files.catbox.moe/')) {
                throw new Error('Upload gagal: Struktur respons tidak valid');
            }
            resolve(data.trim());
        } catch (e) {
            reject(e);
        }
    });
}

async function YpnkUpload(buffer, retry = 0) {
    const maxRetries = 1;
    return new Promise(async (resolve, reject) => {
        try {
            const form = new FormData();
            const { ext, mime } = (await fromBuffer(buffer)) || { ext: 'bin', mime: 'application/octet-stream' };
            form.append('files', buffer, { filename: `upload.${ext}`, contentType: mime });
            const res = await axios.post('https://cdn.ypnk.biz.id/upload', form, {
                headers: {
                    ...form.getHeaders(),
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                    'Accept-Language': 'id,en;q=0.9',
                    'Origin': 'https://cdn.ypnk.biz.id',
                    'Referer': 'https://cdn.ypnk.biz.id/'
                },
                timeout: 15000
            });
            if (!res.data.success || !res.data.files || !res.data.files[0]) {
                throw new Error('Upload gagal: Struktur respons tidak valid');
            }
            resolve(`https://cdn.ypnk.biz.id${res.data.files[0].url}`);
        } catch (e) {
            if (e.response?.status === 500 && retry < maxRetries) {
                return YpnkUpload(buffer, retry + 1).then(resolve).catch(reject);
            }
            reject(e);
        }
    });
}

module.exports = {
    name: 'tourl',
    alias: ['uplink', 'uploadlink', 'toupload'],
    description: '<reply media/document>',
    run: async ({ naze, m }) => {
        try {
            const quoted = m.quoted ? m.quoted : m;
            const mime = (quoted.msg || quoted).mimetype || '';

            if (!quoted || !mime) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Upload ke URL:*\n` +
                              `  Perintah: Reply media/dokumen dengan \n\`${m.prefix}${m.command}\``);
            }

            
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
            

            const media = await quoted.download();
            const uploadPromises = [
                { name: 'Uguu', fn: UguuUpload, expiry: 'Expired 3 hour' },
                { name: 'Catbox', fn: CatboxUpload, expiry: 'No Expired' },
                { name: 'Ypnk', fn: YpnkUpload, expiry: 'No Expired' }
            ].map(async ({ name, fn, expiry }) => {
                try {
                    const url = await fn(media);
                    return { name, url, expiry, status: 'fulfilled' };
                } catch (e) {
                    return { name, error: e.message, expiry, status: 'rejected' };
                }
            });

            const results = await Promise.allSettled(uploadPromises);
            let resultText = '✅ *Berhasil diunggah!*\n';
            results.forEach((result, index) => {
                const { name, url, error, expiry } = result.value;
                if (result.status === 'fulfilled') {
                    resultText += `📎 *URL ${name} (${expiry}):* \n${url}\n\n`;
                } else {
                    resultText += `❌ *${name} gagal:* ${error}\n\n`;
                }
            });

            await m.reply(resultText.trim());
            
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};