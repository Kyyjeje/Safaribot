const fs = require('fs');
const path = require('path');
require('../../settings');

module.exports = {
    name: 'addowner',
    alias: ['listowner', 'delowner'],
    //description: '<addowner <nomor> | listowner | delowner <nomor>>',
    run: async ({ naze, m }) => {
        try {
            
            const body = m.type === 'conversation' ? m.message.conversation :
                         m.type === 'imageMessage' ? m.message.imageMessage.caption :
                         m.type === 'videoMessage' ? m.message.videoMessage.caption :
                         m.type === 'extendedTextMessage' ? m.message.extendedTextMessage.text :
                         m.type === 'buttonsResponseMessage' ? m.message.buttonsResponseMessage.selectedButtonId :
                         m.type === 'listResponseMessage' ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                         m.type === 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId :
                         m.type === 'messageContextInfo' ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) :
                         m.type === 'editedMessage' ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage?.text || m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
            const args = body.trim().split(/ +/).slice(1);
            const text = args.join(' ');
            const botNumber = await naze.decodeJid(naze.user.id);
            const ownerList = global.owner || [];
            const isOwner = [botNumber, ...ownerList].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            const settingsPath = path.resolve(__dirname, '../../settings.js');
            const saveSettings = (newOwnerList) => {
                let fileContent = fs.readFileSync(settingsPath, 'utf8');
                const ownerLineRegex = /global\.owner\s*=\s*\[.*?\]/;
                const newOwnerLine = `global.owner = [${newOwnerList.map(num => `'${num}'`).join(',')}]`;
                fileContent = fileContent.replace(ownerLineRegex, newOwnerLine);
                fs.writeFileSync(settingsPath, fileContent, 'utf8');
                delete require.cache[settingsPath];
                require(settingsPath);
            };

            if (m.text.startsWith('.addowner') || m.text.startsWith('addowner')) {
                if (!text) {
                    
                    return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}addowner <nomor>\`\n> Contoh: \`${m.prefix}addowner 6281234567890\`\n> Untuk menambahkan owner baru` }, { quoted: m });
                }

                const number = text.replace(/[^0-9]/g, '');
                if (!number.startsWith('62')) {
                    
                    return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}addowner <nomor>\`\n> Contoh: \`${m.prefix}addowner 6281234567890\`\n> Gunakan kode negara 62` }, { quoted: m });
                }

                if (ownerList.includes(number)) {
                    
                    return naze.sendMessage(m.chat, { text: `❌ Nomor ${number} sudah terdaftar sebagai owner!` }, { quoted: m });
                }

                ownerList.push(number);
                saveSettings(ownerList);

                
                await naze.sendMessage(m.chat, { text: `✅ Berhasil menambahkan ${number} sebagai owner!` }, { quoted: m });
            } else if (m.text.startsWith('.listowner') || m.text.startsWith('listowner')) {
                const ownerListText = ownerList.map((num, i) => `${i + 1}. ${num} ${m.sender.split('@')[0] === num ? '(Anda)' : ''}`).join('\n');
                
                await naze.sendMessage(m.chat, { text: `📋 Daftar Owner:\n${ownerListText || 'Tidak ada owner terdaftar.'}` }, { quoted: m });
            } else if (m.text.startsWith('.delowner') || m.text.startsWith('delowner')) {
                if (!text) {
                    
                    return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}delowner <nomor>\`\n> Contoh: \`${m.prefix}delowner 6281234567890\`\n> Untuk menghapus owner` }, { quoted: m });
                }

                const number = text.replace(/[^0-9]/g, '');
                if (!ownerList.includes(number)) {
                    
                    return naze.sendMessage(m.chat, { text: `❌ Nomor ${number} tidak terdaftar sebagai owner!` }, { quoted: m });
                }

                if (ownerList.length <= 1) {
                    
                    return naze.sendMessage(m.chat, { text: `❌ Tidak bisa menghapus! Minimal harus ada 1 owner.` }, { quoted: m });
                }

                const newOwnerList = ownerList.filter(num => num !== number);
                saveSettings(newOwnerList);

                
                await naze.sendMessage(m.chat, { text: `✅ Berhasil menghapus ${number} dari daftar owner!` }, { quoted: m });
            } else {
                
                await naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}addowner <nomor>\`\n> Untuk menambahkan owner baru\n\n\`${m.prefix}listowner\`\n> Untuk melihat daftar owner\n\n\`${m.prefix}delowner <nomor>\`\n> Untuk menghapus owner` }, { quoted: m });
            }
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};