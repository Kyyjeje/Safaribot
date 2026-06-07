require('../../settings');

module.exports = {
    name: 'listprefix',
    alias: ['prefixlist'],
    description: '',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            

            if (global.prefixes.length === 0) {
                
                return naze.sendMessage(m.chat, { text: '⚠️ Tidak ada prefix yang tersedia.' }, { quoted: m });
            }

            const prefixList = global.prefixes.map((p, i) => `${i + 1}. ${p}`).join('\n');
            const response = `📋 *Daftar Prefix*\n\n${prefixList}\n\nGunakan salah satu prefix di atas untuk perintah.`;
            
            await naze.sendMessage(m.chat, { text: response }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};