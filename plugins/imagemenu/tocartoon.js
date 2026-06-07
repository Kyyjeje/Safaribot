require('../../settings');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const fetch = require('node-fetch');

async function validateAndResizeImage(buffer) {
    const { width, height } = await sharp(buffer).metadata();
    if (width < 256 || height < 256) {
        return sharp(buffer).resize({ width: 256, height: 256, fit: 'inside' }).toBuffer();
    }
    if (width > 5760 || height > 3240) {
        return sharp(buffer).resize({ width: 5760, height: 3240, fit: 'inside' }).toBuffer();
    }
    return buffer;
}

async function downloadImageWithRetry(url, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Node.js)',
                    'Connection': 'close'
                }
            });
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer);
        } catch (e) {
            if (attempt === maxRetries) throw e;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    throw new Error('Gagal mengunduh gambar setelah semua percobaan');
}

async function getCartoonResult(naze, m, taskId) {
    const apiKeys = global.rapid_api || ['3acd58602amsh124292f1aa40177p1b4e8ejsnf363d93bb13f'];
    const url = `https://ai-cartoon-generator.p.rapidapi.com/api/rapidapi/query-async-task-result?task_id=${taskId}`;
    const maxTimeMs = 300000;
    const intervalMs = 30000;
    const startTime = Date.now();

    for (const apiKey of apiKeys) {
        try {
            while (Date.now() - startTime < maxTimeMs) {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'x-rapidapi-key': apiKey,
                        'x-rapidapi-host': 'ai-cartoon-generator.p.rapidapi.com'
                    }
                });
                if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
                const data = await response.json();
                if (data.data?.status === 'PROCESS_SUCCESS' && data.data?.result_url) {
                    return data.data.result_url;
                }
                await new Promise(resolve => setTimeout(resolve, intervalMs));
            }
            throw new Error(`Gambar tidak selesai diproses setelah 5 menit`);
        } catch (e) {
            if (apiKey === apiKeys[apiKeys.length - 1]) {
                throw new Error(`Gagal dengan semua API key: ${e.message}`);
            }
        }
    }
}

const checkPremiumUser = (jid, db) => {
    if (!db.premium) db.premium = {};
    for (const user in db.premium) {
        if (db.premium[user].expired > 0 && db.premium[user].expired < +new Date()) {
            delete db.premium[user];
        }
    }
    const isPremium = !!db.premium[jid];
    const limit = isPremium ? db.premium[jid].limit || 0 : 0;
    return { isPremium, limit };
};

module.exports = {
    name: 'toanime',
    alias: ['tocartoon', 'cartoonimage', 'animestyle'],
    description: '<reply image>',
    run: async ({ naze, m }) => {
        try {
            const quoted = m.quoted ? m.quoted : m;
            const mime = (quoted.msg || quoted).mimetype || '';
            if (/video/.test(mime)) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Konversi ke Anime:*\n` +
                              `  Perintah: Reply gambar dengan \n\`${m.prefix}${m.command}\`\n` +
                              `  Catatan: Fitur ini tidak mendukung video.\n` +
                              `  Contoh: Reply gambar dengan \n\`${m.prefix}toanime\``);
            }
            if (/application/.test(mime)) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Konversi ke Anime:*\n` +
                              `  Perintah: Reply gambar dengan \n\`${m.prefix}${m.command}\`\n` +
                              `  Catatan: Fitur ini tidak mendukung dokumen.\n` +
                              `  Contoh: Reply gambar dengan \n\`${m.prefix}toanime\``);
            }
            if (!/image\/(jpe?g|png)/.test(mime)) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Konversi ke Anime:*\n` +
                              `  Perintah: Reply gambar dengan \n\`${m.prefix}${m.command}\`\n` +
                              `  Contoh: Reply gambar dengan \n\`${m.prefix}toanime\``);
            }

            const { isPremium, limit } = checkPremiumUser(m.sender, global.db);
            if (!isPremium) {
                
                await global.sendMessageWithThumbnail(naze, m.chat, 'prem', m);
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Konversi ke Anime:*\n` +
                              `  Perintah: Hanya untuk pengguna premium\n` +
                              `  Hubungi owner untuk upgrade ke premium`);
            }
            if (limit <= 0) {
                
                return m.reply(`🚨 *Limit Habis, Yang Mulia!*\n\n` +
                              `✨ *Konversi ke Anime:*\n` +
                              `  Perintah: Limit premium kamu habis\n` +
                              `  Hubungi owner untuk menambah limit`);
            }

            
            
            await new Promise(resolve => setTimeout(resolve, 500));
            

            let imgData = await quoted.download();
            if (!imgData || imgData.length === 0) throw new Error('Gagal mendownload gambar');
            imgData = await validateAndResizeImage(imgData);

            const blob = new Blob([imgData], { type: mime });
            const form = new FormData();
            form.append('task_type', 'async');
            form.append('image', blob, `image.${mime.split('/')[1]}`);
            form.append('index', '2');

            const apiKeys = global.rapid_api || ['3acd58602amsh124292f1aa40177p1b4e8ejsnf363d93bb13f'];
            let postResponse, taskId;
            for (const apiKey of apiKeys) {
                try {
                    const response = await fetch('https://ai-cartoon-generator.p.rapidapi.com/image/effects/generate_cartoonized_image', {
                        method: 'POST',
                        headers: {
                            'x-rapidapi-key': apiKey,
                            'x-rapidapi-host': 'ai-cartoon-generator.p.rapidapi.com'
                        },
                        body: form
                    });
                    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
                    postResponse = await response.json();
                    if (postResponse.error_code === 0 && postResponse.task_id) {
                        taskId = postResponse.task_id;
                        break;
                    }
                    throw new Error('Gagal membuat tugas cartoon');
                } catch (e) {
                    if (apiKey === apiKeys[apiKeys.length - 1]) throw e;
                }
            }

            await naze.sendMessage(m.chat, {
                text: `⏳ Sedang memproses gambar cartoon.\n> Mohon tunggu hingga 5 menit...`
            }, { quoted: m });

            const resultUrl = await getCartoonResult(naze, m, taskId);
            const tempDir = path.join(__dirname, '../../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            const resultPath = path.join(tempDir, `cartoon_${Date.now()}.jpg`);

            try {
                const imageBuffer = await downloadImageWithRetry(resultUrl);
                fs.writeFileSync(resultPath, imageBuffer);

                await naze.sendMessage(m.chat, {
                    image: { url: resultPath },
                    caption: '🖼️ *Gambar Gaya Cartoon*'
                }, { quoted: m });
                

                if (global.db.premium[m.sender]) global.db.premium[m.sender].limit -= 1;
            } catch (e) {
                
                await naze.sendMessage(m.chat, {
                    text: `❌ Gagal mengunduh/mengirim gambar, tetapi hasil tersedia di: ${resultUrl}`
                }, { quoted: m });
                throw e;
            } finally {
                if (fs.existsSync(resultPath)) fs.unlinkSync(resultPath);
            }
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};