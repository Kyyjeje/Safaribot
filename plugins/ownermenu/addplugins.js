const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('baileys');
require('../../settings');

module.exports = {
    name: 'addplugin',
    alias: ['pluginadd', 'addplugins', 'pluginsadd'],
    description: '(reply plugin) <direktori>',
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
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <direktori>\`\n> Contoh: \`${m.prefix}${m.command} aimenu\`\n> Reply dokumen .js untuk menyimpan sebagai plugin` }, { quoted: m });
            }

            if (args.length < 1) {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <direktori>\`\n> Contoh: \`${m.prefix}${m.command} aimenu\`\n> Masukkan direktori tujuan\n\n\`${m.prefix}${m.command} <direktori/nama_file>\`\n> Contoh: \`${m.prefix}${m.command} aimenu/gpt.js\`\n> Untuk menyimpan dengan nama file tertentu` }, { quoted: m });
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
            }

            if (!targetDir.startsWith('./')) {
                targetDir = `./${targetDir}`;
            }

            if (!finalFileName) {
                finalFileName = quoted.message.documentMessage.fileName || `plugin_${Date.now()}.js`;
                if (!finalFileName.endsWith('.js')) {
                    finalFileName += '.js';
                }
            } else if (!finalFileName.endsWith('.js')) {
                finalFileName += '.js';
            }

            const filePath = path.join(targetDir, finalFileName);

            

            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            if (fs.existsSync(filePath)) {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Plugin dengan nama: \`${finalFileName}\` sudah ada di: \n\n\`${targetDir}/${finalFileName}\` \n\nPenambahan dibatalkan.\n\n\n *Catatan*\n> Jika ingin melakukan perubahan/update plugin, gunakan perintah:\n\`${m.prefix}updateplugin <tujuan folder>\`\n> Contoh: \`${m.prefix}updateplugin aimenu\`` }, { quoted: m });
            }

            const msg = quoted.message.documentMessage;
            const stream = await downloadContentFromMessage(msg, 'document');
            const writeStream = fs.createWriteStream(filePath);

            for await (const chunk of stream) {
                writeStream.write(chunk);
            }
            writeStream.end();

            writeStream.on('finish', async () => {
                
                await naze.sendMessage(m.chat, { text: `✅ Plugin berhasil ditambahkan di *${filePath}*.` }, { quoted: m });
            });

            writeStream.on('error', async (err) => {
                
                await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
            });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};