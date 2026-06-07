const moment = require('moment-timezone');
require('../../settings');

async function fetchNetflixTrending() {
    const religion = ['/id', '/id-en'];
    const netflixUrl = 'https://www.netflix.com' + religion[0];

    try {
        const response = await fetch(netflixUrl);
        if (!response.ok) {
            throw new Error(`Request gagal: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        const jsonString = html.match(/reactContext = (.*?);/)?.[1];
        if (!jsonString) {
            throw new Error('Tidak menemukan data pada Netflix');
        }

        const cleaned = jsonString.replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) =>
            String.fromCharCode(parseInt(hex, 16))
        );

        const json = JSON.parse(cleaned);
        const movieAndShow = Object.entries(json.models.graphql.data).filter(
            (v) => !v?.[1]?.__typename.match(/Genre|Query/)
        );

        const result = movieAndShow.map(([_, v]) => ({
            title: v.title,
            latestYear: v.latestYear,
            videoId: v.videoId,
            shortSynopsis: v.shortSynopsis,
            contentAdvisory: v.contentAdvisory.certificationValue,
            genre: v.coreGenres.edges
                .map((v) => json.models.graphql.data[v.node.__ref].name)
                .join(', '),
            type: v.__typename,
            url: netflixUrl + '/title/' + v.videoId,
            poster: v[
                'artwork({"params":{"artworkType":"BOXSHOT","dimension":{"width":200},"features":{"performNewContentCheck":false,"suppressTop10Badge":true},"format":"JPG"}})'
            ].url,
        }));

        return result.slice(0, 5);
    } catch (e) {
        throw e;
    }
}

module.exports = {
    name: 'trending-netflix',
    alias: ['netflix', 'trendingnetflix'],
    run: async ({ naze, m }) => {
        try {
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            const botNumber = await naze.decodeJid(naze.user.id);
            if (!global.db) global.db = {};
            if (!global.db.set) global.db.set = {};
            if (!global.db.set[botNumber]) global.db.set[botNumber] = {};
            if (!global.db.set[botNumber].setbutton) global.db.set[botNumber].setbutton = {};
            const useButton = global.db.set[botNumber].setbutton.netflix ?? true;

            const results = await fetchNetflixTrending();
            if (results.length === 0) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Tidak ditemukan data trending Netflix saat ini.` }, { quoted: m });
            }

            const createdAt = moment().tz('Asia/Jakarta').format('DD MMMM YYYY');

            const createButtons = (netflixUrl) => [
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🔗 Tonton di Netflix',
                        url: netflixUrl,
                    }),
                },
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📋 Salin URL Netflix',
                        id: netflixUrl,
                        copy_code: netflixUrl,
                    }),
                },
            ];

            if (useButton) {
                const carouselCards = results.map((result, index) => {
                    const posterUrl = result.poster;
                    const netflixUrl = result.url;
                    const title = result.title;
                    const caption = `📌 *${title}* (${result.latestYear})\n🎥 Tipe: ${result.type}\n📅 Dibuat: ${createdAt}\n📖 Sinopsis: ${result.shortSynopsis}\n🎭 Genre: ${result.genre}\n🔞 Rating: ${result.contentAdvisory}`;

                    return {
                        url: posterUrl,
                        body: caption,
                        footer: 'Powered by Netflix Scraper',
                        buttons: createButtons(netflixUrl),
                    };
                });

                await naze.sendCarouselMsg(
                    m.chat,
                    'Trending di Netflix',
                    'Pilih film atau acara yang Anda inginkan',
                    carouselCards,
                    undefined,
                    { quoted: m }
                );
            } else {
                const result = results[Math.floor(Math.random() * results.length)];
                const posterUrl = result.poster;
                const netflixUrl = result.url;
                const title = result.title;
                const caption = `📌 *${title}* (${result.latestYear})\n🎥 Tipe: ${result.type}\n📅 Dibuat: ${createdAt}\n📖 Sinopsis: ${result.shortSynopsis}\n🎭 Genre: ${result.genre}\n🔞 Rating: ${result.contentAdvisory}\n🔗 URL Netflix: ${netflixUrl}\n📥 URL Poster: ${posterUrl}`;

                await naze.sendMessage(m.chat, {
                    image: { url: posterUrl },
                    caption: caption,
                }, { quoted: m });
            }
            
        } catch (e) {
            console.error(`Fatal error di trending-netflix: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};