require('../../settings');

module.exports = {
    name: 'stelenya',
    alias: ['stelenya', 'stele_dl'],
    description: '<url sticker>',
    run: async ({ naze, m, text }) => {
        // Coba ambil URL dari text (dari parameter) atau dari listResponseMessage
        let url = text ? text.trim() : (m.message?.listResponseMessage?.singleSelectReply?.selectedRowId || '').replace('stelenya', '').trim();

        // Validasi URL
        if (!url || !url.includes('https://api.telegram.org/file/bot')) {
            return m.reply('URL stiker tidak valid. Harap pilih dari daftar stiker!');
        }
        await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

        try {
            await naze.sendToSticker(m.chat, url);
            console.log(`[INFO] Mengirim stiker dari URL: ${url}`);
        } catch (error) {
            console.error(`[ERROR] Gagal mengirim stiker: ${error.message}`);
            m.reply('Terjadi kesalahan saat mengirim stiker. Coba lagi!');
        }
    }
};