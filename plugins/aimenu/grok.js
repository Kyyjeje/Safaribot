const fetch = require('node-fetch');

module.exports = {
    name: 'grok',
    alias: ['xai', 'grokai', 'grk'],
    description: '<pertanyaan>',
    run: async ({ naze, m, text }) => {
        const inputText = text || (m.quoted?.text || '');

        if (!inputText.trim()) {
            if (m.quoted) {
                return m.reply('Maaf, pesan yang di-reply tidak berisi teks.\nGunakan `.grok <pertanyaan>` ya!');
            }
            return m.reply('Halo! Saya Grok, dibuat oleh xAI.\nKetik `.grok <pertanyaan>` untuk bertanya apa saja.');
        }

        // Mulai typing
        await naze.sendPresenceUpdate('composing', m.chat);

        try {
            const url = 'https://xai-all-models.p.rapidapi.com/chat/completions';
            const keys = global.rapid_api || [];

            if (!Array.isArray(keys) || keys.length === 0) {
                return m.reply('Error: API Key RapidAPI (grok) belum disetting!');
            }

            let jawaban = null;

            for (const key of keys) {
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'x-rapidapi-key': key.trim(),
                            'x-rapidapi-host': 'xai-all-models.p.rapidapi.com',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: 'grok-beta',
                            messages: [{ role: 'user', content: inputText.trim() }],
                            temperature: 0.7
                        })
                    });

                    if (!response.ok) continue;

                    const result = await response.json();

                    if (result.choices?.[0]?.message?.content) {
                        jawaban = result.choices[0].message.content.trim();
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!jawaban) {
                return m.reply('Grok lagi sibuk atau semua API key limit. Coba lagi beberapa menit ya!');
            }

            await naze.sendMessage(m.chat, {
                text: jawaban,
                contextInfo: {
                    externalAdReply: {
                        title: 'Grok by xAI',
                        body: 'Jawaban langsung dari Grok',
                        thumbnailUrl: global.thumbnailgrok || 'https://i.ibb.co.com/0jZ6v0X/grok.jpg',
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        sourceUrl: 'https://x.ai'
                    }
                }
            }, { quoted: m });

        } catch (err) {
            console.error('Grok Error:', err);
            await m.reply(`Grok error:\n\`${err.message || 'Unknown error'}\``);
        } finally {
            naze.sendPresenceUpdate('available', m.chat);
        }
    }
};