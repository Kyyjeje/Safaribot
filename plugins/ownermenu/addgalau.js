const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
require('../../settings');

const galauPath = path.resolve(__dirname, '../../data/assets/galau/');

module.exports = {
    name: 'addgalau',
    alias: ['galauadd'],
    description: '(reply audio) <judul>',
    run: async ({ naze, m }) => {
        try {
            
            const body = m.type === 'conversation' ? m.message.conversation :
                         m.type === 'imageMessage' ? m.message.imageMessage.caption :
                         m.type === 'videoMessage' ? m.message.videoMessage.caption :
                         m.type === 'extendedTextMessage' ? m.message.extendedTextMessage.text :
                         m.type === 'messageContextInfo' ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : '';
            const args = body.trim().split(/ +/).slice(1);
            const quoted = m.quoted ? m.quoted : null;
            const title = args.join(' ').trim();
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            if (!quoted) {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <judul>\`\n> Contoh: \`${m.prefix}${m.command} KenanganIndah\`\n> Reply voice note/audio untuk menyimpan` }, { quoted: m });
            }

            const mimeType = quoted.mimetype || quoted.message?.audioMessage?.mimetype || null;
            if (!mimeType || !mimeType.includes('audio')) {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <judul>\`\n> Contoh: \`${m.prefix}${m.command} KenanganIndah\`\n> Reply voice note/audio untuk menyimpan` }, { quoted: m });
            }

            if (!title) {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <judul>\`\n> Contoh: \`${m.prefix}${m.command} KenanganIndah\`\n> Masukkan nama audio` }, { quoted: m });
            }

            const savePath = path.join(galauPath, `${title}.mp3`);
            if (fs.existsSync(savePath)) {
                
                return naze.sendMessage(m.chat, { text: `❌ Nama "${title}" telah digunakan!` }, { quoted: m });
            }

            
            const mediaPath = await naze.downloadAndSaveMediaMessage(quoted);
            await fse.copy(mediaPath, savePath);
            fs.unlinkSync(mediaPath);

            
            await naze.sendMessage(m.chat, { text: `✅ Sukses menambahkan "${title}" ke dalam database!` }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};