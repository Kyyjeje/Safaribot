const fs = require('fs');
const path = require('path');
require('../../settings');

const blockUserPath = path.join(__dirname, '../../database/block_user.json');

if (!fs.existsSync(blockUserPath)) {
    fs.writeFileSync(blockUserPath, JSON.stringify([]), 'utf-8');
}

const saveBlockedUsers = () => {
    fs.writeFileSync(blockUserPath, JSON.stringify([...global.blockedChats], null, 2));
};

module.exports = {
    name: 'banned',
    alias: ['blockchat', 'ban', 'banned', 'bc', '.blockchat', '.ban', '.banned', '.bc'],
    description: '<reply/tag/nomor>',
    run: async ({ naze, m }) => {
        try {
            const botNumber = await naze.decodeJid(naze.user.id);
            const sender = m.sender;
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(sender);

            if (!isOwner) {
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            // Identifikasi target user (via reply, tag, atau nomor)
            let targetUser = null;
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
            const input = args.join(' ').trim();

            if (m.quoted && m.quoted.sender1) {
                targetUser = m.quoted.sender1;
            } else if (m.mentionedJid && m.mentionedJid.length > 0) {
                targetUser = m.mentionedJid[0];
            } else if (input) {
                const phoneMatch = input.match(/(\+?\d{10,15})/);
                if (phoneMatch) {
                    targetUser = phoneMatch[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                }
            }

            if (!targetUser) {
                return naze.sendMessage(m.chat, {
                    text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <reply/tag/nomor>\`\n> Contoh: \`${m.prefix}${m.command} @6281234567890\`\n> Atau reply pesan seseorang`,
                }, { quoted: m });
            }

            // Validasi target user
            if ([sender, botNumber].includes(targetUser)) {
                return naze.sendMessage(m.chat, { text: `⚠️ Tidak bisa memblokir diri sendiri atau bot!` }, { quoted: m });
            }

            // Proses pemblokiran
            let blockedNow = [];
            let alreadyBlocked = [];

            if (global.blockedChats.has(targetUser)) {
                alreadyBlocked.push(targetUser.replace('@s.whatsapp.net', ''));
            } else {
                global.blockedChats.add(targetUser);
                blockedNow.push(targetUser.replace('@s.whatsapp.net', ''));
            }

            saveBlockedUsers();

            let replyMsg = '';
            if (blockedNow.length) replyMsg += `✅ Berhasil diblokir:\n${blockedNow.join('\n')}\n\n`;
            if (alreadyBlocked.length) replyMsg += `⚠️ Sudah diblokir sebelumnya:\n${alreadyBlocked.join('\n')}\n\n`;

            await naze.sendMessage(m.chat, { text: replyMsg || 'Tidak ada nomor yang diproses.', mentions: blockedNow.map(num => num + '@s.whatsapp.net') }, { quoted: m });
        } catch (err) {
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};