require('../../settings');
const axios = require('axios');
const cheerio = require('cheerio');

async function ringtone(title) {
    try {
        const { data } = await axios.get(`https://meloboom.com/en/search/${title}`);
        const $ = cheerio.load(data);
        const hasil = [];
        $('#__next > main > section > div.jsx-2244708474.container > div > div > div > div:nth-child(4) > div > div > div > ul > li').each(function (a, b) {
            hasil.push({
                title: $(b).find('h4').text(),
                source: `https://meloboom.com/${$(b).find('a').attr('href')}`,
                audio: $(b).find('audio').attr('src')
            });
        });
        return hasil;
    } catch (e) {
        throw e;
    }
}

module.exports = {
    name: 'ringtone',
    alias: ['tone', 'melotone'],
    description: '<nama ringtone>',
    run: async ({ naze, m, args, text }) => {
        try {
            
            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Contoh: ${m.prefix}${m.command} black rover` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            const anu = await ringtone(text);
            const result = anu[Math.floor(Math.random() * anu.length)];

            await naze.sendMessage(m.chat, { 
                audio: { url: result.audio }, 
                fileName: `${result.title}.mp3`, 
                mimetype: 'audio/mpeg' 
            }, { quoted: m });
            
        } catch (e) {
            console.error(`Fatal error di ringtone: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};