require('../../settings');
const axios = require('axios');
const sharp = require('sharp');
const { getContentType } = require('baileys');
const FormData = require('form-data');
const { fromBuffer } = require('file-type');

// Fungsi upload ke Uguu.se (untuk gambar dan stiker)
async function UguuSe(buffer) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("[LOG] Mengupload ke Uguu.se...");
            const form = new FormData();
            const input = Buffer.from(buffer);
            const { ext } = await fromBuffer(buffer);
            form.append('files[]', input, { filename: 'data.' + ext });

            const { data } = await axios.post('https://uguu.se/upload.php', form, {
                headers: {
                    ...form.getHeaders()
                }
            });

            console.log("[LOG] Response dari Uguu.se:", data);
            if (!data.files || !data.files[0]) {
                throw new Error("Struktur response tidak sesuai atau upload gagal.");
            }
            resolve(data.files[0].url); // Pastikan mengambil .url dari objek file
        } catch (e) {
            console.error("[ERROR] Gagal upload ke Uguu.se:", e.response?.data || e.message);
            reject(e);
        }
    });
}

module.exports = {
    name: 'qc',
    alias: ['quote', 'fakechat'],
    description: '<teks/reply teks/gambar>',
    run: async ({ naze, m, args, text }) => {
        let textToQuote = '';
        let name = '';
        let senderId = m.sender;
        let ppnya = await naze.profilePictureUrl(senderId, 'image').catch(() => 'https://i.pinimg.com/564x/8a/e9/e9/8ae9e92fa4e69967aa61bf2bda967b7b.jpg');
        let mediaUrl = null;
        await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

        try {
            // Ambil tipe pesan yang di-reply (jika ada)
            const quoted = m.quoted ? m.quoted : null;
            let quotedType = quoted ? getContentType(quoted.message) : null;

            // Kasus 1: qc <teks> (tanpa reply atau dengan reply, tapi teks tanpa tanda kurung)
            if (text && !text.match(/\((.*?)\)/)) {
                textToQuote = text;
                name = m.pushName || 'Unknown';
                senderId = m.sender;
                ppnya = await naze.profilePictureUrl(senderId, 'image').catch(() => 'https://i.pinimg.com/564x/8a/e9/e9/8ae9e92fa4e69967aa61bf2bda967b7b.jpg');

                if (quoted && (quotedType === 'imageMessage' || quotedType === 'stickerMessage')) {
                    const mediaBuffer = await quoted.download();
                    const mime = quoted.message[quotedType].mimetype || '';

                    if (/image\/(png|jpe?g)/.test(mime) || /webp/.test(mime)) {
                        mediaUrl = await UguuSe(mediaBuffer);
                    }

                    if (!mediaUrl) {
                        throw new Error('Gagal mengunggah media ke server hosting.');
                    }
                }
            } 
            // Kasus 2: qc (nama) saat reply (teks dari reply, nama dari tanda kurung)
            else if (quoted && text.match(/\((.*?)\)/)) {
                if (quotedType === 'imageMessage' || quotedType === 'stickerMessage') {
                    textToQuote = quoted.message[quotedType].caption || '';
                    const mediaBuffer = await quoted.download();
                    const mime = quoted.message[quotedType].mimetype || '';

                    if (/image\/(png|jpe?g)/.test(mime) || /webp/.test(mime)) {
                        mediaUrl = await UguuSe(mediaBuffer);
                    }

                    if (!mediaUrl) {
                        throw new Error('Gagal mengunggah media ke server hosting.');
                    }
                } else if (quoted.text) {
                    textToQuote = quoted.text;
                }
                senderId = quoted.sender1;
                ppnya = await naze.profilePictureUrl(senderId, 'image').catch(() => 'https://i.pinimg.com/564x/8a/e9/e9/8ae9e92fa4e69967aa61bf2bda967b7b.jpg');
                let match = text.match(/\((.*?)\)/);
                name = match[1].trim();
            } 
            // Kasus 3: qc saat reply tanpa teks tambahan (teks atau media, nama, dan gambar dari reply)
            else if (quoted && !text) {
                if (quotedType === 'imageMessage' || quotedType === 'stickerMessage') {
                    textToQuote = quoted.message[quotedType].caption || '';
                    const mediaBuffer = await quoted.download();
                    const mime = quoted.message[quotedType].mimetype || '';

                    if (/image\/(png|jpe?g)/.test(mime) || /webp/.test(mime)) {
                        mediaUrl = await UguuSe(mediaBuffer);
                    }

                    if (!mediaUrl) {
                        throw new Error('Gagal mengunggah media ke server hosting.');
                    }
                } else if (quoted.text) {
                    textToQuote = quoted.text;
                }
                senderId = quoted.sender1;
                ppnya = await naze.profilePictureUrl(senderId, 'image').catch(() => 'https://i.pinimg.com/564x/8a/e9/e9/8ae9e92fa4e69967aa61bf2bda967b7b.jpg');
                name = quoted.pushName || 'Unknown';
            } 
            // Kasus 4: Format salah atau tidak ada teks/reply
            else {
                
                return m.reply(`
🌟 Buat Quote Chat 🌟
━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *Format salah!*
Gunakan perintah:
✧ .qc <teks> (contoh: .qc Aku sayang kamu)
✧ Reply pesan (teks, gambar, atau stiker) lalu ketik .qc
✧ Reply pesan lalu ketik .qc (nama)

💡 Pastikan ada teks, gambar, atau stiker!
━━━━━━━━━━━━━━━━━━━━━━━
                `);
            }

            if (textToQuote.length > 350) {
                
                return m.reply(`
🌟 Buat Quote Chat 🌟
━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *Teks terlalu panjang!*
Maksimal 350 karakter agar stiker tetap proporsional dan jernih.
━━━━━━━━━━━━━━━━━━━━━━━
                `);
            }

            const scaleValue = mediaUrl ? 1 : 1;

            const json = {
                type: 'quote',
                format: 'webp',
                backgroundColor: '#1b1429',
                width: 512,
                height: 768,
                scale: scaleValue,
                messages: [
                    {
                        entities: [],
                        avatar: true,
                        from: {
                            id: 1,
                            name: name,
                            photo: {
                                url: ppnya
                            }
                        },
                        text: textToQuote,
                        ...(mediaUrl ? { media: { url: mediaUrl } } : {}),
                        replyMessage: {}
                    }
                ]
            };

            

            // Tambahkan logging untuk debugging
            console.log("[LOG] Mengirim request ke API:", JSON.stringify(json, null, 2));
            const response = await axios.post('https://bot.lyo.su/quote/generate', json, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000 // Tambahkan timeout 10 detik
            });

            console.log("[LOG] Response dari API:", response.data);
            let buffer = Buffer.from(response.data.result.image, 'base64');

            buffer = await sharp(buffer)
                .resize({
                    width: 512,
                    height: 512,
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .webp({ quality: 100 })
                .toBuffer();

            await naze.sendAsSticker(m.chat, buffer, m, { packname: global.packname, author: global.author});

            
        } catch (e) {
            console.error(`Fatal error di qc: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};