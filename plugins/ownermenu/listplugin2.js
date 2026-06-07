const fs = require('fs');
const path = require('path');
require('../../settings');
const {downloadContentFromMessage, generateWAMessageFromContent, proto, generateWAMessageContent, getContentType,prepareWAMessageMedia} = require('baileys');

module.exports = {
    name: 'listplugin1',
    alias: ['pluginlist1', '.listplugin1', '.pluginlist1'],
    run: async ({ naze, m }) => {
        const botNumber = await naze.decodeJid(naze.user.id);
        const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

        if (!isOwner) return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);

        let from = m.chat || m.sender;
        let pluginsDir = './plugins';
        let args = m.text.trim().split(/ +/).slice(1);
        let targetCategory = args[0] ? args[0].toLowerCase() : null;

        await naze.sendMessage(from, { text: '*📂 Memproses daftar plugin, harap tunggu...*' }, { quoted: m });

        try {
            let categories = fs.readdirSync(pluginsDir).filter(folder => fs.statSync(path.join(pluginsDir, folder)).isDirectory());

            if (targetCategory && !categories.includes(targetCategory)) {
                return m.reply(`⚠️ Folder *${targetCategory}* tidak ditemukan. Pastikan nama folder benar.`);
            }

            let resultMessage = `*📂 Daftar Plugin${targetCategory ? ` di ${targetCategory}` : ''}:*\n\n`;
            let pluginList = [];
            let counter = 1;

            let processCategory = targetCategory ? [targetCategory] : categories;

            processCategory.forEach(category => {
                let categoryPath = path.join(pluginsDir, category);
                let pluginFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js') && file !== 'index.js');

                if (pluginFiles.length > 0) {
                    resultMessage += `📂 *${category.toUpperCase()}* (${pluginFiles.length} fitur)\n`;
                    pluginFiles.forEach(file => {
                        let filePath = path.join(categoryPath, file);
                        pluginList.push({ number: counter, file: filePath });
                        resultMessage += `  ${counter}. 📄 ${file.replace('.js', '')}\n`;
                        counter++;
                    });
                    resultMessage += `\n`;
                }
            });

            pluginList.sort((a, b) => a.number - b.number);
            global.pluginListCache = pluginList;

            naze.sendMessage(from, { text: resultMessage }, { quoted: m });
        } catch (err) {
            console.error(`Gagal membaca folder plugin: ${err.message}`);
            naze.sendMessage(from, { text: `⚠️ Terjadi kesalahan: ${err.message}` }, { quoted: m });
        }
    }
};
