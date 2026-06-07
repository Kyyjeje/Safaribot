const fs = require('fs');
const path = require('path');
const kataKotorPath = path.join(__dirname, '../../database/kataKotor.js');
require('../../settings');

module.exports = {
    name: 'addbadword',
    alias: ['addkatakotor', 'addtoxic'],
    description: '<kata>',
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
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            if (!args[0]) {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <kata>\`\n> Contoh: \`${m.prefix}${m.command} bodoh\`\n> Untuk menambahkan kata ke daftar toxic` }, { quoted: m });
            }

            const kataBaru = args[0].toLowerCase();
            let kataKotor = require(kataKotorPath);

            if (kataKotor.includes(kataBaru)) {
                
                return naze.sendMessage(m.chat, { text: `❌ Kata "${kataBaru}" sudah ada dalam daftar!` }, { quoted: m });
            }

            kataKotor.push(kataBaru);
            fs.writeFileSync(kataKotorPath, `module.exports = ${JSON.stringify(kataKotor, null, 4)};`);

            
            await naze.sendMessage(m.chat, { text: `✅ Kata "${kataBaru}" berhasil ditambahkan ke daftar toxic!` }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};