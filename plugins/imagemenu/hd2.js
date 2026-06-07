const fetch = require('node-fetch');
const FormData = require('form-data');
const sharp = require('sharp');
require('../../settings');

// Fungsi untuk mencoba fetch dengan failover ke kunci API lain (tanpa retry per key)
const fetchWithRetryAndFailover = async (url, options, apiKeys, timeout = 15000) => {
    for (let keyIndex = 0; keyIndex < apiKeys.length; keyIndex++) {
        const apiKey = apiKeys[keyIndex];
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            const updatedOptions = {
                ...options,
                headers: {
                    ...options.headers,
                    'x-rapidapi-key': apiKey,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            };
            const response = await fetch(url, { ...updatedOptions, signal: controller.signal });
            clearTimeout(timeoutId);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}: ${errorText}`);
            }
            return response;
        } catch (error) {
            if (keyIndex === apiKeys.length - 1) {
                throw new Error(`Semua kunci API gagal: ${error.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, 5000)); // Delay 5 detik antar kunci
        }
    }
};

// Fungsi remini (tidak diubah)
async function remini(imageBuffer, mode) {
    return new Promise((resolve, reject) => {
        let availableModes = ["enhance", "recolor", "dehaze"];
        mode = availableModes.includes(mode) ? mode : "enhance";

        let formData = new FormData();
        let url = `https://inferenceengine.vyro.ai/${mode}`;

        formData.append("model_version", 1, { "Content-Transfer-Encoding": "binary", contentType: "multipart/form-data; charset=utf-8" });
        formData.append("image", Buffer.from(imageBuffer), { filename: "enhance_image_body.jpg", contentType: "image/jpeg" });

        formData.submit({
            url: url,
            host: "inferenceengine.vyro.ai",
            path: `/${mode}`,
            protocol: "https:",
            headers: {
                "User-Agent": "okhttp/4.9.3",
                Connection: "Keep-Alive",
                "Accept-Encoding": "gzip"
            }
        }, function (err, res) {
            if (err) return reject(err);
            let chunks = [];
            res.on("data", chunk => chunks.push(chunk))
                .on("end", () => resolve(Buffer.concat(chunks)))
                .on("error", reject);
        });
    });
}

// Fungsi untuk validasi dan resize gambar
async function validateAndResizeImage(buffer) {
    try {
        const { width, height } = await sharp(buffer).metadata();
        if (width < 256 || height < 256) {
            return await sharp(buffer).resize({ width: 256, height: 256, fit: 'inside' }).toBuffer();
        }
        if (width > 5760 || height > 3240) {
            return await sharp(buffer).resize({ width: 5760, height: 3240, fit: 'inside' }).toBuffer();
        }
        return buffer;
    } catch (e) {
        throw new Error(`Gagal memvalidasi/resize gambar: ${e.message}`);
    }
}

// Fungsi upscale menggunakan endpoint RapidAPI
async function runUpscale(naze, m, media) {
    try {
        const validatedImgData = await validateAndResizeImage(media);
        const mime = (m.quoted ? m.quoted : m).mimetype || 'image/jpeg';
        const form = new FormData();
        form.append('image', Buffer.from(validatedImgData), {
            filename: `image.${mime.split('/')[1]}`,
            contentType: mime
        });

        if (!global.rapid_api || !Array.isArray(global.rapid_api) || global.rapid_api.length === 0) {
            throw new Error('Kunci API tidak ditemukan atau tidak valid. Periksa konfigurasi.');
        }

        const options = {
            method: 'POST',
            headers: {
                'x-rapidapi-host': 'ai-image-upscaler1.p.rapidapi.com',
                ...form.getHeaders()
            },
            body: form
        };

        const response = await fetchWithRetryAndFailover(
            'https://ai-image-upscaler1.p.rapidapi.com/v1',
            options,
            global.rapid_api,
            15000
        );

        const result = await response.json();
        if (!result?.result_base64) {
            throw new Error('Gagal upscale gambar: Tidak ada result_base64 dalam respons');
        }

        // Konversi base64 ke buffer
        const imageBuffer = Buffer.from(result.result_base64, 'base64');

        // Kirim gambar
        await naze.sendMessage(m.chat, {
            image: imageBuffer,
            caption: '✅ Berhasil meningkatkan kualitas gambar menggunakan upscale!'
        }, { quoted: m });

    } catch (e) {
        throw e; // Lempar error untuk ditangani oleh caller
    }
}

// Main plugin code
module.exports = {
    name: 'hd2',
    alias: ['tohd2', 'remini2', '.hd2', '.remini2', '.tohd2'],
    run: async ({ naze, m }) => {
        let mediaMessage = m.quoted ? m.quoted : m;
        let mime = (mediaMessage.msg || mediaMessage).mimetype || '';

        if (!/image/.test(mime)) {
            return m.reply(`Kirim atau reply gambar dengan format\nContoh: ${m.prefix + m.command}`);
        }
        await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
        let media = await mediaMessage.download();
        

        try {
            await runUpscale(naze, m, media);
        } catch (e) {
            await naze.sendMessage(m.chat, { text: '⚠️ Server upscale bermasalah, beralih ke Remini...' }, { quoted: m });
            try {
                const validatedImgData = await validateAndResizeImage(media);
                let enhanced1 = await remini(validatedImgData, 'enhance');
                let enhanced2 = await remini(enhanced1, 'enhance');

                const MINIMUM_SIZE = 1024; // 1 KB
                if (enhanced2.length < MINIMUM_SIZE) {
                    return await naze.sendMessage(m.chat, { text: '⚠️ Gagal meningkatkan kualitas gambar: Hasil terlalu kecil.' }, { quoted: m });
                }

                await naze.sendMessage(m.chat, { image: enhanced2, caption: '_Gambar sudah di-HD-kan_' }, { quoted: m });
            } catch (reminiError) {
                await naze.sendMessage(m.chat, { text: '⚠️ Gagal meningkatkan kualitas gambar: ' + reminiError.message }, { quoted: m });
            }
        }
    }
};