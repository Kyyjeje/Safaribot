require('../../settings');

module.exports = {
    name: 'leave',
    alias: ['leave'],
    description: '',
    run: async ({ naze, m }) => {
        try {
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            const body = (m.type === 'conversation') ? m.message.conversation : 
                         (m.type === 'imageMessage') ? m.message.imageMessage.caption : 
                         (m.type === 'videoMessage') ? m.message.videoMessage.caption : 
                         (m.type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                         (m.type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
                         (m.type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : 
                         (m.type === 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : 
                         (m.type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : 
                         (m.type === 'editedMessage') ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage?.text || m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
            const args = body.trim().split(/ +/).slice(1);
            const text = args.join(' ');

            let targetJid;
            if (!text) {
                return m.reply('🚨 *Format Salah, Yang Mulia!*\nGunakan:\n- `leave gc` untuk keluar dari grup ini\n- `leave <jid grup>` (contoh: 123456789@g.us)\n- `leave <url grup>` (contoh: https://chat.whatsapp.com/ABC123xyz)');
            } else if (text.toLowerCase() === 'gc') {
                // Keluar dari grup tempat perintah dijalankan
                targetJid = m.chat;
                // Pastikan m.chat adalah grup sebelum melanjutkan
                const groupMetadata = await naze.groupMetadata(m.chat).catch(() => null);
                if (!groupMetadata) {
                    return m.reply('🚨 Ini bukan grup, Yang Mulia.');
                }
            } else {
                // Ekstrak JID atau URL grup
                if (text.includes('https://chat.whatsapp.com/')) {
                    const inviteCode = text.split('https://chat.whatsapp.com/')[1].split(' ')[0];
                    if (!inviteCode) {
                        return m.reply('🚨 Kode invite grup tidak ditemukan di URL, Yang Mulia.\nContoh: leave https://chat.whatsapp.com/ABC123xyz');
                    }
                    const groupMetadata = await naze.groupGetInviteInfo(inviteCode).catch(() => null);
                    if (!groupMetadata || !groupMetadata.id) {
                        return m.reply('🚨 URL grup tidak valid atau bot tidak bisa mengakses, Yang Mulia.');
                    }
                    targetJid = groupMetadata.id;
                } else if (text.endsWith('@g.us')) {
                    targetJid = text;
                    // Verifikasi JID grup
                    const groupMetadata = await naze.groupMetadata(targetJid).catch(() => null);
                    if (!groupMetadata) {
                        return m.reply('🚨 JID grup tidak valid, Yang Mulia.');
                    }
                } else {
                    return m.reply('🚨 *Format Salah, Yang Mulia!*\nGunakan:\n- `leave gc` untuk keluar dari grup ini\n- `leave <jid grup>` (contoh: 123456789@g.us)\n- `leave <url grup>` (contoh: https://chat.whatsapp.com/ABC123xyz)');
                }
            }
            // Kirim pesan tunduk dengan tag owner sebelum keluar
            await m.reply({
                text: `⚜️ *Hamba mematuhi perintah, Yang Mulia @${m.sender.split('@')[0]}!* Dengan segala hormat, hamba akan meninggalkan grup ini atas perintah Anda.`,
                contextInfo: {
                    mentionedJid: [m.sender]
                }
            });
            await naze.groupLeave(targetJid);
            await naze.sendFromOwner(global.owner, '✅ Sukses keluar dari grup', m, { contextInfo: { isForwarded: true } });
        } catch (err) {
            await naze.sendFromOwner(global.owner, '❌ Gagal keluar dari grup, Yang Mulia.', m, { contextInfo: { isForwarded: true } });
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};