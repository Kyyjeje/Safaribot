const fs = require('fs');
const path = require('path');
require('../../settings');

module.exports = {
    name: 'listbadword',
    alias: ['listkatakotor', 'listtoxic'],
    description: '',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            

            const kataKotorPath = path.join(__dirname, '../../database/kataKotor.js');
            const kataKotor = require(kataKotorPath);

            if (kataKotor.length === 0) {
                
                return naze.sendMessage(m.chat, { text: '🚫 Daftar kata kotor masih kosong.' }, { quoted: m });
            }

            const list = kataKotor.sort().map((kata, index) => `${index + 1}. ${kata}`).join('\n');
            
            await naze.sendMessage(m.chat, { text: `📜 *Daftar Kata Kotor:*\n\n${list}` }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};