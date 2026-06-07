require('../../settings');
const axios = require("axios");

module.exports = {
    name: 'stele',
    alias: ['stele', 'stickertelegram', 'stickertele', 'sticktele'],
    description: '<1-xx> <url sticker>',
    run: async ({ naze, m }) => {
        // Extract message text based on message type
        const body = (m.type === 'conversation') ? m.message.conversation :
                     (m.type === 'imageMessage') ? m.message.imageMessage.caption :
                     (m.type === 'videoMessage') ? m.message.videoMessage.caption :
                     (m.type === 'extendedTextMessage') ? m.message.extendedTextMessage.text :
                     (m.type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId :
                     (m.type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                     (m.type === 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId :
                     (m.type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) :
                     (m.type === 'editedMessage') ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage ? m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage.text : m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';

        const args = body.trim().split(/ +/).slice(1);
        if (!args.length) {
            return m.reply(`Format salah! 
Gunakan perintah:
\`.stele <jumlah/all> <nama pack sticker Telegram atau URL>\`
atau
\`.stele <awal-akhir> <nama pack sticker Telegram atau URL>\`
atau
\`.stele <nama pack sticker Telegram atau URL>\`
Contoh: \`.stele 12-15 emotbatuyyz\`, \`.stele 5 https://t.me/addstickers/emotbatuyyz\`, atau \`.stele emotbatuyyz\``);
        }
        let limit = 'all';
        let stickerInput = args;
        if (args.length > 1 && (args[0].match(/^\d+$/) || args[0].match(/^\d+-\d+$/) || args[0].toLowerCase() === 'all')) {
            limit = args[0];
            stickerInput = args.slice(1);
        }
        let stickerPackName = stickerInput.join(' ').trim();

        // Check if input is a URL and extract pack name
        if (stickerPackName.match(/https?:\/\/t\.me\/addstickers\/(.+)/i)) {
            const match = stickerPackName.match(/https?:\/\/t\.me\/addstickers\/([^\/?]+)/i);
            if (!match || !match[1]) {
                return m.reply('URL stiker tidak valid. Harap masukkan URL yang benar, misalnya: https://t.me/addstickers/emotbatuyyz');
            }
            stickerPackName = match[1];
        }

        if (!stickerPackName) {
            return m.reply('Nama pack stiker atau URL tidak valid. Harap masukkan nama pack atau URL yang benar.');
        }

        try {
            //console.log(`[INFO] Mengambil sticker pack: ${stickerPackName}`);

            const token = '8076926331:AAE_oBOXorHIrWfYy8ni66mp981CIOqzJ8k';
            const response = await axios.get(`https://api.telegram.org/bot${token}/getStickerSet?name=${encodeURIComponent(stickerPackName)}`);
            const result = response.data;

            if (!result.ok || !result.result.stickers) {
                console.error(`[ERROR] Gagal mendapatkan stiker dari pack: ${stickerPackName}, Error: ${result.description}`);
                if (result.description === 'Bad Request: STICKERSET_INVALID') {
                    return m.reply(`Sticker pack '${stickerPackName}' tidak ditemukan atau tidak valid. Pastikan nama pack benar dan stiker tersedia di Telegram.`);
                }
                return m.reply(`Hamba gagal mendapatkan stiker dari pack tersebut. Error: ${result.description}`);
            }

            const stickers = result.result.stickers;
            const totalStickers = stickers.length;
            console.log(`[INFO] Ditemukan ${totalStickers} stiker dalam pack ${stickerPackName}`);

            if (totalStickers === 0) {
                return m.reply('Hamba tidak menemukan stiker dalam pack tersebut.');
            }

            let stickersToSend;
            if (limit.includes('-')) {
                const [start, end] = limit.split('-').map(num => parseInt(num));
                if (isNaN(start) || isNaN(end) || start < 1 || end < start || end > totalStickers) {
                    return m.reply(`Range tidak valid. Harap masukkan range yang benar (1-${totalStickers}). Contoh: \`.stele 12-15 ${stickerPackName}\``);
                }
                stickersToSend = stickers.slice(start - 1, end);
            } else {
                const requestedLimit = limit.toLowerCase() === 'all' ? totalStickers : parseInt(limit) || 5; // Default to 5 if invalid
                stickersToSend = stickers.slice(0, Math.min(requestedLimit, totalStickers));
            }

            // Separate photo (static) and animated stickers
            let photoStickers = [];
            let animatedStickers = [];
             // Send "wait" message with thumbnail
            for (let sticker of stickersToSend) {
                const fileResponse = await axios.get(`https://api.telegram.org/bot${token}/getFile?file_id=${sticker.file_id}`);
                const fileData = fileResponse.data;
                if (!fileData.ok) {
                    console.error(`[ERROR] Gagal mendapatkan file untuk stiker: ${sticker.file_id}`);
                    continue;
                }
                const filePath = fileData.result.file_path;
                const stickerUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

                if (sticker.is_animated || sticker.is_video) {
                    animatedStickers.push({ fileId: sticker.file_id, url: stickerUrl });
                } else {
                    photoStickers.push({ fileId: sticker.file_id, url: stickerUrl });
                }
            }

            // Send animated stickers
            if (animatedStickers.length > 0) {
                await naze.sendMessage(m.chat, { text: `Hamba akan menampilkan ${animatedStickers.length} dari ${totalStickers} stiker bergerak.` }, { quoted: m });
                for (let i = 0; i < animatedStickers.length; i++) {
                    try {
                        console.log(`[INFO] Mengirim stiker bergerak ${i + 1}/${animatedStickers.length}: ${animatedStickers[i].url}`);
                        await naze.sendSticker(m.chat, animatedStickers[i].url);
                        await new Promise(resolve => setTimeout(resolve, 3000)); // 2-second delay
                    } catch (sendError) {
                        console.error(`[ERROR] Gagal mengirim stiker bergerak ${i + 1}: ${sendError.message}`);
                        await m.reply(`⚠️ Gagal mengirim stiker bergerak ke-${i + 1}. Lanjut mengirim yang lain...`);
                    }
                }
            }

            // Send photo stickers as carousel
            if (photoStickers.length > 0) {
                await naze.sendMessage(m.chat, { text: `Hamba akan menampilkan ${photoStickers.length} dari ${totalStickers} stiker foto.` }, { quoted: m });

                // Create carousel cards with single copy button
                const carouselCards = photoStickers.map((sticker, index) => ({
                    url: sticker.url,
                    body: `📌 *Stiker Foto ${index + 1}*`,
                    footer: 'Telegram Sticker',
                    buttons: [
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '🔗 Lihat URL Stiker',
                                url: sticker.url,
                            }),
                        },
                        {
                            name: 'cta_copy',
                            buttonParamsJson: JSON.stringify({
                                display_text: '📋 Salin URL Stiker',
                                id: sticker.url,
                                copy_code: sticker.url,
                            }),
                        },
                        {
                            name: 'cta_copy',
                            buttonParamsJson: JSON.stringify({
                                display_text: '📋 Salin Perintah Download',
                                id: 'stele_dl',
                                copy_code: `.stelenya ${sticker.url}`,
                            }),
                        },
                    ],
                }));

                try {
                    await naze.sendCarouselMsg(
                        m.key.remoteJid,
                        'Hasil Stiker Foto Telegram',
                        'Pilih stiker yang Anda inginkan',
                        carouselCards,
                        undefined, // No thumbnail
                        { quoted: m }
                    );
                } catch (carouselError) {
                    console.error(`[ERROR] Gagal mengirim carousel: ${carouselError.message}`);
                    await m.reply('⚠️ Gagal mengirim stiker sebagai carousel. Mengirim sebagai pesan biasa...');

                    // Fallback: Send stickers as individual messages
                    for (let i = 0; i < photoStickers.length; i++) {
                        try {
                            await naze.sendMessage(m.chat, {
                                image: { url: photoStickers[i].url },
                                caption: `📌 *Stiker Foto ${i + 1}*\n🔗 URL: ${photoStickers[i].url}`,
                            }, { quoted: m });
                            await new Promise(resolve => setTimeout(resolve, 2000)); // 1-second delay
                        } catch (sendError) {
                            console.error(`[ERROR] Gagal mengirim stiker foto ${i + 1}: ${sendError.message}`);
                            await m.reply(`⚠️ Gagal mengirim stiker foto ke-${i + 1}.`);
                        }
                    }
                }
            }

            if (animatedStickers.length > 0 || photoStickers.length > 0) {
              
            } else {
                await m.reply('Tidak ada stiker yang ditemukan untuk ditampilkan dalam range tersebut.');
            }

        } catch (e) {
            console.error(`Fatal error di stele: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    },
};