require('../../settings');

module.exports = {
    name: 'listbanned',
    alias: ['listblockchat', 'listban', 'listbc'],
    description: '',
    run: async ({ naze, m }) => {
        try {
            // Fungsi untuk membersihkan JID atau LID
            const cleanId = (id) => {
                if (!id) return id;
                return id.replace('@s.whatsapp.net', '').replace('@lid', '');
            };

            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            const blockedList = [...global.blockedChats];
            if (blockedList.length === 0) {
                return naze.sendMessage(m.chat, { text: '📋 Tidak ada nomor yang diblokir.' }, { quoted: m });
            }

            let response = '📋 *Daftar Nomor yang Dibanned:*\n\n';
            blockedList.forEach((num, index) => {
                const cleanNum = cleanId(num);
                response += `${index + 1}. ${cleanNum}\n`;
            });

            await naze.sendMessage(m.chat, { text: response }, { quoted: m });
        } catch (err) {
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};