const fs = require('fs');
require('../../settings');

module.exports = {
    name: 'getplugins',
    alias: ['pluginget', 'ambilplugin', 'getplugin'],
    description: '<nomor/nama plugin>',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            const from = m.chat || m.sender;
            const args = m.text.trim().split(' ').slice(1);
            const input = args.join(' ').trim();

            if (!input) {
                
                return naze.sendMessage(from, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <nomor/nama plugin>\`\n> Contoh: \`${m.prefix}${m.command} 3\`\n> atau \`${m.prefix}${m.command} contoh.js\`\n> atau \`${m.prefix}${m.command} contoh\`` }, { quoted: m });
            }

            

            const pluginList = global.pluginListCache || [];
            let selectedPlugin;

            if (!isNaN(input)) {
                const pluginNumber = parseInt(input);
                selectedPlugin = pluginList.find(p => p.number === pluginNumber);
            } else {
                const pluginName = input.endsWith('.js') ? input : `${input}.js`;
                selectedPlugin = pluginList.find(p => p.file.endsWith(pluginName));
            }

            if (!selectedPlugin) {
                
                return naze.sendMessage(from, { text: `❌ Plugin *${input}* tidak ditemukan.` }, { quoted: m });
            }

            await naze.sendMessage(from, {
                document: { url: selectedPlugin.file },
                mimetype: 'text/javascript',
                fileName: selectedPlugin.file.split('/').pop()
            }, { quoted: m });
            
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};