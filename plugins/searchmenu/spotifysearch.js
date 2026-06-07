require('../../settings');
const axios = require('axios');
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = require('baileys');

module.exports = {
    name: 'spotify',
    alias: ['spotifys', 'spsearch', 'spotifysearch'],
    description: '<judul lagu>',
    run: async ({ naze, m, text }) => {
        try {
            
            

            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Masukkan judul lagu atau artis untuk pencarian.\nContoh: ${m.prefix}${m.command} Serana` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            const botNumber = await naze.decodeJid(naze.user.id);
            if (!global.db) global.db = {};
            if (!global.db.set) global.db.set = {};
            if (!global.db.set[botNumber]) global.db.set[botNumber] = {};
            if (!global.db.set[botNumber].setbutton) global.db.set[botNumber].setbutton = {};
            const useButton = global.db.set[botNumber].setbutton.spotify ?? false;

            const { data } = await axios.get(`https://api.siputzx.my.id/api/s/spotify?query=${encodeURIComponent(text)}`);
            if (!data.status || !Array.isArray(data.data) || data.data.length === 0) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Tidak ada hasil yang ditemukan untuk "${text}".` }, { quoted: m });
            }

            const tracks = data.data.slice(0, 10);
            let teks = `🔎 *Pencarian Spotify:*\n📌 Kata kunci: *${text}*\n🎵 *Menampilkan ${tracks.length} hasil terbaik!*\n\n`;

            const sendButtonMessage = async () => {
                teks += `⚡ Silakan pilih lagu untuk mengunduh!`;

                let sections = [];
                tracks.forEach((track) => {
                    sections.push({
                        title: `🎵 ${track.title}`,
                        highlight_label: `⏳ ${track.duration}`,
                        rows: [
                            { title: '⬇️ Unduh Lagu', description: `Artis: ${track.artist}`, id: `spotifydl ${track.track_url}` }
                        ]
                    });
                });

                const bet = { title: '📜 Hasil Pencarian Spotify', sections };
                const thumbnailUrl = tracks[0].thumbnail;

                let mediaAttachment;
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

                await naze.relayMessage(m.chat, msg.message, {});
            };

            const sendTextMessage = async () => {
                const carouselCards = tracks.map((track) => {
                    const thumbnailUrl = track.thumbnail || global.getRandomThumbnailUrl();
                    const trackUrl = track.track_url;
                    const title = track.title;
                    const artist = track.artist;
                    const duration = track.duration;
                    const album = track.album;

                    return {
                        url: thumbnailUrl,
                        body: `🎵 *${title}*\n👤 Artis: ${artist}\n💿 Album: ${album}\n⏳ Durasi: ${duration}`,
                        footer: `Powered by ${global.botname}`,
                        buttons: [
                            {
                                name: 'cta_url',
                                buttonParamsJson: JSON.stringify({
                                    display_text: '🔗 Lihat di Spotify',
                                    url: trackUrl
                                })
                            },
                            {
                                name: 'cta_copy',
                                buttonParamsJson: JSON.stringify({
                                    display_text: '📋 Salin Teks Unduh',
                                    copy_code: `spotifydl ${trackUrl}`
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
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};