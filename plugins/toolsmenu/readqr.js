require('../../settings');
const fetch = require('node-fetch');
const FormData = require('form-data');

const qr = {
    readFromBuffer: async (imageBuffer) => {
        if (!Buffer.isBuffer(imageBuffer)) throw new Error(`Invalid buffer input`);
        const form = new FormData();
        form.append("file", imageBuffer, { filename: "file.png" });

        const response = await fetch("http://api.qrserver.com/v1/read-qr-code/", {
            body: form,
            headers: form.getHeaders(),
            method: "post"
        });

        if (!response.ok) throw new Error(`${response.statusText} ${response.status}`);
        const json = await response.json();
        const data = json?.[0]?.symbol?.[0]?.data;
        if (!data) throw new Error(`Request OK but result is anomalous`);
        return data;
    }
};

module.exports = {
    name: 'readqr',
    alias: ['readqrcode'],
    description: '<reply gambar/sticker>',
    run: async ({ naze, m }) => {
        try {
            

            const quoted = m.quoted ? m.quoted : m;
            const mime = (quoted.msg || quoted).mimetype || quoted.type || '';
            if (!m.quoted || !/image|webp/.test(mime)) {
                
                return naze.sendMessage(m.chat, { text: `Reply gambar atau sticker yang berisi QR code!\nContoh: Reply gambar/sticker dengan ${m.prefix}${m.command}\n\nCatatan: Gunakan ${m.prefix}qr <teks> untuk membuat QR code.` }, { quoted: m });
            }

            const media = await quoted.download();
            if (!media) {
                
                return naze.sendMessage(m.chat, { text: `Gagal mengunduh media! Pastikan Anda mereply gambar atau sticker.` }, { quoted: m });
            }

            const qrData = await qr.readFromBuffer(media);
            
            await naze.sendMessage(m.chat, { text: `✅ Isi QR code: ${qrData}` }, { quoted: m });
        } catch (err) {
            console.error(`Kesalahan saat membaca QR: ${err.message}`);
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};