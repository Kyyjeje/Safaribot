require('../../settings');
const axios = require('axios');

module.exports = {
    name: "kapan",
    alias: ["kapankah"],
    run: async ({ naze, m, text }) => {
        if (!text) return m.reply(`Contoh: \n\`${m.prefix + m.command} saya menang?\``);

        const tagRegex = /@(\d+)/;
        const taggedUser = text.match(tagRegex);
        let prompt;
        let cleanText = text; 

        if (taggedUser) {
            cleanText = text.replace(tagRegex, '').trim();
            prompt = `haloo ai, ada seseorang bertanya tentang user lain: "${cleanText}" nah tolong jawab kapan hal itu mungkin terjadi untuk user tersebut, tapi kalau nggak masuk akal atau mustahil (seperti beli planet atau jadi alien), kasih tanggapan logis dan lucu, misalnya bilang kenapa nggak mungkin, apa yang perlu dilakukan, atau bercanda soal duit/roket, pake waktu random (detik, menit, jam, hari, minggu, bulan, tahun) kalau realistis, pake bahasa indonesia natural dan gaul, huruf kecil semua, sebut user sebagai "dia {taggedUser}", jangan pake {nama}, jangan kasih penutup formal`;
        } else {
            prompt = `haloo ai, ada seseorang bernama {nama} bertanya: "${cleanText}" nah tolong jawab kapan hal itu mungkin terjadi, tapi kalau nggak masuk akal atau mustahil (seperti beli planet atau jadi alien), kasih tanggapan logis dan lucu, misalnya bilang kenapa nggak mungkin, apa yang perlu dilakukan, atau bercanda soal duit/roket, pake waktu random (detik, menit, jam, hari, minggu, bulan, tahun) kalau realistis, pake bahasa indonesia natural dan gaul, huruf kecil semua, pake {nama}, jangan kasih penutup formal`;
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
                const timeUnits = ["detik", "menit", "jam", "hari", "minggu", "bulan", "tahun"];
                const randomTime = Math.floor(Math.random() * 60) + 1;
                const chosenUnit = timeUnits[Math.floor(Math.random() * timeUnits.length)];
                return taggedUser 
                    ? `wkwk dia {taggedUser} kayanya ${randomTime} ${chosenUnit} lagi nih!` 
                    : `wkwk {nama} kayanya ${randomTime} ${chosenUnit} lagi nih!`;
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