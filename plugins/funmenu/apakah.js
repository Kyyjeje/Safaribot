require('../../settings');
const axios = require('axios');

module.exports = {
    name: "apakah",
    run: async ({ naze, m, text }) => {
        if (!text) return m.reply("Contoh: apakah saya menang?");

        const tagRegex = /@(\d+)/;
        const taggedUser = text.match(tagRegex);
        let prompt;
        let cleanText = text;

        if (taggedUser) {
            cleanText = text.replace(tagRegex, '').trim();
            prompt = `haloo ai, ada yang nanya nih tentang orang lain: "apakah ${cleanText}" tolong jawab dengan gaya santai dan fun, kasih jawaban ya/tidak/mungkin secara random, tapi tambahin konteks yang relate sama pertanyaannya biar lebih hidup, pake bahasa indonesia yang natural dan gaul, semua huruf kecil, sebut orang itu sebagai "dia {taggedUser}", jangan pake {nama}, jangan kasih kalimat penutup kayak "semoga info ini membantu", dan jangan terlalu pendiam`;
        } else {
            prompt = `haloo ai, ada yang nanya nih: "apakah ${cleanText}" tolong jawab dengan gaya santai dan fun, kasih jawaban ya/tidak/mungkin secara random, tapi tambahin konteks yang relate sama pertanyaannya biar lebih hidup, pake bahasa indonesia yang natural dan gaul, semua huruf kecil, sebut orang itu sebagai "{nama}", jangan kasih kalimat penutup kayak "semoga info ini membantu", dan jangan terlalu pendiam`;
        }

        async function askOpenAI(inputPrompt) {
            try {
                const response = await axios.post("https://chateverywhere.app/api/chat/", {
                    model: {
                        id: "gpt-4",
                        name: "GPT-4",
                        maxLength: 32000,
                        tokenLimit: 8000,
                        completionTokenLimit: 5000,
                        deploymentName: "gpt-4"
                    },
                    messages: [
                        { pluginId: null, content: inputPrompt, role: "user" }
                    ],
                    prompt: "",
                    temperature: 0.5
                }, {
                    headers: {
                        "Accept": "/*/",
                        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
                    }
                });

                let result = response.data;
                return result.replace(/\*\*(.*?)\*\*/g, '*$1*');
            } catch (err) {
                const possibleAnswers = [
                    'iya nih 👍', 'enggak sih ❌', 'bisa jadi ya 🤔', 
                    'mungkin aja 🤷‍♂️', 'tanyain dukun aja 🧙‍♂️'
                ];
                const randomAnswer = possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)];
                return taggedUser 
                    ? `wkwk dia {taggedUser} ${randomAnswer} gitu deh` 
                    : `wkwk {nama} ${randomAnswer} gitu deh`;
            }
        }

        const aiResponse = await askOpenAI(prompt);
        let finalMessage;
        if (taggedUser) {
            const taggedNumber = taggedUser[1];
            finalMessage = aiResponse.replace(/{taggedUser}/g, `@${taggedNumber}`);
        } else {
            finalMessage = aiResponse.replace(/{nama}/g, `@${m.sender.split('@')[0]}`);
        }

        naze.sendMessage(m.chat, { 
            text: finalMessage, 
            mentions: taggedUser ? [`${taggedUser[1]}@s.whatsapp.net`] : [m.sender] 
        }, { quoted: m });
    }
};