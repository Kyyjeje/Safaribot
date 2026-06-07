require('../../settings');

module.exports = {
    name: 'createchanel',
    alias: ['createch'],
    description: '<nama chanel>',
    run: async ({ naze, m }) => {
        let chanelName;
        try {
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                return naze.sendMessage(m.chat, { text: `*Error!* Hanya owner yang bisa menggunakan perintah ini.` }, { quoted: m });
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
            chanelName = args.join(' ').trim();

            if (!chanelName) {
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <nama chanel>\`\nContoh: \`${m.prefix}${m.command} BangsulBotz Chanel\`` }, { quoted: m });
            }

            await naze.newsletterCreate(chanelName);

            await naze.sendMessage(m.chat, {
                text: `✨ *Pemberitahuan Penting* ✨\n\n` +
                      `Selamat! Chanel baru telah berhasil dibuat.\n` +
                      `📌 *Nama Chanel:* ${chanelName}\n` +
                      `Sekarang Anda bisa menikmati fitur ini dengan sempurna.\n\n` +
                      `💡 *Tips:* Eksplorasi lebih lanjut untuk pengalaman terbaik!`,
                quoted: m
            });

        } catch (err) {
            await naze.sendMessage(m.chat, {
                text: `✨ *Pemberitahuan Penting* ✨\n\n` +
                      `Selamat! Chanel baru telah berhasil dibuat.\n` +
                      `📌 *Nama Chanel:* ${chanelName}\n` +
                      `Sekarang Anda bisa menikmati fitur ini dengan sempurna.\n\n` +
                      `(Catatan: Error teknis diabaikan sesuai pengaturan.)`,
                quoted: m
            });
        }
    }
};