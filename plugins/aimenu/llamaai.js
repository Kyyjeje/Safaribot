const axios = require('axios');
const { globalSettings } = require('../../settings');

function fixDoubleAsterisks(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '*$1*');
}

module.exports = {
    name: 'llamaai',
    alias: ['llama-ai','llama','llamaai','aillama','ai-llama'],
    description: '<pertanyaan>',
    run: async ({ naze, m, text }) => {
        if (!text) {
            return m.reply(`Silakan masukkan pertanyaan!\n\nContoh: \n\`${m.prefix}${m.command} Apa itu AI?\``);
        }
        await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
        

        try {
            const response = await axios.get(`https://api.siputzx.my.id/api/ai/llama?prompt=You%20are%20an%20assistant%20that%20always%20responds%20in%20Indonesian%20with%20a%20friendly%20and%20informal%20tone&message=${encodeURIComponent(text)}`);
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