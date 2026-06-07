require('../settings');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

async function generateImageEdit(naze, m, prompt, caption) {
    try {
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';
        const isSticker = /webp/.test(mime);
        if (!/image|webp/.test(mime)) {
            //await naze.sendMessage(m.chat, { react: { text: '🚫', key: m.key } });
            return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                          `✨ *Edit Gambar:*\n` +
                          `  Perintah: Reply gambar/stiker dengan \n\`${m.prefix}${m.command}\`\n` +
                          `  Contoh: Reply gambar/stiker dengan \n\`${m.prefix}${m.command}\``);
        }
        if (/video/.test(mime)) {
            //await naze.sendMessage(m.chat, { react: { text: '🚫', key: m.key } });
            return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                          `✨ *Edit Gambar:*\n` +
                          `  Perintah: Reply gambar/stiker dengan \n\`${m.prefix}${m.command}\`\n` +
                          `  Catatan: Fitur ini tidak mendukung video.\n` +
                          `  Contoh: Reply gambar/stiker dengan \n\`${m.prefix}${m.command}\``);
        }
        if (/application/.test(mime)) {
            //await naze.sendMessage(m.chat, { react: { text: '🚫', key: m.key } });
            return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                          `✨ *Edit Gambar:*\n` +
                          `  Perintah: Reply gambar/stiker dengan \n\`${m.prefix}${m.command}\`\n` +
                          `  Catatan: Fitur ini tidak mendukung dokumen.\n` +
                          `  Contoh: Reply gambar/stiker dengan \n\`${m.prefix}${m.command}\``);
        }

        await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
        //await naze.sendMessage(m.chat, { react: { text: '😎', key: m.key } });
        //await new Promise(resolve => setTimeout(resolve, 500));
        //await naze.sendMessage(m.chat, { react: { text: '🔄', key: m.key } });

        let imgData;
        if (isSticker) {
            const media = await naze.downloadAndSaveMediaMessage(quoted);
            const outputPath = path.join(__dirname, '../temp', `${Math.floor(Math.random() * 10000)}.png`);
            await new Promise((resolve, reject) => {
                exec(`ffmpeg -i ${media} ${outputPath}`, (err) => {
                    fs.unlinkSync(media);
                    if (err) reject(new Error('Gagal mengonversi stiker'));
                    else resolve();
                });
            });
            imgData = fs.readFileSync(outputPath);
            fs.unlinkSync(outputPath);
        } else {
            imgData = await quoted.download();
        }

        if (!imgData) throw new Error('Gagal mendownload/konversi media');
        const base64Image = imgData.toString('base64');
        const contents = [
            { text: prompt },
            { inlineData: { mimeType: mime, data: base64Image } }
        ];

        const apiKeys = global.key_gemini || ['AIzaSyDdfNNmvphdPdHSbIvpO5UkHdzBwx7NVm0'];
        let response;
        for (const apiKey of apiKeys) {
            try {
                const ai = new GoogleGenerativeAI(apiKey);
                const model = ai.getGenerativeModel({
                    model: 'gemini-2.0-flash-exp-image-generation',
                    generationConfig: { responseModalities: ['Text', 'Image'] }
                });
                response = await model.generateContent(contents);
                break;
            } catch (e) {
                if (apiKey === apiKeys[apiKeys.length - 1]) {
                    throw new Error(`Gagal dengan semua API key: ${e.message}`);
                }
            }
        }

        const parts = response.response?.candidates?.[0]?.content?.parts;
        if (!parts) {
            const finishReason = response.response?.candidates?.[0]?.finishReason;
            let errorMessage = finishReason
                ? finishReason === 'IMAGE_SAFETY'
                    ? '⚠️ Gambar ditolak oleh Gemini karena alasan keamanan (IMAGE_SAFETY).'
                    : finishReason === 'RECITATION'
                    ? '⚠️ Gemini menolak karena konten melanggar kebijakan (RECITATION).'
                    : `⚠️ Gemini menolak permintaan ini. Alasan: ${finishReason}.`
                : response.response?.promptFeedback?.safetyRatings
                ? `⚠️ Gemini menolak permintaan ini karena masalah keamanan: ${response.response.promptFeedback.safetyRatings
                      .filter(r => r.probability !== 'NEGLIGIBLE')
                      .map(r => `${r.category}: ${r.probability}`)
                      .join(', ') || 'Tidak diketahui'}.`
                : '⚠️ Gemini tidak bisa mengedit gambar ini.';
            if (response.response?.text) errorMessage += `\nPesan dari Gemini: ${response.response.text}`;
            await naze.sendMessage(m.chat, { react: { text: '🚫', key: m.key } });
            return m.reply(errorMessage);
        }

        let imageBuffer = null;
        let textResponse = '';
        for (const part of parts) {
            if (part.inlineData) imageBuffer = Buffer.from(part.inlineData.data, 'base64');
            else if (part.text) textResponse += part.text;
        }

        if (!imageBuffer) {
            await naze.sendMessage(m.chat, { react: { text: '🚫', key: m.key } });
            return m.reply(textResponse || '⚠️ Gemini tidak menghasilkan gambar untuk permintaan ini.');
        }

        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        const filePath = path.join(tempDir, `edit_${Date.now()}.png`);
        fs.writeFileSync(filePath, imageBuffer);

        await naze.sendMessage(m.chat, {
            image: { url: filePath },
            caption: textResponse || caption
        }, { quoted: m });
        await naze.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        setTimeout(() => fs.existsSync(filePath) && fs.unlinkSync(filePath), 30000);
    } catch (e) {
        await naze.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
        await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
    }
}

module.exports = { generateImageEdit };