require('../../settings');

module.exports = {
    name: 'setbutton',
    alias: ['setbutton'],
    description: '<fitur/all> <true/false>',
    run: async ({ naze, m, text }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            

            const supportedFeatures = ['grupsetting', 'idch', 'idgc', 'jadwalbioskop', 'jodohku', 'listgalau', 'menu', 'netflix', 'pinterest', 'play', 'spotify', 'tiktoksearch', 'wallpaper'];
            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Fitur yang tersedia:\n- ${supportedFeatures.join('\n- ')}\n\nGunakan perintah:\n\`${m.prefix}${m.command} <fitur> true/false\`\n> Contoh: \`${m.prefix}${m.command} menu true\`\n\nUntuk mengaktifkan/menonaktifkan semua button:\n> \`${m.prefix}${m.command} all true\` (aktif)\n> \`${m.prefix}${m.command} all false\` (non-aktif)` }, { quoted: m });
            }

            const args = text.toLowerCase().trim().split(/\s+/);
            if (args.length < 2) {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Fitur yang tersedia:\n- ${supportedFeatures.join('\n- ')}\n\nGunakan perintah:\n\`${m.prefix}${m.command} <fitur> true/false\`\n> Contoh: \`${m.prefix}${m.command} menu true\`\n\nUntuk mengaktifkan/menonaktifkan semua button:\n> \`${m.prefix}${m.command} all true\` (aktif)\n> \`${m.prefix}${m.command} all false\` (non-aktif)` }, { quoted: m });
            }

            const feature = args[0];
            const valueInput = args[1];
            let buttonValue;

            if (valueInput === 'true') {
                buttonValue = true;
            } else if (valueInput === 'false') {
                buttonValue = false;
            } else {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Nilai harus 'true' atau 'false'.\n\nFitur yang tersedia:\n- ${supportedFeatures.join('\n- ')}\n\nGunakan perintah:\n\`${m.prefix}${m.command} <fitur> true/false\`\n> Contoh: \`${m.prefix}${m.command} menu true\`\n\nUntuk mengaktifkan/menonaktifkan semua button:\n> \`${m.prefix}${m.command} all true\` (aktif)\n> \`${m.prefix}${m.command} all false\` (non-aktif)` }, { quoted: m });
            }

            if (!global.db) global.db = {};
            if (!global.db.set) global.db.set = {};
            if (!global.db.set[botNumber]) global.db.set[botNumber] = {};
            if (!global.db.set[botNumber].setbutton) global.db.set[botNumber].setbutton = {};

            const buttonSettings = global.db.set[botNumber].setbutton;
            supportedFeatures.forEach(f => {
                if (!(f in buttonSettings)) buttonSettings[f] = false;
            });

            if (feature === 'all') {
                supportedFeatures.forEach(f => {
                    buttonSettings[f] = buttonValue;
                });
                const modeText = buttonValue ? 'Full Button' : 'Biasa (tanpa button)';
                
                await naze.sendMessage(m.chat, { text: `✅ Semua fitur berhasil diatur ke mode *${modeText}*.` }, { quoted: m });
            } else {
                if (!supportedFeatures.includes(feature)) {
                    
                    return naze.sendMessage(m.chat, { text: `*Format salah!* Fitur *${feature}* tidak ditemukan.\n\nFitur yang tersedia:\n- ${supportedFeatures.join('\n- ')}\n\nGunakan perintah:\n\`${m.prefix}${m.command} <fitur> true/false\`\n> Contoh: \`${m.prefix}${m.command} menu true\`` }, { quoted: m });
                }
                buttonSettings[feature] = buttonValue;
                const modeText = buttonValue ? 'Full Button' : 'Biasa (tanpa button)';
                
                await naze.sendMessage(m.chat, { text: `✅ Fitur *${feature}* berhasil diatur ke mode *${modeText}*.` }, { quoted: m });
            }
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};