const fetch = require('node-fetch');
const moment = require('moment-timezone');

module.exports = {
    name: 'memeprogramming',
    alias: ['programmingmeme', 'codingmeme', 'memecoding'],
    description: 'Menampilkan meme programming dalam format carousel',
    run: async ({ naze, m }) => {
        try {
            const url = 'https://programming-memes-images.p.rapidapi.com/v1/memes';
            const options = {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': '3acd58602amsh124292f1aa40177p1b4e8ejsnf363d93bb13f',
                    'x-rapidapi-host': 'programming-memes-images.p.rapidapi.com'
                }
            };

            // Send a "wait" message
            await naze.sendMessage(m.chat, { text: '⏳ Memuat meme programming...' }, { quoted: m });

            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`Gagal mengambil meme: ${response.statusText}`);
            }
            const result = await response.json();

            if (!Array.isArray(result) || result.length === 0) {
                throw new Error('Tidak ada meme yang tersedia dari API.');
            }

            // Use all available memes for the carousel
            const memes = result;

            const createdAt = moment().tz('Asia/Jakarta').format('DD MMMM YYYY');

            // Create carousel cards
            const carouselCards = memes.map((meme, index) => {
                const imageUrl = meme.image;
                const title = `Programming Meme ${index + 1}`;

                return {
                    url: imageUrl,
                    body: `😂 *${title}*\n📅 Dibuat: ${createdAt}`,
                    footer: 'Powered by Programming Memes API',
                    buttons: [
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: '🔗 Lihat Gambar',
                                url: imageUrl,
                            }),
                        },
                        {
                            name: 'cta_copy',
                            buttonParamsJson: JSON.stringify({
                                display_text: '📥 Salin URL Gambar',
                                id: imageUrl,
                                copy_code: imageUrl,
                            }),
                        },
                    ],
                };
            });

            // Send carousel message
            await naze.sendCarouselMsg(
                m.chat,
                'Koleksi Meme Programming',
                'Pilih meme yang kamu suka!',
                carouselCards,
                undefined,
                { quoted: m }
            );
        } catch (err) {
            console.error(`Fatal error di memeprogramming: ${err.message}\nStack: ${err.stack}`);
            await naze.sendMessage(m.chat, { text: `⚠️ Error: ${err.message}` }, { quoted: m });
        }
    }
};