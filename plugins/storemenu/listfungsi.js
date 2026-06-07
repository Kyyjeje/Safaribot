require('../../settings');
const { placeholderDescriptions } = require('../../database/list_function');

module.exports = {
    name: 'listfungsi',
    alias: ['listfunction', 'showfunctions'],
    run: async ({ naze, m}) => {
        try {
            

            const functionList = Object.keys(placeholderDescriptions).length
                ? Object.entries(placeholderDescriptions)
                    .map(([func, desc]) => `- \`${func}\` - ${desc}`)
                    .join('\n')
                : 'Tidak ada fungsi pemanggil yang ditemukan.';
            const responseText = `*Daftar Fungsi Pemanggil*\n\nBerikut adalah daftar fungsi pemanggil untuk mempersonalisasi pesan bot:\n\n${functionList}\n\nGunakan dalam perintah seperti \`${m.prefix}${m.command}\` untuk menyesuaikan pesan.`;

            
            return naze.sendMessage(m.chat, {
                text: responseText,
                contextInfo: {
                    mentionedJid: [m.sender],
                    externalAdReply: {
                        title: '📜 Daftar Fungsi Pemanggil',
                        body: `${global.botname} 🤖`,
                        thumbnailUrl: global.getRandomThumbnailUrl(),
                        mediaType: 1,
                        previewType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });
        } catch (err) {
            console.error(`Kesalahan saat memproses listfungsi: ${err.message}`);
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};