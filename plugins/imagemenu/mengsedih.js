require('../../settings.js');
const { generateImageEdit } = require('../../lib/imageEditor');

module.exports = {
    name: 'mengsedih',
    alias: ['sademot', 'sadface', 'sedihkan'],
    description: '<reply image/sticker>',
    run: async ({ naze, m }) => {
        const prompt = 'Edit gambar ini agar wajah terlihat sedih atau menangis.';
        const caption = '✨ *Gambar telah diedit dengan ekspresi sedih!*';
        await generateImageEdit(naze, m, prompt, caption);
    }
};