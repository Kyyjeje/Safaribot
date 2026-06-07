require('../../settings');
const axios = require('axios');

module.exports = {
    name: 'emojimix',
    alias: ['mixemoji'],
    description: '<emoji> + <emoji>',
    run: async ({ naze, m, args, text }) => {
        try {
            

            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Masukkan dua emoji dengan atau tanpa tanda +!\nContoh: ${m.prefix}${m.command} 😅+🤔 atau ${m.prefix}${m.command} 😅🤔` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            let emoji1, emoji2;
            if (text.includes('+')) {
                [emoji1, emoji2] = text.split('+').map(e => e.trim());
            } else {
                const emojis = text.match(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu);
                if (!emojis || emojis.length !== 2) {
                    
                    return naze.sendMessage(m.chat, { text: `⚠️ Masukkan tepat dua emoji!\nContoh: ${m.prefix}${m.command} 😅+🤔 atau ${m.prefix}${m.command} 😅🤔` }, { quoted: m });
                }
                [emoji1, emoji2] = emojis;
            }

            if (!emoji1 || !emoji2) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Masukkan tepat dua emoji!\nContoh: ${m.prefix}${m.command} 😅+🤔 atau ${m.prefix}${m.command} 😅🤔` }, { quoted: m });
            }

            const response = await axios.get(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`);
            if (response.data.results.length < 1) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Mix Emoji ${text} tidak ditemukan!` }, { quoted: m });
            }

            for (let res of response.data.results) {
                await naze.sendAsSticker(m.chat, res.url, m, { packname: packname, author: author });
            }
            
        } catch (e) {
            console.error(`Fatal error di emojimix: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};