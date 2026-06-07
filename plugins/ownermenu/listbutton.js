require('../../settings');

module.exports = {
    name: 'listbutton',
    alias: ['listbutton'],
    description: '',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            

            if (!global.db) global.db = {};
            if (!global.db.set) global.db.set = {};
            if (!global.db.set[botNumber]) global.db.set[botNumber] = {};
            if (!global.db.set[botNumber].setbutton) global.db.set[botNumber].setbutton = {};

            const buttonSettings = global.db.set[botNumber].setbutton;
            const activeButtonFeatures = Object.keys(buttonSettings).filter(feature => buttonSettings[feature] === true);

            let response;
            if (activeButtonFeatures.length === 0) {
                response = '📋 *Daftar Fitur Button Aktif*\n\nTidak ada fitur yang menggunakan button saat ini.';
            } else {
                const listText = activeButtonFeatures.map((feature, index) => `${index + 1}. ${feature}`).join('\n');
                response = `📋 *Daftar Fitur Button Aktif*\n\n${listText}`;
            }

            
            await naze.sendMessage(m.chat, { text: response }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};