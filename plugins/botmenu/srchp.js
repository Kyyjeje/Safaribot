const fs = require('fs');
const path = require('path');

const findPluginPath = (pluginName, dir = path.join(__dirname, '..', '..', 'plugins')) => {
    try {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        for (const file of files) {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
                const result = findPluginPath(pluginName, fullPath);
                if (result) return result;
            } else if (file.name.endsWith('.js') && !fullPath.endsWith('index.js')) {
                try {
                    const plugin = require(fullPath);
                    if (plugin && plugin.name && plugin.name.toLowerCase() === pluginName.toLowerCase()) {
                        return fullPath;
                    }
                } catch (e) {}
            }
        }
    } catch (e) {}
    return null;
};

module.exports = {
    name: 'srchp',
    alias: ['pluginsearch', 'caricmd', 'cekfitur'],
    
    run: async ({ naze, m, text }) => { 
        const botNumber = await naze.decodeJid(naze.user.id);
        const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

        if (!isOwner) return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);

        const { plugins } = require('../../plugins');

        try {
            if (!text) {
                m.reply('Mau ngecek fitur apa, Sayang?\n\nContoh: *srchp add*');
                return;
            }

            await naze.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

            const searchText = text.toLowerCase().trim();
            const matches = [];
            const uniquePlugins = [...new Set(plugins.values())];

            for (const plugin of uniquePlugins) {
                const nameMatch = plugin.name && plugin.name.toLowerCase().includes(searchText);
                const aliasMatch = plugin.alias && plugin.alias.some(a => a.toLowerCase().includes(searchText));

                if (nameMatch || aliasMatch) {
                    matches.push(plugin);
                }
            }

            if (matches.length === 0) {
                m.reply(`⚠️ Anjir, command *"${searchText}"* gak ketemu, sayang.`);
                return await naze.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            }

            let fullDetailMessage = `🔍 Anjir, nemu *${matches.length}* command yang Lo cari sayang, *"${searchText}"* kan, nih :\n\n`;
            
            for (const [index, plugin] of matches.entries()) {
                const absolutePath = findPluginPath(plugin.name);
                const relativePath = absolutePath ? path.relative(path.join(__dirname, '..', '..'), absolutePath) : 'Tidak ditemukan';
                let isOwnerCommand = false;

                if (absolutePath) {
                    try {
                        const fileContent = fs.readFileSync(absolutePath, 'utf8');
                        if (fileContent.includes('global.owner') || fileContent.includes('if (!isOwner)')) {
                            isOwnerCommand = true;
                        }
                    } catch (e) {}
                }

                fullDetailMessage += `*ℹ️ INFO FITUR ${index + 1} ℹ️*\n`;
                fullDetailMessage += `🏷️ *Command*: \`${plugin.name}\`\n`;
                fullDetailMessage += `🔗 *Alias*: \`${plugin.alias ? plugin.alias.join(', ') : '-'}\`\n`;
                fullDetailMessage += `📁 *Lokasi*: \`${relativePath.replace(/\\/g, '/')}\`\n`;

                if (index < matches.length - 1) {
                    fullDetailMessage += `\n-------------------------------\n\n`;
                }
            }
            
            await m.reply(fullDetailMessage.trim());
            await naze.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        } catch (e) {
            console.error(e);
            m.reply(`Anjir, ada error di command srchp: ${e.message}`);
            await naze.sendMessage(m.chat, { react: { text: '🔥', key: m.key } });
        }
    }
};

