require('../../settings.js');
const { generateImageEdit } = require('../../lib/imageEditor');

module.exports = {
    name: 'hytam',
    alias: ['hitamkan', 'hytamkan', 'darkenskin'],
    description: '<reply image/sticker>',
    run: async ({ naze, m }) => {
        const prompt = 'Edit gambar ini agar warna kulitnya sedikit lebih gelap atau menghitam.';
        const caption = '✨ *Gambar telah diedit dengan warna kulit lebih gelap!*';
        await generateImageEdit(naze, m, prompt, caption);
    }
};