const axios = require('axios');
const { globalSettings } = require('../../settings');

function fixDoubleAsterisks(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '*$1*');
}

module.exports = {
    name: 'luminai',
    alias: ['luminai'],
    description: '<pertanyaan>',
    run: async ({ naze, m, text }) => {
        if (!text) {
            return m.reply('Silakan masukkan pertanyaan!\n\nContoh: `.luminai Apa itu AI?`');
        }
        await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
        

        try {
            const response = await axios.get(`https://api.siputzx.my.id/api/ai/luminai?content=${encodeURIComponent(text)}`);
            const data = response.data;

            if (!data.status) {
                throw new Error('API tidak mengembalikan data yang valid.');
            }

            await m.reply(fixDoubleAsterisks(data.data));
        } catch (err) {
            await global.handleError(naze, m, err, {
                sendRawError: true,
                useGemini: true
            });
        }
    }
};