require('../../settings');
const axios = require('axios');

module.exports = {
    name: 'imggenerator',
    alias: ['imagegenerator', 'imggenerate', 'imagegen'],
    description: '<prompt>,<model>,<style>',
    run: async ({ naze, m, text }) => {
        try {
            if (!text) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Image Generator:*\n` +
                              `  Perintah: \n\`${m.prefix}${m.command} <prompt>,<model>,<style>\`\n` +
                              `  Model: 1, 2, 3\n` +
                              `  Style: 1, 2, 3, 4, 5, 6, 7, 8, 9\n` +
                              `  Contoh: \n\`${m.prefix}imggenerator car fly,2,4\``);
            }

            const [prompt, modelId, styleId] = text.split(',').map(item => item.trim());
            const validModels = ['1', '2', '3'];
            const validStyles = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
            if (!prompt || !modelId || !styleId || !validModels.includes(modelId) || !validStyles.includes(styleId)) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Image Generator:*\n` +
                              `  Perintah: \n\`${m.prefix}${m.command} <prompt>,<model>,<style>\`\n` +
                              `  Model: 1, 2, 3\n` +
                              `  Style: 1, 2, 3, 4, 5, 6, 7, 8, 9\n` +
                              `  Contoh: \n\`${m.prefix}imggenerator car fly,2,4\``);
            }

            
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
            await new Promise(resolve => setTimeout(resolve, 500));
            

            const response = await axios.get('https://fastapi2.alifproject.cloud/api/ai/imagev2', {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'image/*',
                    'Authorization': 'Bearer alif_64d5307e-9a02-4e5d-8d53-9ac2a15f0186'
                },
                params: { prompt, modelId, styleId },
                responseType: 'arraybuffer'
            });

            const buffer = Buffer.from(response.data);
            await naze.sendMessage(m.chat, {
                image: buffer,
                caption: `🖼️ *Generated Image:*\n*${prompt}* (Model: ${modelId}, Style: ${styleId})`
            }, { quoted: m });
            
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};