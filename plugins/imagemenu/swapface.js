require('../../settings');
const axios = require("axios");
const FormData = require("form-data");
const { fromBuffer } = require("file-type");
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
    name: 'faceswap',
    alias: ['faceswap','swapface'],
    run: async ({ naze, m }) => {
        try {
            let input = m.text.split(" ")[1];
            if (!input || !input.includes(",")) return m.reply("⚠️ Format salah! Gunakan: *faceswap <url img 1>,<url img 2>*");

            let [source, target] = input.split(",").map(v => v.trim());
            if (!source.startsWith("http") || !target.startsWith("http")) {
                return m.reply("❌ Pastikan kedua URL gambar valid!");
            }

             await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
            let apiUrl = `https://api.siputzx.my.id/api/ai/faceswap?source=${encodeURIComponent(source)}&target=${encodeURIComponent(target)}`;
            
            let response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            if (!response.data) return m.reply("❌ Gagal melakukan faceswap!");

            console.log("[LOG] Faceswap berhasil, mengirim gambar...");
            await naze.sendMessage(m.chat, { image: response.data, caption: "✅ *Berhasil swap wajah!*" }, { quoted: m });
			
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};
