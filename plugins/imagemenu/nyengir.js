require('../../settings.js');
const { generateImageEdit } = require('../../lib/imageEditor');

module.exports = {
    name: 'nyengir',
    alias: ['smirkface', 'grinning', 'nyengirkan'],
    description: '<reply image/sticker>',
    run: async ({ naze, m }) => {
        const prompt = 'Edit gambar ini agar wajah terlihat nyengir atau tersenyum lebar.';
        const caption = '✨ *Gambar telah diedit dengan ekspresi nyengir!*';
        await generateImageEdit(naze, m, prompt, caption);
    }
};