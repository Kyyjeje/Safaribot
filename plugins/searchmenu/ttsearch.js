require('../../settings');
const axios = require('axios');
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = require('baileys');

const isUrl = (str) => /^(https?:\/\/[^\s]+)/.exec(str)?.[0] || null;

const shortenUrl = async (url) => {
    try {
        const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, { timeout: 10000 });
        return response.data;
    } catch {
        return url;
    }
};

const shortenUrlsInJson = async (obj) => {
    const result = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            result[key] = (typeof value === 'string' && isUrl(value)) ? await shortenUrl(value) : 
                          (typeof value === 'object' && value !== null) ? await shortenUrlsInJson(value) : value;
        }
    }
    return result;
};

const fetchWithApiKey = async (keyword, apiKey) => {
    const url = `https://tiktok-scraper7.p.rapidapi.com/feed/search?keywords=${encodeURIComponent(keyword)}®ion=id&count=10&cursor=0&publish_time=0&sort_type=0`;
    const options = {
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': 'tiktok-scraper7.p.rapidapi.com'
        }
    };
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    try {
        const response = await axios.get(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        if (response.status !== 200) throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await shortenUrlsInJson(response.data);
        return result;
    } catch (e) {
        clearTimeout(timeoutId);
        throw e;
    }
};

module.exports = {
    name: 'tiktoksearch',
    alias: ['tiktoksearch', 'ttsearch'],
    description: '<cari apa?>',
    run: async ({ naze, m, text }) => {
        try {
            
            
            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Masukkan kata kunci untuk pencarian TikTok.\nContoh: ${m.prefix}${m.command} dance` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            const botNumber = await naze.decodeJid(naze.user.id);
            if (!global.db) global.db = {};
            if (!global.db.set) global.db.set = {};
            if (!global.db.set[botNumber]) global.db.set[botNumber] = {};
            if (!global.db.set[botNumber].setbutton) global.db.set[botNumber].setbutton = {};
            const useButton = global.db.set[botNumber].setbutton.tiktoksearch ?? false;

            let data;
            for (const apiKey of global.rapid_api) {
                try {
                    data = await fetchWithApiKey(text, apiKey);
                    break;
                } catch (e) {
                    continue;
                }
            }

            if (!data || !data.data || !data.data.videos || data.data.videos.length === 0) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Tidak ada hasil yang ditemukan untuk "${text}".` }, { quoted: m });
            }

            const videos = data.data.videos.slice(0, 10);
            let teks = `🔎 *Pencarian TikTok:*\n📌 Kata kunci: *${text}*\n🎥 *Menampilkan ${videos.length} hasil terbaik!*\n\n`;

            const sendButtonMessage = async () => {
                const carouselCards = videos.map((video) => {
                    const thumbnailUrl = video.cover || global.getRandomThumbnailUrl();
                    const downloadUrl = video.play || video.music?.play_url || (video.images && video.images[0]) || '';
                    const title = video.title;
                    const author = video.author.nickname;
                    const duration = video.duration;

                    return {
                        url: thumbnailUrl,
                        body: `🎬 *${title}*\n👤 Author: ${author}\n⏳ Durasi: ${duration} detik`,
                        footer: `Powered by ${global.botname}`,
                        buttons: [
                            {
                                name: 'cta_copy',
                                buttonParamsJson: JSON.stringify({
                                    display_text: '📋 Salin URL',
                                    copy_code: downloadUrl
                                })
                            }
                        ]
                    };
                });

                await naze.sendCarouselMsg(
                    m.chat,
                    teks,
                    'Geser untuk melihat hasil lainnya',
                    carouselCards,
                    undefined,
                    { quoted: m }
                );
            };

            const sendTextMessage = async () => {
                const video = videos[0];
                const title = video.title;
                const author = video.author.nickname;
                const duration = video.duration;
                const caption = `🎬 *${title}*\n👤 Author: ${author}\n⏳ Durasi: ${duration} detik`;

                if (video.images && video.images.length > 1) {
                    const carouselCards = video.images.map((image, index) => ({
                        url: image,
                        body: `🖼 Gambar ${index + 1} dari ${title}\n👤 Author: ${author}`,
                        footer: `Powered by ${global.botname}`,
                        buttons: [
                            {
                                name: 'cta_copy',
                                buttonParamsJson: JSON.stringify({
                                    display_text: '📋 Salin URL',
                                    copy_code: image
                                })
                            }
                        ]
                    }));

                    await naze.sendCarouselMsg(
                        m.chat,
                        teks,
                        'Geser untuk melihat gambar lainnya',
                        carouselCards,
                        undefined,
                        { quoted: m }
                    );
                } else if (video.music?.play_url) {
                    await naze.sendMessage(m.chat, {
                        audio: { url: video.music.play_url },
                        mimetype: 'audio/mpeg',
                        caption: caption
                    }, { quoted: m });
                } else if (video.play) {
                    await naze.sendMessage(m.chat, {
                        video: { url: video.play },
                        caption: caption
                    }, { quoted: m });
                } else {
                    await naze.sendMessage(m.chat, { text: `⚠️ Media tidak dapat dikirim untuk "${text}".` }, { quoted: m });
                }
            };

            if (useButton) {
                await sendButtonMessage();
            } else {
                await sendTextMessage();
            }

            const jsonBuffer = Buffer.from(JSON.stringify(data, null, 2));
            await naze.sendMessage(m.chat, {
                document: jsonBuffer,
                mimetype: 'application/json',
                fileName: `tiktok_search_${text.replace(/\s+/g, '_')}.json`,
                caption: `📄 Data lengkap pencarian TikTok untuk "${text}"`
            }, { quoted: m });

            
        } catch (e) {
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};