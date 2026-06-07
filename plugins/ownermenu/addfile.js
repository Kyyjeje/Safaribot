const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage } = require('baileys');
require('../../settings');

module.exports = {
    name: 'addfile',
    alias: ['fileadd'],
    description: '(reply media) <direktori>',
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
            const args = body.trim().replace(/\s+/g, ' ').split(' ').slice(1);
            const quoted = m.quoted ? m.quoted : m;
            const from = m.chat || m.sender;
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            if (!quoted || !quoted.message) {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <direktori>\`\n> Contoh: \`${m.prefix}${m.command} ./data/\`\n> Reply media (file, gambar, video, musik, dll.) untuk menyimpan ke direktori` }, { quoted: m });
            }

            const supportedTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage'];
            const messageType = Object.keys(quoted.message)[0];
            if (!supportedTypes.includes(messageType)) {
                
                return naze.sendMessage(m.chat, { text: `❌ File tidak didukung. Reply media (file, gambar, video, musik, dll.)!` }, { quoted: m });
            }

            if (args.length < 1) {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <direktori>\`\n> Contoh: \`${m.prefix}${m.command} ./data/\`\n> Untuk menyimpan media ke direktori tertentu` }, { quoted: m });
            }

            let targetPath = args.join(' ').trim();
            let targetDir, finalFileName;

            if (targetPath === './') {
                targetDir = './';
            } else if (targetPath.includes('/')) {
                const parsedPath = path.parse(targetPath);
                targetDir = parsedPath.dir || './';
                if (targetPath.endsWith('/')) {
                    targetDir = targetPath;
                    finalFileName = null;
                } else {
                    finalFileName = parsedPath.base;
                }
            } else {
                targetDir = targetPath;
            }

            if (!targetDir.startsWith('./')) {
                targetDir = `./${targetDir}`;
            }

            if (!finalFileName) {
                if (messageType === 'documentMessage') {
                    finalFileName = quoted.message.documentMessage.fileName || `document_${Date.now()}`;
                    if (!finalFileName.toLowerCase().endsWith('.ttf')) {
                        finalFileName = quoted.message.documentMessage.fileName || `document_${Date.now()}`;
                    }
                } else if (messageType === 'imageMessage') {
                    finalFileName = `image_${Date.now()}.jpg`;
                } else if (messageType === 'videoMessage') {
                    finalFileName = `video_${Date.now()}.mp4`;
                } else if (messageType === 'audioMessage') {
                    finalFileName = `audio_${Date.now()}.mp3`;
                }
            }

            const filePath = path.join(targetDir, finalFileName);

            

            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            if (fs.existsSync(filePath)) {
                
                return naze.sendMessage(m.chat, { text: `❌ File dengan nama *${finalFileName}* sudah ada di *${targetDir}*.` }, { quoted: m });
            }

            const msg = quoted.message[messageType];
            const stream = await downloadContentFromMessage(msg, messageType.replace('Message', '').toLowerCase());
            const writeStream = fs.createWriteStream(filePath);

            for await (const chunk of stream) {
                writeStream.write(chunk);
            }
            writeStream.end();

            writeStream.on('finish', async () => {
                
                await naze.sendMessage(m.chat, { text: `✅ File berhasil disimpan di *${filePath}*.` }, { quoted: m });
            });

            writeStream.on('error', async (err) => {
                
                await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
            });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};