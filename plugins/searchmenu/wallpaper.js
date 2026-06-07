require('../../settings');
const axios = require('axios');
const cheerio = require('cheerio');
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = require('baileys');

async function wallpaper(title, page = '1') {
    try {
        const { data } = await axios.get(`https://www.besthdwallpaper.com/search?CurrentPage=${page}&q=${encodeURIComponent(title)}`);
        const $ = cheerio.load(data);
        const hasil = [];
        $('div.grid-item').each(function (a, b) {
            hasil.push({
                title: $(b).find('div.info > p').attr('title'),
                type: $(b).find('div.info > a:nth-child(2)').text(),
                source: 'https://www.besthdwallpaper.com' + $(b).find('a').attr('href'),
                image: [
                    $(b).find('picture > img').attr('data-src') || $(b).find('picture > img').attr('src'),
                    $(b).find('picture > source:nth-child(1)').attr('srcset'),
                    $(b).find('picture > source:nth-child(2)').attr('srcset')
                ]
            });
        });
        return hasil;
    } catch (e) {
        throw new Error(`Gagal mengambil wallpaper: ${e.message}`);
    }
}

module.exports = {
    name: 'wallpaper',
    alias: ['wp', 'wallpapers'],
    description: '<teks inggris>',
    run: async ({ naze, m, text }) => {
        try {
            
            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Masukkan kata kunci untuk pencarian wallpaper.\nContoh: ${m.prefix}${m.command} hu tao` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            const botNumber = await naze.decodeJid(naze.user.id);
            if (!global.db) global.db = {};
            if (!global.db.set) global.db.set = {};
            if (!global.db.set[botNumber]) global.db.set[botNumber] = {};
            if (!global.db.set[botNumber].setbutton) global.db.set[botNumber].setbutton = {};
            const useButton = global.db.set[botNumber].setbutton.wallpaper ?? false;

            const results = await wallpaper(text);
            if (results.length === 0) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Tidak ada wallpaper ditemukan untuk "${text}".` }, { quoted: m });
            }

            const wallpapers = results.slice(0, 10);
            let teks = `🔎 *Pencarian Wallpaper:*\n📌 Kata kunci: *${text}*\n🖼 *Menampilkan ${useButton ? wallpapers.length : 1} hasil terbaik!*\n\n`;

            const sendButtonMessage = async () => {
                const carouselCards = wallpapers.map((wp) => {
                    const thumbnailUrl = wp.image[0] || global.getRandomThumbnailUrl();
                    const imageUrl = wp.image[2] || wp.image[1] || wp.image[0];
                    const title = wp.title;
                    const type = wp.type;

                    return {
                        url: thumbnailUrl,
                        body: `🖼 *${title}*\n📂 Kategori: ${type}`,
                        footer: `Powered by ${global.botname}`,
                        buttons: [
                            {
                                name: 'cta_copy',
                                buttonParamsJson: JSON.stringify({
                                    display_text: '📋 Salin URL',
                                    copy_code: imageUrl
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
                const wp = wallpapers[0];
                const imageUrl = wp.image[2] || wp.image[1] || wp.image[0];
                const title = wp.title;
                const type = wp.type;
                const source = wp.source;

                teks += `🖼 *Judul*: ${title}\n📂 *Kategori*: ${type}\n🌐 *Sumber*: ${source}`;

                let mediaAttachment;
                try {
                    mediaAttachment = await prepareWAMessageMedia(
                        { image: { url: imageUrl } },
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
                                    buttons: [
                                        {
                                            name: 'cta_copy',
                                            buttonParamsJson: JSON.stringify({
                                                display_text: '📋 Salin URL',
                                                copy_code: imageUrl
                                            })
                                        }
                                    ]
                                })
                            })
                        }
                    }
                }, { quoted: m });

                await naze.relayMessage(m.chat, msg.message, {});
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