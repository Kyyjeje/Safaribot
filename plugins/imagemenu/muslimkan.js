require('../../settings');
const { generateImageEdit } = require('../../lib/imageEditor');

module.exports = {
    name: 'muslimkan',
    alias: ['syari', 'muslimdress', 'islamiclook'],
    description: '<reply image/sticker>',
    run: async ({ naze, m }) => {
        const prompt = 'Edit pakaian orang dalam gambar ini menjadi pakaian syar\'i sesuai syariat Islam, Jangan mengubah bentuk wajah, ekspresi wajah, atau postur tubuh. jangan ';
        const caption = '✨ *Gambar telah diedit dengan pakaian syar\'i!*';
        await generateImageEdit(naze, m, prompt, caption);
    }
};