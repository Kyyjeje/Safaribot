require('../../settings');

module.exports = {
    name: "spamchat",
    description: "<jumlah>|<pesan>",
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
                         m.type === 'editedMessage' ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage ? m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage.text : m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
            const args = body.trim().split(/ +/).slice(1);
            const input = args.join(' ').split('|').map(item => item.trim());

            if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
            if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);

            if (input.length < 2) return naze.sendMessage(m.chat, { text: `⚠️ Format salah. Gunakan: \`${m.prefix}${m.command} <jumlah>|<pesan>\`\nContoh: \`${m.prefix}${m.command} 3|Halo @tag, apa kabar?\`` }, { quoted: m });

            const jumlah = parseInt(input[0]);
            const pesan = input[1];

            if (isNaN(jumlah) || jumlah < 1) return naze.sendMessage(m.chat, { text: "⚠️ Jumlah pesan harus angka positif." }, { quoted: m });
            if (jumlah > 10) return naze.sendMessage(m.chat, { text: "⚠️ Maksimum 10 pesan untuk mencegah spam berlebihan." }, { quoted: m });
            if (!pesan) return naze.sendMessage(m.chat, { text: "⚠️ Pesan tidak boleh kosong." }, { quoted: m });

            let nama;
            let targetJid;

            if (m.quoted && m.quoted.sender) {
                targetJid = m.quoted.sender;
                nama = `@${targetJid.split("@")[0]}`;
            } else if (m.mentionedJid?.length) {
                targetJid = m.mentionedJid[0];
                nama = `@${targetJid.split("@")[0]}`;
            } else {
                targetJid = m.sender;
                nama = `@${m.sender.split("@")[0]}`;
            }

            const finalMessage = pesan.replace(/@tag/gi, nama);

            for (let i = 0; i < jumlah; i++) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                await naze.sendMessage(m.chat, {
                    text: finalMessage,
                    mentions: [targetJid]
                });
            }

            await naze.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        } catch (e) {
            await naze.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};