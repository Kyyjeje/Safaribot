require('../../settings');

module.exports = {
    name: 'spamuser',
    alias: ['spamuser'],
    description: '<nomor>,<teks>,<jumlah>',
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
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <nomor/grup>,<teks>,<jumlah>\`\n> Contoh: \`${m.prefix}${m.command} 6281234567890,hai,100\`\n> \`${m.prefix}${m.command} 120363198691979061@g.us,halo,100\`` }, { quoted: m });
            }

            const [target, message, count] = text.split(',').map(s => s.trim());
            if (!target || !message || !count) {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <nomor/grup>,<teks>,<jumlah>\`\n> Contoh: \`${m.prefix}${m.command} 6281234567890,hai,100\`\n> \`${m.prefix}${m.command} 120363198691979061@g.us,halo,100\`` }, { quoted: m });
            }

            const numMessages = parseInt(count, 10);
            if (isNaN(numMessages) || numMessages <= 0) {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Jumlah pesan harus berupa angka positif.\n\nGunakan perintah:\n\`${m.prefix}${m.command} <nomor/grup>,<teks>,<jumlah>\`\n> Contoh: \`${m.prefix}${m.command} 6281234567890,hai,100\`` }, { quoted: m });
            }

            const sendMessages = async () => {
                const startTime = new Date();
                for (let i = 0; i < numMessages; i++) {
                    await naze.sendMessage(target.includes('@g.us') ? target : `${target}@s.whatsapp.net`, { text: message });
                }
                const endTime = new Date();
                return (endTime - startTime) / 1000;
            };

            await naze.sendMessage(m.chat, { text: `_Mulai mengirim ${numMessages} pesan ke ${target}_` }, { quoted: m });
            const duration = await sendMessages();
            
            await naze.sendMessage(m.chat, { text: `Berhasil mengirim ${numMessages} pesan ke ${target}\n dalam waktu: ${duration.toFixed(2)} detik.` }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};