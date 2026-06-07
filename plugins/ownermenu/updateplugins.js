require('../../settings');
const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('baileys');

module.exports = {
    name: 'updateplugins',
    alias: ['pluginupdate', 'updateplugin'],
    description: '<direktori> [reply]',
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
            const quoted = m.quoted ? m.quoted : m;

            if (!quoted || !quoted.message || quoted.message.documentMessage === undefined) {
                
                return naze.sendMessage(from, { text: `*Format salah!* Reply dokumen .js dengan perintah:\n\n\`${m.prefix}${m.command} <direktori>\`\n> Contoh: \`${m.prefix}${m.command} aimenu\`\n\nAtau dengan nama file:\n> \`${m.prefix}${m.command} aimenu/gpt.js\`` }, { quoted: m });
            }

            if (args.length < 1) {
                
                return naze.sendMessage(from, { text: `*Format salah!* Harap masukkan direktori tujuan.\n\nGunakan perintah:\n\`${m.prefix}${m.command} <direktori>\`\n> Contoh: \`${m.prefix}${m.command} aimenu\`\n\nAtau dengan nama file:\n> \`${m.prefix}${m.command} aimenu/gpt.js\`` }, { quoted: m });
            }

            let targetPath = args[0].trim();
            let targetDir, finalFileName;

            if (targetPath === '.' || targetPath === '') {
                targetDir = './plugins';
            } else if (targetPath.includes('/')) {
                const parsedPath = path.parse(targetPath);
                targetDir = path.join('./plugins', parsedPath.dir || '');
                if (targetPath.endsWith('/')) {
                    targetDir = path.join('./plugins', targetPath);
                    finalFileName = null;
                } else {
                    finalFileName = parsedPath.base;
                }
            } else {
                targetDir = path.join('./plugins', targetPath);
                finalFileName = null;
            }

            if (!finalFileName) {
                const docFileName = quoted.message.documentMessage.fileName || `plugin_${Date.now()}.js`;
                finalFileName = docFileName.endsWith('.js') ? docFileName : `${docFileName}.js`;
            } else if (!finalFileName.endsWith('.js')) {
                finalFileName += '.js';
            }

            const filePath = path.join(targetDir, finalFileName);

            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            const fileExists = fs.existsSync(filePath);
            if (fileExists) {
                fs.unlinkSync(filePath);
            }

            const msg = quoted.message.documentMessage;
            const stream = await downloadContentFromMessage(msg, 'document');
            const writeStream = fs.createWriteStream(filePath);

            for await (const chunk of stream) {
                writeStream.write(chunk);
            }
            writeStream.end();

            writeStream.on('finish', async () => {
                const message = fileExists
                    ? `✅ Plugin di *${filePath}* telah diperbarui.`
                    : `✅ Plugin berhasil ditambahkan di *${filePath}* karena file sebelumnya tidak ditemukan.`;
                
                await naze.sendMessage(from, { text: message }, { quoted: m });
            });

            writeStream.on('error', async (err) => {
                
                await naze.sendMessage(from, { text: `⚠️ Terjadi kesalahan saat menyimpan plugin: ${err.message}` }, { quoted: m });
            });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};