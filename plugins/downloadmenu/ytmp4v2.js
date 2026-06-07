require('../../settings');
const fetch = require('node-fetch');
const CryptoJS = require('crypto-js');

const mp3dl = {
    generateToken: () => {
        const payload = JSON.stringify({ timestamp: Date.now() });
        const key = 'dyhQjAtqAyTIf3PdsKcJ6nMX1suz8ksZ';
        const token = CryptoJS.AES.encrypt(payload, key).toString();
        return token;
    },

    download: async (youtubeUrl, quality = 360, format = 'mp4') => {
        const validFormats = ['mp3', 'mp4'];
        if (!validFormats.includes(format)) throw new Error(`Invalid format: ${format}. Available formats: ${validFormats.join(', ')}`);
        
        const headers = { 'content-type': 'application/json' };
        const body = JSON.stringify({
            url: youtubeUrl,
            quality: format === 'mp3' ? 128 : quality,
            token: mp3dl.generateToken()
        });
        
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Scraper timeout after 30 seconds')), 30000);
        });
        
        const fetchPromise = fetch('https://m1.ezsrv.net/api/downloadMP4', {
            headers,
            body,
            method: 'POST'
        }).then(async (response) => {
            if (!response.ok) throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
            const json = await response.json();
            if (global.debugMode) {
                console.log(`[YTMP4v2] Scraper 1 ${format.toUpperCase()}: status=${json.status || ''}, title=${json.title || ''}, url=${json.url ? 'available' : ''}, response=${JSON.stringify(json)}`);
            }
            if (json.status !== 'done' || !json.url) throw new Error(`Invalid response: ${JSON.stringify(json)}`);
            const id = youtubeUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2];
            return { url: json.url, title: json.title, videoId: id, format };
        });
        
        return Promise.race([fetchPromise, timeoutPromise]);
    }
};

module.exports = {
    name: 'ytmp4v2',
    alias: ['youtubemp4v2', 'ytmp4v2'],
    description: '<URL youtube>',
    run: async ({ naze, m, text }) => {
        const args = text.trim().split(' ');
        const youtubeUrl = args[0];
        const format = args[1]?.toLowerCase() || 'mp4';

        if (!youtubeUrl) {
            
            return m.reply(`Format salah! Gunakan perintah:\n\`${m.prefix}${m.command} <url youtube> [mp3/mp4]\``);
        }

        if (!youtubeUrl.includes('youtu')) {
            
            return m.reply('URL tidak berasal dari YouTube!');
        }

        const validFormats = ['mp3', 'mp4'];
        if (!validFormats.includes(format)) {
            
            return m.reply(`Format tidak valid! Pilih: ${validFormats.join(', ')}`);
        }

        let videoId;
        if (youtubeUrl.includes('youtube.com/watch?v=')) {
            const urlParams = new URLSearchParams(youtubeUrl.split('?')[1]);
            videoId = urlParams.get('v');
        } else if (youtubeUrl.includes('youtu.be/')) {
            videoId = youtubeUrl.split('youtu.be/')[1].split(/[\?&]/)[0];
        } else if (youtubeUrl.includes('youtube.com/shorts/')) {
            videoId = youtubeUrl.match(/https:\/\/www.youtube.com\/shorts\/(.*?)(?:\?|$)/)?.[1];
        }
        if (!videoId) {
            
            return m.reply('Gagal mengambil ID video dari URL!');
        }

        

        // Verifikasi thumbnail
        let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        try {
            const thumbResponse = await fetch(thumbnailUrl, { method: 'HEAD' });
            if (!thumbResponse.ok) throw new Error(`Thumbnail maxresdefault.jpg tidak dapat diakses: ${thumbResponse.status} ${thumbResponse.statusText}`);
            if (global.debugMode) {
                console.log(`[YTMP4v2] Thumbnail maxresdefault.jpg berhasil diakses untuk videoId=${videoId}`);
            }
        } catch (error) {
            console.error(`[YTMP4v2] Gagal mengakses thumbnail maxresdefault.jpg: ${error.message}`);
            thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            try {
                const thumbResponse = await fetch(thumbnailUrl, { method: 'HEAD' });
                if (!thumbResponse.ok) throw new Error(`Thumbnail hqdefault.jpg tidak dapat diakses: ${thumbResponse.status} ${thumbResponse.statusText}`);
                if (global.debugMode) {
                    console.log(`[YTMP4v2] Thumbnail hqdefault.jpg berhasil diakses untuk videoId=${videoId}`);
                }
            } catch (error) {
                console.error(`[YTMP4v2] Gagal mengakses thumbnail hqdefault.jpg: ${error.message}`);
                thumbnailUrl = global.thumbnailyoutube || 'https://i.ytimg.com/vi/default.jpg';
                if (global.debugMode) {
                    console.log(`[YTMP4v2] Menggunakan thumbnail fallback: ${thumbnailUrl}`);
                }
            }
        }

        // Jalankan scraper untuk MP4
        let mp4Result = null;
        let mp3Result = null;
        let responseMessage = `Scraper 1 (${format.toUpperCase()}):\n`;

        try {
            mp4Result = await mp3dl.download(youtubeUrl, 360, 'mp4');
            console.log(`[YTMP4v2] Scraper 1 berhasil: title=${mp4Result.title}, url=${mp4Result.url ? 'available' : ''}, format=mp4`);
            responseMessage += `- Status: Berhasil\n- Format: MP4\n- Judul: ${mp4Result.title}\n- URL: ${mp4Result.url}\n`;

            // Coba MP3 sebagai bonus jika format adalah mp4
            if (format === 'mp4') {
                try {
                    mp3Result = await mp3dl.download(youtubeUrl, 128, 'mp3');
                    console.log(`[YTMP4v2] Scraper 1 MP3 bonus berhasil: title=${mp3Result.title}, url=${mp3Result.url ? 'available' : ''}, format=mp3`);
                    responseMessage += `- Format: MP3 (bonus)\n- Judul: ${mp3Result.title}\n- URL: ${mp3Result.url}\n`;
                } catch (error) {
                    if (global.debugMode) {
                        console.log(`[YTMP4v2] Scraper 1 MP3 bonus gagal: ${error.message}`);
                    }
                    responseMessage += `- Format: MP3 (bonus)\n- Status: Gagal\n- Error: ${error.message}\n`;
                }
            }
        } catch (error) {
            console.error(`[YTMP4v2] Scraper 1 gagal: ${error.message}`);
            responseMessage += `- Status: Gagal\n- Error: ${error.message}`;
        }

        // Kirim respons ke pengguna
        await m.reply(responseMessage);

        // Kirim file jika ada hasil sukses
        if (mp4Result || mp3Result) {
            const result = mp4Result || mp3Result; // Prioritaskan MP4, fallback ke MP3
            const selectedFormat = mp4Result ? 'mp4' : 'mp3';
            const mimeType = selectedFormat === 'mp3' ? 'audio/mpeg' : 'video/mp4';
            const fileName = `${result.title}.${selectedFormat}`;
            const mediaType = selectedFormat === 'mp3' ? 'audio' : 'video';

            try {
                // Kirim sebagai audio/video
                await naze.sendMessage(m.chat, {
                    [mediaType]: { url: result.url },
                    mimetype: mimeType,
                    fileName: fileName,
                    contextInfo: {
                        externalAdReply: {
                            title: result.title,
                            body: `YouTube (via ezmp4.com)`,
                            previewType: 'PHOTO',
                            thumbnailUrl: thumbnailUrl,
                            mediaType: 1,
                            renderLargerThumbnail: true,
                            sourceUrl: youtubeUrl
                        }
                    }
                }, { quoted: m });

                // Kirim sebagai dokumen
                await naze.sendMessage(m.chat, {
                    document: { url: result.url },
                    mimetype: mimeType,
                    fileName: fileName,
                    contextInfo: {
                        externalAdReply: {
                            title: result.title,
                            body: `YouTube (via ezmp4.com)`,
                            previewType: 'PHOTO',
                            thumbnailUrl: thumbnailUrl,
                            mediaType: 1,
                            renderLargerThumbnail: true,
                            sourceUrl: youtubeUrl
                        }
                    }
                }, { quoted: m });

                
            } catch (error) {
                console.error(`[YTMP4v2] Error mengirim ${mediaType}:`, error);
                await global.sendMessageWithThumbnail(naze, m.chat, 'error', m);
                await m.reply(`Gagal mengirim ${mediaType}: Masalah koneksi atau URL tidak valid.`);
                try {
                    const geminiAnalysis = await global.analyzeErrorWithGemini(error.message, error.stack);
                    console.log(`Respon Gemini untuk fitur ${m.command}:\n${geminiAnalysis}`);
                    await naze.sendFromOwner(
                        global.owner,
                        `Halo BANGSULSTART, analisis error di fitur \`${m.command}\` dari Gemini:\n\n${geminiAnalysis}`,
                        m,
                        { contextInfo: { isForwarded: true } }
                    );
                } catch (geminiErr) {
                    console.error('[YTMP4v2] Kesalahan saat menganalisis dengan Gemini:', geminiErr);
                    await naze.sendFromOwner(
                        global.owner,
                        `Halo \`${global.ownername}\`, error di fitur:\n \`${m.command}\`\n\nPesan Error:\n${error.message}\n\nStack Trace:\n${error.stack}`,
                        m,
                        { contextInfo: { isForwarded: true } }
                    );
                }
            }
        } else {
            console.error('[YTMP4v2] Tidak ada hasil valid dari scraper');
            await global.sendMessageWithThumbnail(naze, m.chat, 'error', m);
            await m.reply('Gagal mengambil data: Scraper gagal.');
            try {
                const error = new Error('Scraper gagal menghasilkan hasil valid');
                const geminiAnalysis = await global.analyzeErrorWithGemini(error.message, error.stack);
                console.log(`Respon Gemini untuk fitur ${m.command}:\n${geminiAnalysis}`);
                await naze.sendFromOwner(
                    global.owner,
                    `Halo BANGSULSTART, analisis error di fitur \`${m.command}\` dari Gemini:\n\n${geminiAnalysis}`,
                    m,
                    { contextInfo: { isForwarded: true } }
                );
            } catch (geminiErr) {
                console.error('[YTMP4v2] Kesalahan saat menganalisis dengan Gemini:', geminiErr);
                await naze.sendFromOwner(
                    global.owner,
                    `Halo \`${global.ownername}\`, error di fitur:\n \`${m.command}\`\n\nPesan Error:\nScraper gagal menghasilkan hasil valid\n\nStack Trace:\n${geminiErr.stack}`,
                    m,
                    { contextInfo: { isForwarded: true } }
                );
            }
        }
    }
};