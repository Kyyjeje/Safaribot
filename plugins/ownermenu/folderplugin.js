const fs = require('fs');
const path = require('path');
require('../../settings');

module.exports = {
    name: 'folderplugin',
    alias: ['pluginfolder'],
    description: '',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            

            const pluginsDir = './plugins';
            const categories = fs.readdirSync(pluginsDir).filter(folder => fs.statSync(path.join(pluginsDir, folder)).isDirectory());

            if (categories.length === 0) {
                
                return naze.sendMessage(m.chat, { text: '⚠️ Tidak ada folder plugin yang ditemukan.' }, { quoted: m });
            }

            let resultMessage = '╔═〇 *Daftar Folder Plugin:*\n╠═══════════〇\n';
            let totalFitur = 0;

            categories.forEach(category => {
                const categoryPath = path.join(pluginsDir, category);
                const pluginFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js') && file !== 'index.js');
                const jumlahFitur = pluginFiles.length;
                resultMessage += `╠»📂 *${category.toUpperCase()}*    (${jumlahFitur} fitur)\n`;
                totalFitur += jumlahFitur;
            });

            resultMessage += `╚═════════════════〇\n\n📊 *Total Keseluruhan Fitur: ${totalFitur}* fitur`;
            
            await naze.sendMessage(m.chat, { text: resultMessage }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};