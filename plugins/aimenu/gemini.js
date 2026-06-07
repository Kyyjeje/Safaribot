require('../../settings');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

module.exports = {
    name: 'gemini',
    alias: ['gm', '.gm', '.gemini'],
    description: '<pertanyaan>',
    run: async ({ naze, m }) => {
        if (!m.text && !m.quoted) {
            return m.reply('gemini hadir, ada yang bisa di bantu?');
        }

        await naze.sendPresenceUpdate('composing', m.chat);

        try {
            const apiKeys = global.key_gemini || [];
            if (apiKeys.length === 0) return m.reply('API Key Gemini tidak ditemukan!');

            const quoted = m.quoted ? m.quoted : m;
            const mime = (quoted.msg || quoted).mimetype || '';
            const isImage = /image\/(jpe?g|png)/.test(mime);
            const isSticker = /webp/.test(mime);
            const hasMedia = isImage || isSticker;

            let imageBuffer = null;
            let mediaMime = mime;

            if (hasMedia) {
                let media;
                try {
                    media = await quoted.download();
                } catch {
                    return m.reply('Gagal download media.');
                }

                if (isSticker) {
                    const inputPath = `./temp/sticker_${Date.now()}.webp`;
                    const outputPath = `./temp/sticker_${Date.now()}.png`;
                    fs.writeFileSync(inputPath, media);
                    try {
                        await execPromise(`ffmpeg -i ${inputPath} ${outputPath}`);
                        imageBuffer = fs.readFileSync(outputPath);
                        mediaMime = 'image/png';
                        fs.unlinkSync(inputPath);
                        fs.unlinkSync(outputPath);
                    } catch (err) {
                        fs.unlinkSync(inputPath);
                        return m.reply('Gagal konversi sticker (pastikan ffmpeg terinstall).');
                    }
                } else {
                    imageBuffer = media;
                }
            }

            let success = false;
            let responseText = '';

            for (const apiKey of apiKeys) {
                try {
                    const genAI = new GoogleGenerativeAI(apiKey);

                    // MODEL YANG PASTI JALAN DI INDONESIA (Desember 2025)
                    const model = genAI.getGenerativeModel({
                        model: "gemini-2.5-flash-lite"  // <--- INI YANG BENAR!
                    });

                    let promptParts = [];

                    if (hasMedia && imageBuffer) {
                        promptParts = [
                            m.text || "Jelaskan gambar ini",
                            {
                                inlineData: {
                                    mimeType: mediaMime,
                                    data: imageBuffer.toString('base64')
                                }
                            }
                        ];
                    } else {
                        promptParts = [m.text];
                    }

                    const result = await model.generateContent(promptParts);
                    const response = result.response;
                    responseText = response.text();

                    if (responseText) {
                        success = true;
                        break;
                    }
                } catch (err) {
                    console.log(`Key gagal: ${err.message}`);
                }
            }

            if (!success) {
                return m.reply('Gemini gagal: Semua key error. Coba cek kuota atau gunakan model lain.');
            }

            const cleanText = responseText
                .replace(/\*\*/g, '*')
                .replace(/\*/g, '')
                .trim();

            await m.reply(cleanText);

        } catch (err) {
            console.error('Gemini Error:', err);
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        } finally {
            naze.sendPresenceUpdate('available', m.chat);
        }
    }
};