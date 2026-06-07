require('../../settings');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'totalfitur',
    alias: ['fiturtotal'],
    run: async ({ naze, m }) => {
        try {
            
            const pluginPath = path.join(__dirname, '../../plugins');
            let totalPlugins = 0;
            let pluginCounts = {};
            const botmenu = 3;
            const ownermenu = 17;
            const menuFile = './plugins/menu_list.txt';
            if (!fs.existsSync(menuFile)) {
                await naze.sendMessage(m.chat, { text: '⚠️ Daftar menu belum tersedia.' }, { quoted: m });
                
                return;
            }
            let menuList = fs.readFileSync(menuFile, 'utf-8').split('\n').filter(line => line.trim() !== '');
            menuList.forEach(category => {
                let cleanCategory = category.trim();
                let categoryPath = path.join(pluginPath, cleanCategory);
                if (fs.existsSync(categoryPath)) {
                    let pluginFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js') && file !== 'index.js');
                    pluginCounts[cleanCategory] = pluginFiles.length;
                    totalPlugins += pluginFiles.length;
                } else {
                    pluginCounts[cleanCategory] = 0;
                }
            });
            const barisjudul = '╔═〇';
            const barisfitur = '╠» 📂';
            const penutup = '╚══════════════════〇';
            let pluginList = `${barisjudul} *Detail Fitur Plugin:*\n`;
            menuList.forEach(category => {
                let cleanCategory = category.trim();
                let jumlahFitur = pluginCounts[cleanCategory] || 0;
                pluginList += `${barisfitur} ${category}\`(${jumlahFitur} fitur)\`\n`;
            });
            pluginList += `${penutup}\n`;
            let totalCases = (botmenu || 0) + (ownermenu || 0);
            let caseList = `📌 *Total Fitur Case:*\n` +
                           `📌 botmenu: ${botmenu || 0} fitur\n` +
                           `📌 ownermenu: ${ownermenu || 0} fitur\n` +
                           `📊 *Total Fitur Case:* ${totalCases} fitur\n`;
            let totalKeseluruhan = totalPlugins + totalCases;
            let caption = `📌 *Total Fitur Plugin & Case* 📌\n\n` +
                         `${pluginList}\n` +
                         `📊 *Total Plugin:* ${totalPlugins} fitur\n\n` +
                         `${caseList}\n` +
                         `🔢 *Total Keseluruhan:* ${totalKeseluruhan} fitur`;
            await m.reply(caption);
            
        } catch (e) {
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};