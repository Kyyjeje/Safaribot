require('../../settings');
const axios = require("axios");
const FormData = require("form-data");
const { fromBuffer } = require("file-type");

// Fungsi upload ke Uguu.se (untuk semua media termasuk gambar dan sticker)
async function UguuSe(buffer) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("[LOG] Mengupload ke Uguu.se...");
            const form = new FormData();
            const { ext } = await fromBuffer(buffer);
            form.append('files[]', buffer, { filename: 'data.' + ext });

            const { data } = await axios.post('https://uguu.se/upload.php', form, {
                headers: { ...form.getHeaders() }
            });

            console.log("[LOG] Response dari Uguu.se:", data);
            resolve(data.files?.[0]?.url || null);
        } catch (e) {
            console.error("[ERROR] Gagal upload ke Uguu.se:", e.response?.data || e.message);
            reject(e);
        }
    });
}

module.exports = {
    name: 'removebg',
    alias: ['rmbg','removebackground'],
    run: async ({ naze, m }) => {
        try {
            const quoted = m.quoted ? m.quoted : m;
            if (!quoted) return m.reply("⚠️ Reply gambar atau sticker yang ingin dihapus backgroundnya!");

            const mime = (quoted.msg || quoted).mimetype || '';
            console.log("[LOG] Menerima media dengan MIME type:", mime);

            if (!mime) return m.reply("⚠️ Tidak ada media yang bisa diupload!");

            
            let media = await quoted.download();
            console.log("[LOG] Media berhasil diunduh, ukuran:", media.length, "bytes");

            let url = await UguuSe(media);
            
            if (!url || !url.startsWith("http")) {
                console.error("[ERROR] Upload gagal! URL tidak valid:", url);
                return m.reply("❌ Gagal mengunggah file!");
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
            let removeBgUrl = `https://api.siputzx.my.id/api/iloveimg/removebg?image=${encodeURIComponent(url)}&scale=2`;

            let response = await axios.get(removeBgUrl, { responseType: 'arraybuffer' });
            if (!response.data) return m.reply("❌ Gagal menghapus background!");

            console.log("[LOG] Background berhasil dihapus, mengirim gambar...");
            await naze.sendMessage(m.chat, { image: response.data, caption: "✅ *Berhasil menghapus background!*" }, { quoted: m });
			
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};
