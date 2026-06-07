const fs = require('fs');
require('../../settings');

module.exports = {
    name: 'getsesi',
    alias: ['getsession', 'getsessi'],
    description: '',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            const from = m.chat || m.sender;
            const sessionPath = './nazedev/creds.json';

            if (fs.existsSync(sessionPath)) {
                await naze.sendMessage(from, {
                    document: { url: sessionPath },
                    mimetype: 'application/json',
                    fileName: 'creds.json'
                }, { quoted: m });
                
            } else {
                
                await naze.sendMessage(from, { text: '❌ File creds.json tidak ditemukan.' }, { quoted: m });
            }
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};