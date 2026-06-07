const { createCanvas, loadImage, registerFont } = require('canvas');
const axios = require('axios');
const FormData = require('form-data');
const { fromBuffer } = require('file-type');
const crypto = require('crypto');
const fetch = require("node-fetch");
const yts = require('yt-search');
require('../../settings');

module.exports = {
    name: 'upmusic',
    alias: ['playmusic', 'playch', 'musicchanel', 'playchanel'],
    description: '<judul lagu>',
    run: async ({ naze, m, text }) => {
        try {
            if (!text) {
                return naze.sendMessage(m.chat, { text: `⚠️ Masukkan judul lagu atau artis.\nContoh: ${m.prefix}${m.command} dandelions` }, { quoted: m });
            }

            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            const res = await yts.search(text);
            const video = res.all[0];
            if (!video) {
                return naze.sendMessage(m.chat, { text: `⚠️ Tidak ada hasil yang ditemukan.` }, { quoted: m });
            }

            const url = video.url;
            if (!url.includes("youtu")) {
                return naze.sendMessage(m.chat, { text: `⚠️ URL tidak berasal dari YouTube!` }, { quoted: m });
            }

            let videoId;
            if (url.includes("youtube.com/watch?v=")) {
                const urlParams = new URLSearchParams(url.split('?')[1]);
                videoId = urlParams.get('v');
            } else if (url.includes("youtu.be/")) {
                videoId = url.split("youtu.be/")[1].split(/[\?&]/)[0];
            }
            if (!videoId) {
                return naze.sendMessage(m.chat, { text: `⚠️ Gagal mengambil ID video dari URL!` }, { quoted: m });
            }

            // API untuk mendapatkan progressId dengan rotasi kunci
            const apiUrl = `https://youtube-mp4-mp3-downloader.p.rapidapi.com/api/v1/download?format=mp3&id=${videoId}&audioQuality=128&addInfo=false`;
            let result;

            for (let i = 0; i < global.rapid_api.length; i++) {
                const options = {
                    method: 'GET',
                    headers: {
                        'x-rapidapi-key': global.rapid_api[i],
                        'x-rapidapi-host': 'youtube-mp4-mp3-downloader.p.rapidapi.com'
                    }
                };

                try {
                    const response = await fetch(apiUrl, options);
                    if (!response.ok) throw new Error(`Error HTTP! Status: ${response.status}`);
                    result = await response.json();
                    if (result.success && result.progressId) break;
                    throw new Error("Respons API tidak valid atau kunci limit tercapai");
                } catch (error) {
                    if (i === global.rapid_api.length - 1) {
                        return naze.sendMessage(m.chat, { text: `⚠️ Gagal mengambil data awal: Semua kunci API gagal. Error: ${error.message}` }, { quoted: m });
                    }
                }
            }

            const progressId = result.progressId;
            const title = result.title || `audio_${new Date().getTime()}`;
            let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

            try {
                const thumbResponse = await fetch(thumbnailUrl, { method: 'HEAD' });
                if (!thumbResponse.ok) thumbnailUrl = `${global.thumbnailyoutube || 'https://i.ytimg.com/vi/default.jpg'}`;
            } catch {
                thumbnailUrl = `${global.thumbnailyoutube || 'https://i.ytimg.com/vi/default.jpg'}`;
            }

            // Memeriksa progress dengan rotasi kunci
            const checkProgress = async () => {
                const progressUrl = `https://youtube-mp4-mp3-downloader.p.rapidapi.com/api/v1/progress?id=${progressId}`;
                let finished = false;
                let maxWaitTime = 300000; // Batas waktu maksimum 5 menit (300 detik)
                let startTime = Date.now();

                while (!finished && (Date.now() - startTime) < maxWaitTime) {
                    for (let i = 0; i < global.rapid_api.length; i++) {
                        const options = {
                            method: 'GET',
                            headers: {
                                'x-rapidapi-key': global.rapid_api[i],
                                'x-rapidapi-host': 'youtube-mp4-mp3-downloader.p.rapidapi.com'
                            }
                        };

                        try {
                            const progressResponse = await fetch(progressUrl, options);
                            if (!progressResponse.ok) throw new Error(`Error HTTP! Status: ${progressResponse.status}`);
                            const progressResult = await progressResponse.json();

                            if (progressResult.finished) {
                                finished = true;
                                const downloadUrl = progressResult.downloadUrl;
                                if (!downloadUrl) throw new Error("URL unduhan tidak ditemukan");

                                const audioResponse = await fetch(downloadUrl);
                                if (!audioResponse.ok) throw new Error("Gagal mengunduh audio dari URL");
                                const audioBuffer = await audioResponse.buffer();

                                const jid = global.chanel;
                                const teks = `🎧 *MUSIK TELAH DIUNGGAH KE CHANNEL*\n\n` +
                                             `🎵 *Judul*: ${video.title}\n` +
                                             `⏱️ *Durasi*: ${video.timestamp || 'Tidak diketahui'}\n` +
                                             `👤 *Channel*: ${video.author?.name || 'Tidak diketahui'}\n` +
                                             `🔗 *URL*: ${video.url}\n\n` +
                                             `━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                                             `✅ Musik *${title}* akan dikirim sebagai *voice note* berikutnya!`;

                                await naze.sendMessage(jid, {
                                    text: teks,
                                    contextInfo: {
                                        mentionedJid: [m.sender],
                                        forwardingScore: 1,
                                        isForwarded: true,
                                        forwardedNewsletterMessageInfo: {
                                            newsletterJid: global.chanelMusic,
                                            newsletterName: title
                                        },
                                        externalAdReply: {
                                            title: title,
                                            body: `YouTube (via RapidAPI)`,
                                            mediaType: 1,
                                            renderLargerThumbnail: false,
                                            thumbnailUrl: thumbnailUrl,
                                            sourceUrl: video.url
                                        }
                                    }
                                });

                                await naze.sendMessage(jid, {
                                    audio: audioBuffer,
                                    mimetype: "audio/mpeg",
                                    fileName: `${title}.mp3`,
                                    ptt: true
                                });

                                await naze.sendMessage(m.chat, {
                                    text: teks.replace("akan dikirim sebagai *voice note* berikutnya!", "berhasil diunggah dan dikirim sebagai *voice note*!"),
                                    contextInfo: {
                                        mentionedJid: [m.sender],
                                        forwardingScore: 1,
                                        isForwarded: true,
                                        forwardedNewsletterMessageInfo: {
                                            newsletterJid: global.chanelMusic,
                                            newsletterName: title
                                        },
                                        externalAdReply: {
                                            title: title,
                                            body: `YouTube (via RapidAPI)`,
                                            mediaType: 1,
                                            renderLargerThumbnail: false,
                                            thumbnailUrl: thumbnailUrl,
                                            sourceUrl: video.url
                                        }
                                    }
                                });
                                break;
                            }
                            break; // Keluar dari loop kunci jika berhasil
                        } catch (error) {
                            if (i === global.rapid_api.length - 1) {
                                finished = true;
                                await naze.sendMessage(m.chat, { text: `⚠️ Gagal memeriksa progress: Semua kunci API gagal. Error: ${error.message}` }, { quoted: m });
                                break;
                            }
                        }
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Cek setiap 1 detik
                }

                if (!finished) {
                    await naze.sendMessage(m.chat, { text: `⏳ Proses unduhan melebihi batas waktu 5 menit. Silakan coba lagi.` }, { quoted: m });
                }
            };

            await checkProgress();

        } catch (e) {
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};