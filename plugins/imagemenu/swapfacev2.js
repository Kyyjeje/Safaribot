require('../../settings');
const axios = require("axios");

module.exports = {
    name: 'faceswapv2',
    alias: ['faceswapv2','swapface2', 'swapfacev2'],
    run: async ({ naze, m, text }) => {
        try {
            if (!text.includes(",")) {
                console.warn("[WARNING] Format salah! Input tidak mengandung koma.");
                return m.reply("⚠️ Format salah! Gunakan: *faceswapv2 <url img 1>,<url img 2>*");
            }

            let [source, target] = text.split(",").map(v => v.trim());
            if (!isValidUrl(source) || !isValidUrl(target)) {
                console.warn("[WARNING] Salah satu URL gambar tidak valid!");
                return m.reply("⚠️ Pastikan dua URL gambar valid!");
            }
             await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
            let apiUrl = `https://api.siputzx.my.id/api/imgedit/faceswap?image1=${encodeURIComponent(source)}&image2=${encodeURIComponent(target)}`;
            let maxRetries = 2;
            let attempt = 0;
            let success = false;
            let imageUrl;

            while (attempt < maxRetries && !success) {
                try {
                    let response = await axios.get(apiUrl);
                    let data = response.data;
                    if (data.status && data.data) {
                        imageUrl = data.data;
                        success = true;
                    } else {
                        console.error("[ERROR] Response API tidak valid:", data);
                    }
                } catch (err) {
                    console.error(`[ERROR] Gagal menghubungi API (Percobaan ${attempt + 1}):`, err.message);
                }

                attempt++;
                if (!success) {
                    console.log("[LOG] Menunggu 3 detik sebelum mencoba ulang...");
                    await new Promise(res => setTimeout(res, 3000));
                }
            }

            if (!success) {
                console.error("[ERROR] Gagal memproses swap wajah setelah beberapa percobaan!");
                return m.reply("❌ Gagal memproses swap wajah setelah beberapa percobaan!");
            }
            await naze.sendMessage(m.chat, { image: { url: imageUrl }, caption: "✅ *Berhasil swap wajah!*" }, { quoted: m });
			
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};

// Fungsi untuk validasi URL
function isValidUrl(url) {
    let regex = /^(https?:\/\/)[^\s$.?#].[^\s]*$/;
    return regex.test(url);
}
