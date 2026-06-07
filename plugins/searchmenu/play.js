const path = require('path');
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = require('baileys');
const yts = require('yt-search');
const { generateCustomKeyId } = require(path.join(__dirname, '../../src/idcustom'));
require('../../settings');

module.exports = {
    name: 'ytplay',
    alias: ['play', 'youtubeplay', 'playyoutube', 'playyt', 'yts', 'ytsearch'],
    description: '<putar apa?>',
    run: async ({ naze, m, text }) => {
        try {
            
            

            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Contoh: ${m.prefix}${m.command} dandelions` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            const botNumber = await naze.decodeJid(naze.user.id);
            if (!global.db) global.db = {};
            if (!global.db.set) global.db.set = {};
            if (!global.db.set[botNumber]) global.db.set[botNumber] = {};
            if (!global.db.set[botNumber].setbutton) global.db.set[botNumber].setbutton = {};
            const useButton = global.db.set[botNumber].setbutton.play ?? false;

            const res = await yts.search(text);
            const videos = res.all.slice(0, 10);
            if (videos.length === 0) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Tidak ada hasil yang ditemukan.` }, { quoted: m });
            }

            let teks = `🔎 *Pencarian YouTube:*\n📌 Kata kunci: *${text}*\n📺 *Menampilkan ${videos.length} hasil terbaik!*\n\n`;

            const sendButtonMessage = async () => {
                teks += `⚡ Silakan pilih dari daftar di bawah ini untuk mengunduh!`;

                let sections = [];
                videos.forEach((video, index) => {
                    sections.push({
                        title: `🎬 ${video.title}`,
                        highlight_label: `⏳ Durasi: ${video.timestamp}`,
                        rows: [
                            { title: '🎵 Download MP3', description: 'Unduh sebagai audio 🎧', id: `ytmp3 ${video.url}` },
                            { title: '📹 Download MP4', description: 'Unduh sebagai video 🎥', id: `ytmp4 ${video.url}` }
                        ]
                    });
                });

                const bet = { title: '📜 Hasil Pencarian', sections };
                const thumbnailUrl = videos[0].thumbnail;

                let mediaAttachment;
                const customKeyId = generateCustomKeyId();
                try {
                    mediaAttachment = await prepareWAMessageMedia(
                        { image: { url: thumbnailUrl } },
                        { upload: naze.waUploadToServer }
                    );
                } catch {
                    mediaAttachment = await prepareWAMessageMedia(
                        { image: { url: global.getRandomThumbnailUrl() } },
                        { upload: naze.waUploadToServer }
                    );
                }

                let msg = generateWAMessageFromContent(m.chat, {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadata: {},
                                deviceListMetadataVersion: 2
                            },
                            interactiveMessage: proto.Message.InteractiveMessage.create({
                                contextInfo: {
                                    mentionedJid: [m.sender],
                                    forwardingScore: 999999,
                                    isForwarded: true
                                },
                                body: proto.Message.InteractiveMessage.Body.create({ text: teks }),
                                footer: proto.Message.InteractiveMessage.Footer.create({ text: `Powered by ${global.botname}` }),
                                header: proto.Message.InteractiveMessage.Header.create({
                                    title: '',
                                    subtitle: '',
                                    hasMediaAttachment: true,
                                    ...mediaAttachment
                                }),
                                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                    buttons: [{ name: 'single_select', buttonParamsJson: JSON.stringify(bet) }]
                                })
                            })
                        }
                    }
                }, { quoted: m });

                msg.key.id = customKeyId;
                await naze.relayMessage(msg.key.remoteJid, msg.message, { messageId: customKeyId });
            };

            const sendTextMessage = async () => {
    const carouselCards = videos.map((video, index) => {
        const thumbnailUrl = video.thumbnail || global.getRandomThumbnailUrl();
        const videoUrl = video.url;
        const title = video.title || 'Unknown Title';
        // FIX: Cek author dengan fallback biar ga crash
        const artist = video.author?.name || video.author?.url?.split('/channel/')[1] || 'Unknown Artist';
        const duration = video.timestamp || 'Unknown Duration';
        return {
            url: thumbnailUrl,
            body: `🎬 *${title}*\n🎤 Artist: ${artist}\n⏳ Durasi: ${duration}`,
            footer: `Powered by ${global.botname}`,
            buttons: [
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🎵 Salin Perintah MP3',
                        id: `.ytmp3 ${videoUrl}`,
                        copy_code: `.ytmp3 ${videoUrl}`
                    })
                },
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📹 Salin Perintah MP4',
                        id: `.ytmp4 ${videoUrl}`,
                        copy_code: `.ytmp4 ${videoUrl}`
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🔗 Lihat di YouTube',
                        url: videoUrl
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

            if (useButton) {
                await sendButtonMessage();
            } else {
                await sendTextMessage();
            }
            
        } catch (e) {
            console.error(`Fatal error di ytplay: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};