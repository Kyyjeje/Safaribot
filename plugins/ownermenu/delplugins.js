const fs = require('fs');
const path = require('path');
require('../../settings');

module.exports = {
    name: 'delplugins',
    alias: ['plugindelete', 'deleteplugin'],
    description: '<direktori/nama file>',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            const from = m.chat || m.sender;
            const body = m.type === 'conversation' ? m.message.conversation :
                         m.type === 'imageMessage' ? m.message.imageMessage.caption :
                         m.type === 'videoMessage' ? m.message.videoMessage.caption :
                         m.type === 'extendedTextMessage' ? m.message.extendedTextMessage.text :
                         m.type === 'buttonsResponseMessage' ? m.message.buttonsResponseMessage.selectedButtonId :
                         m.type === 'listResponseMessage' ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                         m.type === 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId :
                         m.type === 'messageContextInfo' ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) :
                         m.type === 'editedMessage' ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage?.text || m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
            const args = body.trim().replace(/\s+/g, ' ').split(' ').slice(1);

            if (args.length < 1) {
                
                return naze.sendMessage(from, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <direktori/nama file>\`\n> Contoh: \`${m.prefix}${m.command} aimenu/gpt.js\`\n> Untuk menghapus plugin` }, { quoted: m });
            }

            let targetPath = args[0].trim();
            let targetDir, finalFileName;

            if (targetPath === './plugins' || targetPath === '') {
                targetDir = './plugins';
            } else if (targetPath.includes('/')) {
                const parsedPath = path.parse(targetPath);
                targetDir = parsedPath.dir || './plugins';
                finalFileName = parsedPath.base;
            } else {
                
                return naze.sendMessage(from, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <direktori/nama file>\`\n> Contoh: \`${m.prefix}${m.command} aimenu/gpt.js\`\n> Untuk menghapus plugin` }, { quoted: m });
            }

            if (!targetDir.startsWith('./plugins')) {
                targetDir = `./plugins/${targetDir}`;
            }

            if (!finalFileName.endsWith('.js')) {
                
                return naze.sendMessage(from, { text: `*Format salah!* File harus berupa plugin .js.\nGunakan perintah:\n\`${m.prefix}${m.command} <direktori/nama file>\`\n> Contoh: \`${m.prefix}${m.command} aimenu/gpt.js\`` }, { quoted: m });
            }

            const filePath = path.join(targetDir, finalFileName);

            

            if (!fs.existsSync(filePath)) {
                
                return naze.sendMessage(from, { text: `❌ Plugin *${finalFileName}* tidak ditemukan di: \`${targetDir}/${finalFileName}\`.\nPenghapusan dibatalkan.` }, { quoted: m });
            }

            fs.unlinkSync(filePath);
            const files = fs.readdirSync(targetDir);
            if (files.length === 0) {
                fs.rmdirSync(targetDir);
            }

            
            await naze.sendMessage(from, { text: `✅ Plugin *${finalFileName}* di *${filePath}* telah dihapus.` }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};