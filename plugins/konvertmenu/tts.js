require('../../settings');
const { join } = require('path');
const gtts = require('node-gtts');
const { readFileSync, unlinkSync } = require('fs');

function tts(text, lang = 'id') {
    return new Promise((resolve, reject) => {
        try {
            let tts = gtts(lang);
            let filePath = join(__dirname, '../../temp', Date.now() + '.wav');
            tts.save(filePath, text, () => {
                resolve(readFileSync(filePath));
                unlinkSync(filePath);
            });
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = {
    name: 'tts',
    alias: ['texttospeech', 'tospeech', 'ttsaudio', 'speechify'],
    description: '<text>',
    run: async ({ naze, m, text }) => {
        try {
            if (!text) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Konversi Teks ke Suara:*\n` +
                              `  Perintah: \n\`${m.prefix}${m.command} <teks>\`\n` +
                              `  Contoh: \n\`${m.prefix}tts Halo apa kabar?\``);
            }

            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
            

            let audio = await tts(text);
            await naze.sendMessage(m.chat, { audio: audio, ptt: true, mimetype: 'audio/mpeg' }, { quoted: m });
            
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};