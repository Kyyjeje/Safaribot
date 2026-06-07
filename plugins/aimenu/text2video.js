const fetch = require('node-fetch');
const { globalSettings } = require('../../settings');

module.exports = {
    name: 'text2video',
    alias: ['txt2vid', 'texttovideo'],
    description: '<teks>',
    run: async ({ naze, m, text }) => {
        if (!text) {
            return m.reply(`Harap masukkan teks untuk diubah menjadi video.\n\nContoh: \n\`${m.prefix}${m.command} car flying in the sky\``);
        }
        await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

        

        try {
            const response = await fetch(`https://endpointvercel.vercel.app/api/ai/ai-txt2vidio?prompt=${encodeURIComponent(text)}`, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0'
                },
                timeout: 15000
            });

            if (!response.ok) {
                throw new Error(`Permintaan gagal: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const videoUrl = data.url;

            if (!videoUrl) {
                throw new Error('URL video tidak ditemukan.');
            }

            await naze.sendMessage(m.chat, {
                video: { url: videoUrl },
                caption: `*Video dari teks: ${text}*\nDibuat oleh: ${data.creator || 'Tidak diketahui'}`
            }, { quoted: m });
        } catch (err) {
            await global.handleError(naze, m, err, {
                sendRawError: true,
                useGemini: true
            });
        }
    }
};