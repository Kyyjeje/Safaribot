require('../../settings.js');
const { generateImageEdit } = require('../../lib/imageEditor');

module.exports = {
    name: 'horor',
    alias: ['horror', 'scaryface', 'hororkan'],
    description: '<reply image/sticker>',
    run: async ({ naze, m }) => {
        const prompt = 'Edit gambar ini agar wajah terlihat menyeramkan dengan efek horor.';
        const caption = '✨ *Gambar telah diedit dengan efek horor!*';
        await generateImageEdit(naze, m, prompt, caption);
    }
};