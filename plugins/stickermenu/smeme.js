require('../../settings');
const axios = require("axios");
const { fromBuffer } = require('file-type');
const FormData = require('form-data');

async function UguuSe(buffer) {
    try {
        const form = new FormData();
        const input = Buffer.from(buffer);
        const { ext } = await fromBuffer(buffer);
        form.append('files[]', input, { filename: 'data.' + ext });
        const { data } = await axios.post('https://uguu.se/upload.php', form, {
            headers: form.getHeaders()
        });
        if (!data.files || !data.files[0]) throw new Error('Upload gagal.');
        return data.files[0].url;
    } catch (e) {
        throw new Error('Gagal upload ke Uguu.se: ' + (e.response?.data || e.message));
    }
}

module.exports = {
    name: 'smeme',
    alias: ['stickmeme', 'stikmeme', 'stickermeme', 'stikermeme'],
    description: '<reply sticker>',
    run: async ({ naze, m, args, text }) => {
        try {
            

            let quoted = m.quoted ? m.quoted : m;
            let mime = (quoted.msg || quoted).mimetype || '';

            if (!/image|webp/.test(mime)) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Format salah! Kirim atau reply gambar/stiker dengan caption.\nContoh: ${m.prefix}${m.command} teks atas|teks bawah` }, { quoted: m });
            }

            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Masukkan teks atas dan bawah!\nContoh: ${m.prefix}${m.command} teks atas|teks bawah` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            let [atas, bawah] = text.split('|').map(t => t.trim());
            atas = atas || '-';
            bawah = bawah || '-';

            let media = await (m.quoted ? m.quoted.download() : m.download());
            let upload = await UguuSe(media);

            let smemeUrl = `https://api.memegen.link/images/custom/${encodeURIComponent(atas)}/${encodeURIComponent(bawah)}.png?background=${encodeURIComponent(upload)}`;

            await naze.sendAsSticker(m.chat, smemeUrl, m, { packname: packname, author: author });
            
        } catch (e) {
            console.error(`Fatal error di smeme: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};