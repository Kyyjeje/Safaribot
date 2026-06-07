const fs = require('fs');
require('../../settings');

const isUrl = (url) => {
    return url.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi);
};

const clockString = (ms) => {
    if (ms === 0) return 'permanen';
    let days = Math.floor(ms / (24 * 60 * 60 * 1000));
    let hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    let minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    let seconds = Math.floor((ms % (60 * 1000)) / 1000);
    let result = [];
    if (days > 0) result.push(`${days} hari`);
    if (hours > 0) result.push(`${hours} jam`);
    if (minutes > 0) result.push(`${minutes} menit`);
    if (seconds > 0 && days === 0 && hours === 0 && minutes === 0) result.push(`${seconds} detik`);
    return result.length > 0 ? result.join(' ') : 'sebentar';
};

module.exports = {
    name: 'delsewa',
    alias: ['delsewa', 'removesewa'],
    description: '<jid/url grup>',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            

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

            if (!text) {
                if (!global.db.sewabot || Object.keys(global.db.sewabot).length === 0) {
                    
                    return naze.sendMessage(m.chat, { text: '⚠️ Tidak ada grup yang sedang menyewa bot saat ini.' }, { quoted: m });
                }

                let listMsg = `${global.simbol.barisjudul}📋 *Daftar Grup Sewa Bot*\n${global.simbol.tutupjudul}\n`;
                Object.entries(global.db.sewabot).forEach(([groupId, data], index) => {
                    listMsg += `${index + 1}. 🔗 *URL*: ${data.url}\n`;
                    listMsg += `   🆔 *ID*: ${groupId}\n`;
                    listMsg += `   ⏰ *Durasi*: ${clockString(data.expired - data.joinedAt)}\n`;
                    listMsg += `   📅 *Berakhir*: ${data.expired === 0 ? 'Permanen' : new Date(data.expired).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n`;
                });
                listMsg += `${global.simbol.penutup}\n*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <url_grup/id_grup>\`\n> Contoh: \`${m.prefix}${m.command} https://chat.whatsapp.com/xxx\`\n> atau \`${m.prefix}${m.command} 123456789@g.us\``;
                
                return naze.sendMessage(m.chat, { text: listMsg }, { quoted: m });
            }

            let groupId;
            if (isUrl(text) && text.includes('whatsapp.com')) {
                const inviteCode = text.split('https://chat.whatsapp.com/')[1];
                try {
                    const groupInfo = await naze.groupGetInviteInfo(inviteCode);
                    groupId = groupInfo.id;
                } catch (res) {
                    
                    if (res.data == 400 || res.data == 406) return naze.sendMessage(m.chat, { text: '❌ Grup tidak ditemukan!' }, { quoted: m });
                    if (res.data == 410) return naze.sendMessage(m.chat, { text: '🔄 Link grup telah direset!' }, { quoted: m });
                    return naze.sendMessage(m.chat, { text: `❌ Gagal mendapatkan info grup: ${res.message || 'Unknown error'}` }, { quoted: m });
                }
            } else if (text.includes('@g.us')) {
                groupId = text.trim();
            } else {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <url_grup/id_grup>\`\n> Contoh: \`${m.prefix}${m.command} https://chat.whatsapp.com/xxx\`\n> atau \`${m.prefix}${m.command} 123456789@g.us\`` }, { quoted: m });
            }

            if (!global.db.sewabot || !global.db.sewabot[groupId]) {
                
                return naze.sendMessage(m.chat, { text: '❌ Grup tidak ditemukan di database sewa bot!' }, { quoted: m });
            }

            const groupUrl = global.db.sewabot[groupId].url;
            delete global.db.sewabot[groupId];

            await fs.promises.writeFile('./database.json', JSON.stringify(global.db, null, 2));
            const successMsg = `${global.simbol.barisjudul}✅ *Berhasil menghapus status sewa!*\n` +
                               `${global.simbol.tutupjudul}\n` +
                               `- 🔗 *Grup*: ${groupUrl}\n` +
                               `- 🆔 *ID Grup*: ${groupId}\n` +
                               `${global.simbol.penutup}\n\n` +
                               `Bot tetap berada di grup, tetapi status sewa telah dihapus.`;
            
            await naze.sendMessage(m.chat, { text: successMsg }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};