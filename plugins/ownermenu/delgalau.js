const fs = require('fs');
const path = require('path');
require('../../settings');

module.exports = {
    name: 'delgalau',
    alias: ['delgalau'],
    description: '<nomor/nama>',
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
            const q = args.join(' ').trim();
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            const dirPath = path.resolve(__dirname, '../../data/assets/galau/');
            let files = [];
            if (fs.existsSync(dirPath)) {
                files = fs.readdirSync(dirPath).filter(file => file.endsWith('.mp3')).sort((a, b) => a.localeCompare(b));
            }

            if (!q) {
                if (files.length === 0) {
                    
                    return naze.sendMessage(m.chat, { text: '⚠️ Tidak ada lagu galau di direktori lokal yang bisa dihapus.' }, { quoted: m });
                }
                let listMessage = `🎶 Daftar Lagu Galau Lokal 🎶\n\n`;
                listMessage += `${global.simbol.barisjudul}🎵 *Total:* \`${files.length} Lagu\`\n${global.simbol?.tutupjudul}\n`;
                files.forEach((file, index) => {
                    listMessage += `${global.simbol?.barisfitur || '-'} ${index + 1}. ${file.replace('.mp3', '')}\n`;
                });
                listMessage += `${global.simbol?.penutup || '---'}\n\n`;
                listMessage += `📌 *Catatan:* \nAnda hanya bisa menghapus lagu dari *directory lokal*.\n\nGunakan perintah:\n\`${m.prefix}${m.command} <nomor/nama>\`\n> nomor = sesuai nomor urut\n> nama = sesuai nama file`;
                
                return naze.sendMessage(m.chat, { text: listMessage }, { quoted: m });
            }

            let index;
            if (!isNaN(q)) {
                index = parseInt(q) - 1;
                if (index < 0 || index >= files.length) {
                    let listMessage = `*Nomor tidak valid!* Pilih nomor yang sesuai:\n\n`;
                    files.forEach((file, index) => {
                        listMessage += `${index + 1}. ${file.replace('.mp3', '')}\n`;
                    });
                    listMessage += `\nGunakan perintah:\n\`${m.prefix}${m.command} <nomor/nama>\`\n> nomor = sesuai nomor urut\n> nama = sesuai nama file`;
                    
                    return naze.sendMessage(m.chat, { text: listMessage }, { quoted: m });
                }
            } else {
                index = files.findIndex(item => item.toLowerCase().includes(q.toLowerCase()));
                if (index === -1) {
                    
                    return naze.sendMessage(m.chat, { text: `*Format salah!* Nama *${q}* tidak ditemukan di direktori lokal.\nGunakan perintah:\n\`${m.prefix}${m.command} <nomor/nama>\`\n> nomor = sesuai nomor urut\n> nama = sesuai nama file` }, { quoted: m });
                }
            }

            const fileName = files[index];
            const filePath = path.join(dirPath, fileName);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                
                await naze.sendMessage(m.chat, { text: `✅ File *${fileName}* telah dihapus.` }, { quoted: m });
            } else {
                
                await naze.sendMessage(m.chat, { text: `❌ File *${fileName}* tidak ditemukan.` }, { quoted: m });
            }
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};