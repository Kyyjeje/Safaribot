require('../../settings');
const fetch = require('node-fetch');

module.exports = {
    name: 'bluearchivelogo',
    alias: ['balogo','bclogo'],
    description: '<teks_kiri>,<teks_kanan>',
    run: async ({ naze, m, text }) => {
        try {
            if (!text) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Blue Archive Logo:*\n` +
                              `  Perintah: \n\`${m.prefix}${m.command} <teks_kiri>,<teks_kanan>\`\n` +
                              `  Pemisah: , . | /\n` +
                              `  Contoh: \n\`${m.prefix}bluearchivelogo bangsul,botz\``);
            }

            const separator = text.match(/[,.\|/]/);
            if (!separator) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Blue Archive Logo:*\n` +
                              `  Perintah: Gunakan pemisah , . | atau / antara teks kiri dan kanan\n` +
                              `  Contoh: \n\`${m.prefix}bluearchivelogo bangsul,botz\``);
            }

            const [textL, textR] = text.split(separator[0]).map(t => t.trim());
            if (!textL || !textR) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Blue Archive Logo:*\n` +
                              `  Perintah: Masukkan teks kiri dan kanan\n` +
                              `  Contoh: \n\`${m.prefix}bluearchivelogo bangsul,botz\``);
            }

                    await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
            
            await new Promise(resolve => setTimeout(resolve, 500));
            

            const encodedTextL = encodeURIComponent(textL);
            const encodedTextR = encodeURIComponent(textR);
            const apiUrl = `https://api.yogik.id/maker/bluearchive?textL=${encodedTextL}&textR=${encodedTextR}`;

            const res = await fetch(apiUrl, {
                headers: {
                    'Accept': 'image/*',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
                },
                timeout: 15000
            });

            if (!res.ok) throw new Error(`Permintaan gagal: ${res.status} ${res.statusText}`);
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.startsWith('image/')) {
                throw new Error('Respons bukan gambar atau format tidak didukung');
            }

            const buffer = await res.buffer();
            await naze.sendMessage(m.chat, {
                image: buffer,
                caption: `*Blue Archive Logo*\nTeks Kiri: ${textL}\nTeks Kanan: ${textR}`
            }, { quoted: m });
            
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};