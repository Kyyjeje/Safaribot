const moment = require('moment-timezone');
require('../../settings');

async function scrapePinterestImages(searchQuery, maxImages = Infinity) {
    try {
        if (!searchQuery) {
            throw new Error('Masukkan kata kunci pencarian');
        }

        const data_url = {
            options: {
                query: searchQuery,
            },
        };

        const url = `https://www.pinterest.com/resource/BaseSearchResource/get?data=${encodeURIComponent(JSON.stringify(data_url))}`;
        const headers = {
            'x-pinterest-pws-handler': 'www/search/[scope].js',
        };

        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const jsonData = await response.json();
        const results = jsonData.resource_response.data.results
            .map(v => ({
                imageUrl: v.images?.orig?.url || '',
                pinUrl: `https://www.pinterest.com/pin/${v.id}`,
            }))
            .filter(item => item.imageUrl && item.imageUrl.includes('i.pinimg.com'));

        if (results.length === 0) {
            throw new Error(`Hasil pencarian untuk "${searchQuery}" tidak ditemukan.`);
        }

        return results.slice(0, maxImages);
    } catch (e) {
        throw e;
    }
}

async function scrapePinterestPin(pinUrl) {
    try {
        const pinIdMatch = pinUrl.match(/pin\/(\d+)/);
        if (!pinIdMatch) {
            throw new Error('URL Pinterest tidak valid');
        }
        const pinId = pinIdMatch[1];

        const data_url = {
            options: {
                field_set_key: 'unauth_react',
                pin_id: pinId,
            },
        };

        const url = `https://www.pinterest.com/resource/PinResource/get?data=${encodeURIComponent(JSON.stringify(data_url))}`;
        const headers = {
            'x-pinterest-pws-handler': 'www/pin/[pinId].js',
        };

        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const jsonData = await response.json();
        const pinData = jsonData.resource_response.data;
        if (!pinData || !pinData.images?.orig?.url) {
            throw new Error('Gambar tidak ditemukan di URL pin');
        }

        return {
            imageUrl: pinData.images.orig.url,
            pinUrl: `https://www.pinterest.com/pin/${pinId}`,
        };
    } catch (e) {
        throw e;
    }
}

module.exports = {
    name: 'pinterest',
    alias: ['pin', 'pint'],
    description: '<teks>',
    run: async ({ naze, m }) => {
        try {
            
            

            const body = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
            const args = body.trim().split(/ +/).slice(1);
            const input = args.join(' ');

            if (!input) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Masukkan kata kunci pencarian atau URL Pinterest!\nContoh:\n- ${m.prefix}${m.command} kucing\n- ${m.prefix}${m.command} <URL>` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            if (input.includes('i.pinimg.com')) {
                await naze.sendMessage(m.chat, {
                    image: { url: input },
                    caption: '📌 *Pinterest Direct Image*'
                }, { quoted: m });
                
                return;
            }

            const botNumber = await naze.decodeJid(naze.user.id);
            if (!global.db) global.db = {};
            if (!global.db.set) global.db.set = {};
            if (!global.db.set[botNumber]) global.db.set[botNumber] = {};
            if (!global.db.set[botNumber].setbutton) global.db.set[botNumber].setbutton = {};
            const useButton = global.db.set[botNumber].setbutton.pinterest ?? false;

            const createButtons = (pinterestUrl, mediaUrl) => [
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🔗 Lihat di Pinterest',
                        url: pinterestUrl,
                    }),
                },
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📋 Salin URL Pinterest',
                        id: pinterestUrl,
                        copy_code: pinterestUrl,
                    }),
                },
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📥 Salin URL Download',
                        id: mediaUrl,
                        copy_code: mediaUrl,
                    }),
                },
            ];

            const pinterestPinPattern = /^https:\/\/(www\.)?pinterest\.[a-z]+\/pin\/\d+|https:\/\/pin\.it\/[a-zA-Z0-9]+/;
            if (pinterestPinPattern.test(input)) {
                const data = await scrapePinterestPin(input);
                if (!data || !data.imageUrl) {
                    
                    return naze.sendMessage(m.chat, { text: `⚠️ Gagal mengunduh media dari Pinterest.` }, { quoted: m });
                }

                const mediaUrl = data.imageUrl;
                const createdAt = moment().tz('Asia/Jakarta').format('DD MMMM YYYY');

                if (useButton) {
                    await naze.sendMessage(m.chat, {
                        image: { url: mediaUrl },
                        caption: `📌 *Pinterest Download*\n📅 Dibuat: ${createdAt}`,
                        title: 'Media dari Pinterest',
                        footer: 'Powered by Pinterest Scraper',
                        interactiveButtons: createButtons(input, mediaUrl),
                    }, { quoted: m });
                } else {
                    await naze.sendMessage(m.chat, {
                        image: { url: mediaUrl },
                        caption: `📌 *Pinterest Download*\n📅 Dibuat: ${createdAt}\n🔗 URL Pinterest: ${input}\n📥 URL Download: ${mediaUrl}`,
                    }, { quoted: m });
                }
                
            } else {
                const maxImages = useButton ? 5 : Infinity;
                const results = await scrapePinterestImages(input, maxImages);
                if (results.length === 0) {
                    
                    return naze.sendMessage(m.chat, { text: `⚠️ Tidak ditemukan hasil untuk pencarian tersebut.` }, { quoted: m });
                }

                const createdAt = moment().tz('Asia/Jakarta').format('DD MMMM YYYY');

                if (useButton) {
                    const carouselCards = results.map((result, index) => {
                        const imageUrl = result.imageUrl;
                        const pinterestUrl = result.pinUrl;
                        const title = `Pinterest Result ${index + 1}`;

                        return {
                            url: imageUrl,
                            body: `📌 *${title}*\n📅 Dibuat: ${createdAt}`,
                            footer: 'Powered by Pinterest Scraper',
                            buttons: createButtons(pinterestUrl, imageUrl),
                        };
                    });

                    await naze.sendCarouselMsg(
                        m.chat,
                        'Hasil Pencarian Pinterest',
                        'Pilih gambar yang Anda inginkan',
                        carouselCards,
                        undefined,
                        { quoted: m }
                    );
                } else {
                    const result = results[Math.floor(Math.random() * results.length)];
                    const imageUrl = result.imageUrl;
                    const pinterestUrl = result.pinUrl;
                    const title = 'Pinterest Result';

                    await naze.sendMessage(m.chat, {
                        image: { url: imageUrl },
                        caption: `📌 *${title}*\n📅 Dibuat: ${createdAt}\n🔗 URL Pinterest: ${pinterestUrl}\n📥 URL Download: ${imageUrl}`,
                    }, { quoted: m });
                }
                
            }
        } catch (e) {
            console.error(`Fatal error di pinterest: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};