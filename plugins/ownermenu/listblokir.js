require('../../settings');

module.exports = {
    name: 'listblokir',
    alias: ['listblockir', 'listblok', 'listblock'],
    description: '',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            

            const anu = await naze.fetchBlocklist();
            const response = `📋 Total Block: ${anu.length}\n\n${anu.map(v => `• ${v.replace(/@.+/, '')}`).join('\n')}`;
            
            await naze.sendMessage(m.chat, { text: response }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};