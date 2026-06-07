require('../../settings');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

module.exports = {
    name: 'aiimage',
    alias: ['aiimg','geminiimage'],
    run: async ({ naze, m }) => {
        const body = (m.type === 'conversation') ? m.message?.conversation || '' : 
                     (m.type === 'imageMessage') ? m.message?.imageMessage?.caption || '' : 
                     (m.type === 'videoMessage') ? m.message?.videoMessage?.caption || '' : 
                     (m.type === 'extendedTextMessage') ? m.message?.extendedTextMessage?.text || '' : 
                     (m.type === 'buttonsResponseMessage') ? m.message?.buttonsResponseMessage?.selectedButtonId || '' : 
                     (m.type === 'listResponseMessage') ? m.message?.listResponseMessage?.singleSelectReply?.selectedRowId || '' : 
                     (m.type === 'templateButtonReplyMessage') ? m.message?.templateButtonReplyMessage?.selectedId || '' : 
                     (m.type === 'messageContextInfo') ? (m.message?.buttonsResponseMessage?.selectedButtonId || m.message?.listResponseMessage?.singleSelectReply?.selectedRowId || m.text || '') : 
                     (m.type === 'editedMessage') ? (m.message?.editedMessage?.message?.protocolMessage?.editedMessage?.extendedTextMessage?.text || m.message?.editedMessage?.message?.protocolMessage?.editedMessage?.conversation || '') : 
                     '';
        const args = body.trim().split(/ +/).slice(1);
        const quoted = m.quoted ? m.quoted : m;
        const text = args.join(' ');

        let currentKeyIndex = 0;
        const apiKeys = global.key_gemini;

        async function tryApiCall() {
            const GEMINI_API_KEY = apiKeys[currentKeyIndex];
            const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
        await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
            try {
                const model = ai.getGenerativeModel({ 
                    model: 'gemini-2.0-flash-exp-image-generation',
                    generationConfig: { responseModalities: ['Text', 'Image'] }
                });

                let contents = [];
                let mime = (quoted.msg || quoted).mimetype || '';
                let isSticker = /webp/.test(mime);
                let imgData;

                const isDescriptionRequest = text.toLowerCase().includes('deskripsi') || text.toLowerCase().includes('jelaskan');

                if (quoted && (mime && (/image\/(jpe?g|png)/.test(mime) || isSticker))) {
                    if (isSticker) {
                        const media = await naze.downloadAndSaveMediaMessage(quoted);
                        const getRandom = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`;
                        const outputPath = `./temp/${getRandom('.png')}`;

                        await new Promise((resolve, reject) => {
                            exec(`ffmpeg -i ${media} ${outputPath}`, (err) => {
                                fs.unlinkSync(media);
                                if (err) reject(new Error('Gagal mengonversi sticker'));
                                else resolve();
                            });
                        });

                        imgData = fs.readFileSync(outputPath);
                        mime = 'image/png';
                        fs.unlinkSync(outputPath);
                    } else {
                        imgData = await quoted.download();
                    }

                    if (!imgData) throw new Error('Gagal mendownload/konversi media');

                    const base64Image = imgData.toString('base64');

                    if (isDescriptionRequest) {
                        contents = [
                            { text: 'Deskripsikan gambar ini secara detail.' },
                            { inlineData: { mimeType: mime, data: base64Image } }
                        ];

                        const response = await model.generateContent(contents);

                        if (!response?.response?.candidates?.[0]?.content?.parts) {
                            const finishReason = response.response?.candidates?.[0]?.finishReason;
                            if (finishReason === 'IMAGE_SAFETY') {
                                return m.reply('_⚠️ Maaf yang mulia, gambar ini ditolak oleh filter keamanan Gemini._\nCoba gambar lain atau deskripsi yang lebih umum.');
                            }
                            const errorMessage = response.response?.promptFeedback?.safetyRatings?.length > 0 
                                ? '_⚠️ Gemini menolak permintaan ini karena alasan tertentu._\nCoba deskripsi lain.'
                                : '_⚠️ Gemini tidak bisa mendeskripsikan gambar ini._\nMungkin gambarnya bermasalah atau deskripsi kurang jelas.';
                            return m.reply(errorMessage);
                        }

                        const parts = response.response.candidates[0].content.parts;
                        let description = parts.map(part => part.text || '').join('').trim();

                        if (!description) {
                            return m.reply('_⚠️ Gemini tidak memberikan deskripsi untuk gambar ini._\nCoba lagi dengan gambar lain.');
                        }

                        description = description.replace(/\*\*/g, '*')
                                                .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
                                                .replace(/\$\\frac\{([^}]+)\}\{([^}]+)\}\$/g, '$1/$2')
                                                .replace(/\\cdot/g, '×')
                                                .replace(/\$\{([^}]+)\}\$/g, '$1')
                                                .replace(/\$/g, '')
                                                .replace(/\\boxed\{([^}]+)\}/g, '➜ $1');
                        return m.reply(description);
                    } else {
                        contents = [
                            { text: `Edit gambar ini: ${text}` },
                            { inlineData: { mimeType: mime, data: base64Image } }
                        ];
                    }
                } else {
                    contents = [{ text: `Buat gambar: ${text}` }];
                }

                const response = await model.generateContent(contents);

                if (!response?.response?.candidates?.[0]?.content?.parts) {
                    const finishReason = response.response?.candidates?.[0]?.finishReason;
                    if (finishReason === 'IMAGE_SAFETY') {
                        return m.reply('_⚠️ Maaf yang mulia, permintaan ini ditolak oleh filter keamanan Gemini._\nCoba deskripsi lain atau gambar yang berbeda.');
                    }
                    throw new Error(response.response?.text || 'Gagal menghasilkan gambar');
                }

                const parts = response.response.candidates[0].content.parts;
                let imageBuffer = null;
                let textResponse = '';

                for (const part of parts) {
                    if (part.inlineData) {
                        imageBuffer = Buffer.from(part.inlineData.data, 'base64');
                    } else if (part.text) {
                        textResponse += part.text;
                    }
                }

                if (!imageBuffer) {
                    textResponse = textResponse.replace(/\*\*/g, '*')
                                              .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
                                              .replace(/\$\\frac\{([^}]+)\}\{([^}]+)\}\$/g, '$1/$2')
                                              .replace(/\\cdot/g, '×')
                                              .replace(/\$\{([^}]+)\}\$/g, '$1')
                                              .replace(/\$/g, '')
                                              .replace(/\\boxed\{([^}]+)\}/g, '➜ $1');
                    return m.reply(textResponse || '_⚠️ Gemini tidak menghasilkan gambar untuk permintaan ini._\nCoba deskripsi lain.');
                }

                const tempDir = path.join(process.cwd(), 'tmp');
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
                const filePath = path.join(tempDir, `aiimage_${Date.now()}.png`);
                fs.writeFileSync(filePath, imageBuffer);

                if (isSticker) {
                    await naze.sendAsSticker(m.chat, filePath, m, { packname: '', author: '' });
                } else {
                    const caption = textResponse ? textResponse.replace(/\*\*/g, '*')
                                                          .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
                                                          .replace(/\$\\frac\{([^}]+)\}\{([^}]+)\}\$/g, '$1/$2')
                                                          .replace(/\\cdot/g, '×')
                                                          .replace(/\$\{([^}]+)\}\$/g, '$1')
                                                          .replace(/\$/g, '')
                                                          .replace(/\\boxed\{([^}]+)\}/g, '➜ $1')
                                            : `✨ *Gambar jadi, yang mulia!*\n\nDeskripsi: ${text}`;
                    await naze.sendMessage(m.chat, {
                        image: { url: filePath },
                        caption: caption
                    }, { quoted: m });
                }

                setTimeout(() => {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                }, 30000);

            } catch (error) {
                if (error.message.includes('API key') || error.message.includes('quota') || error.message.includes('limit')) {
                    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
                    if (currentKeyIndex === 0) {
                        return m.reply('_⚠️ Semua kunci API telah gagal, coba lagi nanti._');
                    }
                    return tryApiCall();
                }
                throw error;
            }
        }

        if (!text) {
            return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                `📋 *Panduan Penggunaan .aiimage:*\n` +
                `------------------------\n` +
                `✨ *Generate Gambar/Sticker Baru:*\n` +
                `  - Perintah: \`.aiimage <deskripsi>\`\n` +
                `  - Contoh: \`.aiimage 3D kastil megah di hutan ajaib\`\n` +
                `  - Tips: Gunakan deskripsi detail (contoh: "3D rumah modern di pegunungan").\n` +
                `------------------------\n` +
                `🖌️ *Edit Gambar/Sticker:*\n` +
                `  - Perintah: Reply gambar/sticker, lalu \`.aiimage <deskripsi edit>\`\n` +
                `  - Contoh: \`.aiimage Ubah jadi kucing hitam\`\n` +
                `------------------------\n` +
                `📝 *Deskripsikan Gambar/Sticker:*\n` +
                `  - Perintah: Reply gambar/sticker, lalu \`.aiimage Deskripsi gambar ini\`\n` +
                `  - Contoh: \`.aiimage Jelaskan gambar ini\``);
        }

        try {
            await tryApiCall();
        } catch (error) {
            m.reply(`_❌ Kesalahan teknis, yang mulia._\nDetail: ${error.message}`);
        }
    }
};