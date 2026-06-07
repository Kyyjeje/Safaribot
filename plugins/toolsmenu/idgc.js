require('../../settings');

module.exports = {
    name: 'cekidgc',
    alias: ['idgc', 'getidgc', 'getidgroup'],
    description: '<non url/url grup>',
    run: async ({ naze, m }) => {
        try {
            // Pastikan perintah dijalankan di grup
            if (!m.isGroup) {
                return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
            }

            const groupId = m.chat; // Menggunakan m.chat sebagai ID grup
            const groupMetadata = await naze.groupMetadata(groupId);
            const groupName = groupMetadata.subject;

            const teks = `📌 *Nama Grup:* ${groupName}\n` +
                         `🔹 *ID Grup:* ${groupId}\n\n`;

            const interactiveButtons = [
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: 'Salin ID Grup',
                        id: groupId,
                        copy_code: groupId
                    })
                }
            ];

            await naze.sendMessage(m.chat, {
                text: teks,
                title: '📢 Detail Grup',
                footer: '✅ Data grup berhasil diperoleh!',
                interactiveButtons
            }, { quoted: m });
        } catch (err) {
            console.error(`Gagal mengambil data grup: ${err.message}`);
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};