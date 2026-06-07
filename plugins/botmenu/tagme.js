require('../../settings');

module.exports = {
    name: 'tagme',
    run: async ({ naze, m }) => {
        try {
            const senderLid = m.sender;
            await naze.sendMessage(m.chat, {
                text: `Halo @${senderLid.split('@')[0]} 👋`,
                mentions: [senderLid]
            }, { quoted: m });

        } catch (err) {
            await m.reply(`Gagal menjalankan perintah tagme.`);
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};
