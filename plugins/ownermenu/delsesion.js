const fs = require('fs');
require('../../settings');

const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    name: 'dellsesi',
    alias: ['delsesi', 'delsession', 'deletesesi', 'deletesession'],
    description: '[true]',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            

            const folderPath = './nazedev';
            const mainSessionFile = 'creds.json';
            const files = await fs.promises.readdir(folderPath).catch(err => {
                throw new Error(`Gagal membaca direktori: ${err.message}`);
            });
            const sessionFiles = files.filter(file => file !== mainSessionFile);
            let teks = `Terdeteksi ${sessionFiles.length} file sesi\n\n`;

            if (sessionFiles.length === 0) {
                
                return naze.sendMessage(m.chat, { text: teks }, { quoted: m });
            }

            sessionFiles.forEach((file, i) => {
                teks += `${i + 1}. ${file}\n`;
            });

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
            const text = args.join(' ').trim();

            if (text === 'true') {
                for (const file of sessionFiles) {
                    await fs.promises.unlink(`${folderPath}/${file}`);
                }
                await sleep(1000);
                
                await naze.sendMessage(m.chat, { text: '✅ Berhasil menghapus semua file sesi' }, { quoted: m });
            } else {
                
                await naze.sendMessage(m.chat, { text: `${teks}\n*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} true\`\n> Untuk menghapus semua file sesi` }, { quoted: m });
            }
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};