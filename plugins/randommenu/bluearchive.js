const axios = require('axios');

module.exports = {
    name: 'bluearchive',
    alias: ['bluearc'],
    run: async ({ naze, m }) => {
        

        try {
            const config = {
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Accept": "image/*",
                    "Authorization": "Bearer alif_64d5307e-9a02-4e5d-8d53-9ac2a15f0186"
                },
                params: {},
                responseType: "arraybuffer"
            };

            const response = await axios.get("https://fastapi2.alifproject.cloud/api/random/bluearchive", config);
            const imageBuffer = Buffer.from(response.data);

            await naze.sendMessage(m.chat, { image: imageBuffer, caption: 'Random Blue Archive Image' }, { quoted: m });
        } catch (e) {
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};