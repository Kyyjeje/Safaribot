require('../../settings');

module.exports = {
    name: 'kick',
    alias: ['kick', '.kick'],
    description: '<nomor/@lid/reply>',
    run: async ({ naze, m, q }) => {
        if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

        try {
            const body = (m.type === 'conversation') ? m.message.conversation :
                        (m.type === 'imageMessage') ? m.message.imageMessage.caption :
                        (m.type === 'videoMessage') ? m.message.videoMessage.caption :
                        (m.type === 'extendedTextMessage') ? m.message.extendedTextMessage.text :
                        (m.type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId :
                        (m.type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                        (m.type === 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId :
                        (m.type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) :
                        (m.type === 'editedMessage') ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage?.text || m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
            const args = body ? body.trim().split(/ +/).slice(1) : [];
            const text = q || args.join(' ') || '';

            const groupMetadata = await naze.groupMetadata(m.chat);
            const participants = groupMetadata.participants || [];

            let targets = [];
            if (!text && !m.quoted) {
                return m.reply(`*Format salah!*\nGunakan:\n- Tag: \`.kick @lid1 @lid2\`\n- Nomor: \`.kick 628xxxx,628yyyy\`\n- Atau reply pesan target`);
            }

            if (text.includes('@')) {
                // Kalau ada @ → berarti tag → pisah pakai spasi
                targets = text.trim().split(/\s+/);
            } else {
                // Kalau tidak ada @ → berarti input nomor → pisah pakai koma
                targets = text.trim().split(',').map(t => t.trim());
            }

            // Kalau tidak ada target tapi reply
            if (!targets.length && m.quoted?.sender) {
                targets.push(m.quoted.sender.split('@')[0]);
            }

            let berhasil = 0;
            let gagal = 0;
            let taggedUsers = [];

            for (let i = 0; i < targets.length; i++) {
                let target = targets[i];
                let lid = null;

                if (target.startsWith('@')) {
                    // Tag by lid
                    const taggedLid = m.mentions?.find(mention => mention.startsWith(target.replace('@', '') + '@'));
                    lid = taggedLid ? taggedLid.split('@')[0] : target.replace('@', '');
                } else {
                    // Nomor WA
                    target = target.replace(/[\+\-\s]/g, '');
                    lid = target;
                }

                const jid = participants.find(p => p.lid === `${lid}@lid`)?.jid || `${lid}@s.whatsapp.net`;

                try {
                    if (i > 0) await new Promise(resolve => setTimeout(resolve, 3000));
                    await naze.groupParticipantsUpdate(m.chat, [jid], 'remove');
                    berhasil++;
                    taggedUsers.push(jid); // Untuk mention
                } catch {
                    gagal++;
                }
            }

            const resultMsg = `✅ *Kick selesai*\n\n` +
                              `🧹 Berhasil kick: *${berhasil}*\n` +
                              `❌ Gagal kick: *${gagal}*` +
                              (taggedUsers.length ? `\n\n👋 Bye: ${taggedUsers.map(j => `@${j.split('@')[0]}`).join(', ')}` : '');

            await naze.sendMessage(m.chat, {
                text: resultMsg,
                mentions: taggedUsers
            }, { quoted: m });

        } catch (err) {
            await m.reply(`Gagal mengeluarkan pengguna dari grup.`);
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};
