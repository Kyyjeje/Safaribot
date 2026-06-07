require('../../settings');
const axios = require("axios");
const util = require("util");
const fs = require("fs").promises;
const path = require("path");
const { performance } = require('perf_hooks');

// Puppeteer fallback untuk bypass Cloudflare
let puppeteer;
let StealthPlugin;
try {
    puppeteer = require('puppeteer-extra');
    StealthPlugin = require('puppeteer-extra-plugin-stealth');
    puppeteer.use(StealthPlugin());
    console.log('Puppeteer loaded for Cloudflare bypass');
} catch (e) {
    console.error('Puppeteer not installed or failed to load:', e.message);
}

module.exports = {
    name: 'get',
    alias: ['fetch', '.get', '.fetch'],
    description: '<url>',
    run: async ({ naze, m, args, text }) => {
        await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
        let url = text.trim();

        // Jika tidak ada URL di perintah tapi pesan adalah balasan, coba ekstrak URL
        if (!url && m.quoted && m.quoted.text) {
            const urlRegex = /https?:\/\/[^\s<>"']+/gi;
            const urls = m.quoted.text.match(urlRegex);
            if (urls && urls.length > 0) {
                url = urls[0];
            }
        }

        // Validasi URL
        if (!url || !/^https?:\/\//.test(url)) {
            return m.reply("Format salah!!! Gunakan perintah:\n .get http:// atau https://\nAtau reply pesan yang berisi URL.");
        }

        // Fungsi untuk mendapatkan header dinamis
        const getDynamicHeaders = () => {
            const chromeVersion = Math.floor(Math.random() * 10) + 120; // Random Chrome version
            return {
                'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.0.0 Safari/537.36`,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0',
                'Referer': `https://www.google.com/search?q=${encodeURIComponent(url.split('/')[2])}`,
                'Cookie': `session=${Math.random().toString(36).substring(2, 15)}` // Fake cookie untuk simulasi
            };
        };

        // Fungsi fetch dengan Axios + fallback Puppeteer
        const fetchWithFallback = async (url, maxRetries = 2) => {
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    // Coba Axios dulu
                    const config = {
                        timeout: 10000,
                        headers: getDynamicHeaders(),
                        maxRedirects: 5,
                        httpsAgent: new (require('https').Agent)({ 
                            rejectUnauthorized: false,
                            keepAlive: true,
                            maxSockets: 10
                        })
                    };

                    // Untuk text/JSON, pakai responseType 'text'
                    if (url.endsWith('.json') || url.includes('/stats') || url.includes('/api')) {
                        config.responseType = 'text';
                    } else {
                        config.responseType = 'arraybuffer';
                    }

                    const response = await axios.get(url, config);
                    return response;
                } catch (error) {
                    console.log(`Axios attempt ${attempt} gagal: ${error.message}`);
                    if (error.response && error.response.status === 403) {
                        console.log('Deteksi Cloudflare block. Coba fallback ke Puppeteer...');
                        if (!puppeteer) {
                            console.log('Puppeteer tidak tersedia. Lewati ke percobaan berikutnya...');
                            if (attempt === maxRetries) throw new Error('Puppeteer tidak terinstall. Install dengan: npm i puppeteer puppeteer-extra puppeteer-extra-plugin-stealth');
                            continue;
                        }
                        try {
                            const browser = await puppeteer.launch({
                                headless: 'new',
                                args: [
                                    '--no-sandbox',
                                    '--disable-setuid-sandbox',
                                    '--disable-dev-shm-usage',
                                    '--disable-accelerated-2d-canvas',
                                    '--no-first-run',
                                    '--no-zygote',
                                    '--disable-gpu',
                                    '--disable-web-security',
                                    `--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`
                                ]
                            });
                            const page = await browser.newPage();
                            await page.setExtraHTTPHeaders(getDynamicHeaders());
                            await page.setViewport({ width: 1366, height: 768 });

                            const content = await page.evaluate(async (targetUrl) => {
                                const response = await fetch(targetUrl, {
                                    method: 'GET',
                                    headers: {
                                        'Accept': 'application/json, text/plain, */*',
                                        'Sec-Fetch-Dest': 'empty',
                                        'Sec-Fetch-Mode': 'cors',
                                        'Sec-Fetch-Site': 'same-origin'
                                    }
                                });
                                if (!response.ok) {
                                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                                }
                                return await response.text();
                            }, url);

                            await browser.close();
                            console.log('Puppeteer sukses bypass Cloudflare');
                            return { data: content, headers: { 'content-type': 'text/plain' } };
                        } catch (puppeteerError) {
                            console.error('Puppeteer gagal:', puppeteerError);
                            if (attempt === maxRetries) throw error;
                        }
                    } else {
                        if (attempt === maxRetries) throw error;
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
        };

        try {
            const startTime = performance.now();
            const { data: ipData } = await axios.get("https://api.ipify.org?format=json");
            const response = await fetchWithFallback(url);

            let contentType = response.headers["content-type"] || "";
            let data = response.data;

            if (typeof data === 'string') {
                data = Buffer.from(data, 'utf8');
                if (!contentType) contentType = 'text/plain';
            } else {
                data = Buffer.from(data);
            }

            const buffer = data;
            console.log("Content-Type:", contentType);
            console.log("Buffer length:", buffer.length);

            const tempDir = path.join(process.cwd(), 'temp');
            await fs.mkdir(tempDir, { recursive: true });

            let fileExtension = contentType.split('/')[1] || 'bin';
            if (contentType.includes('audio/aac') || contentType.includes('audio/x-m4p')) {
                fileExtension = 'm4a';
            }
            const filePath = path.join(tempDir, `get_${Date.now()}.${fileExtension}`);

            await fs.writeFile(filePath, buffer);
            console.log("File disimpan:", filePath);

            const getTimeMessage = () => {
                const durationMs = performance.now() - startTime;
                const seconds = durationMs / 1000;
                if (seconds < 1) return `${seconds.toFixed(2)} detik`;
                else if (seconds < 60) return `${seconds.toFixed(2)} detik`;
                else if (seconds < 3600) {
                    const minutes = Math.floor(seconds / 60);
                    const remainingSeconds = (seconds % 60).toFixed(2);
                    return `${minutes} menit ${remainingSeconds} detik`;
                } else {
                    const hours = Math.floor(seconds / 3600);
                    const remainingMinutes = Math.floor((seconds % 3600) / 60);
                    const remainingSeconds = (seconds % 60).toFixed(2);
                    return `${hours} jam ${remainingMinutes} menit ${remainingSeconds} detik`;
                }
            };

            const cleanup = async () => {
                try {
                    if (await fs.access(filePath).then(() => true).catch(() => false)) {
                        await fs.unlink(filePath);
                        console.log("File dihapus setelah 10 detik:", filePath);
                    }
                } catch (e) {
                    console.error("Gagal menghapus file sementara:", e);
                }
            };

            const sendMessageAndCleanup = async (messageOptions) => {
                try {
                    await fs.access(filePath);
                    console.log("Mengirim file:", filePath);
                    await naze.sendMessage(m.chat, messageOptions, { quoted: m });
                    console.log("File berhasil dikirim:", filePath);
                    setTimeout(cleanup, 10000);
                } catch (sendError) {
                    console.error("Gagal mengirim file:", sendError);
                    try {
                        await fs.access(filePath);
                        await naze.sendMessage(m.chat, {
                            document: { url: filePath },
                            mimetype: contentType,
                            fileName: `file_${Date.now()}.${fileExtension}`,
                            caption: `⏱ *Dikirim dalam:* \`${getTimeMessage()}\`\n\n📁 *File audio gagal dikirim sebagai audio, dikirim sebagai dokumen:* \n${url}\n`
                        }, { quoted: m });
                        console.log("File dikirim sebagai dokumen:", filePath);
                        setTimeout(cleanup, 10000);
                    } catch (docError) {
                        console.error("Gagal mengirim sebagai dokumen:", docError);
                        throw new Error(`Gagal mengirim file: ${util.format(docError)}`);
                    }
                }
            };

            if (/json|html|plain/.test(contentType)) {
                const textData = buffer.toString('utf8');
                return m.reply(
                    util.format(textData).replace(
                        new RegExp(ipData.ip.replace(/\./g, "\\."), "g"),
                        "xxx-xxx-xxx-xxx"
                    )
                );
            } else if (/audio/.test(contentType)) {
                const mimeType = contentType.includes('audio/x-m4p') ? 'audio/mp4' : contentType;
                await sendMessageAndCleanup({
                    audio: { url: filePath },
                    ptt: /ogg/.test(contentType),
                    mimetype: mimeType,
                    caption: `⏱ *Dikirim dalam:* \`${getTimeMessage()}\`\n\n🎵 *Audio dari URL:* \n${url}\n`
                });
            } else if (/image/.test(contentType)) {
                await sendMessageAndCleanup({
                    image: { url: filePath },
                    mimetype: contentType,
                    caption: `⏱ *Dikirim dalam:* \`${getTimeMessage()}\`\n\n✨ *Gambar dari URL:* \n${url}\n`
                });
            } else if (/video/.test(contentType)) {
                await sendMessageAndCleanup({
                    video: { url: filePath },
                    mimetype: contentType,
                    caption: `⏱ *Dikirim dalam:* \`${getTimeMessage()}\`\n\n🎥 *Video dari URL:* \n${url}\n`
                });
            } else if (/pdf/.test(contentType)) {
                await sendMessageAndCleanup({
                    document: { url: filePath },
                    mimetype: contentType,
                    fileName: `document_${Date.now()}.pdf`,
                    caption: `⏱ *Dikirim dalam:* \`${getTimeMessage()}\`\n\n📜 *Dokumen dari URL:* \n${url}\n`
                });
            } else {
                await sendMessageAndCleanup({
                    document: { url: filePath },
                    mimetype: contentType,
                    fileName: `file_${Date.now()}.${fileExtension}`,
                    caption: `⏱ *Dikirim dalam:* \`${getTimeMessage()}\`\n\n📁 *File dari URL:* \n${url}\n`
                });
            }

        } catch (e) {
            console.error("Kesalahan saat mengambil data:", e);
            if (e.response && e.response.data && typeof e.response.data === 'string' && e.response.data.includes('Cloudflare Ray ID')) {
                const rayMatch = e.response.data.match(/Cloudflare Ray ID: <strong[^>]*>([^<]+)<\/strong>/);
                const rayId = rayMatch ? rayMatch[1] : 'unknown';
                return m.reply(
                    `❌ Gagal mengambil data: Diblokir oleh Cloudflare (Ray ID: ${rayId})\n\n💡 Saran:\n1. Hubungi pemilik situs (${url.split('/')[2]}) untuk izin akses.\n2. Gunakan proxy residential (misalnya, BrightData atau Oxylabs).\n3. Pastikan dependensi Puppeteer terinstal di server:\n   sudo apt-get install -y libatk1.0-0 libatk-bridge2.0-0 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libasound2\n4. Coba lagi nanti.`
                );
            }
            try {
                const { data: ipData } = await axios.get("https://api.ipify.org?format=json");
                m.reply(
                    util.format(e).replace(
                        new RegExp(ipData.ip.replace(/\./g, "\\."), "g"),
                        "xxx-xxx-xxx-xxx"
                    )
                );
            } catch {
                m.reply(`❌ Gagal mengambil data: ${util.format(e)}\n\n💡 Saran: Install dependensi Puppeteer (sudo apt-get install -y libatk1.0-0 libatk-bridge2.0-0 libxkbcommon0) atau gunakan proxy residential.`);
            }
        }
    }
};