require('../../settings');

module.exports = {
    name: 'rejectall',
    alias: ['.rejectall'],
    run: async ({ naze, m }) => {
        if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m); // Pesan wait dengan thumbnail
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m); // Pesan wait dengan thumbnail
        if (!m.isBotAdmin) return  global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m); // Pesan wait dengan thumbnail
        
        const body = (m.type === 'conversation') ? m.message.conversation : (m.type == 'imageMessage') ? m.message.imageMessage.caption : (m.type == 'videoMessage') ? m.message.videoMessage.caption : (m.type == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.type == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.type == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.type == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : (m.type === 'editedMessage') ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage ? m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage.text : m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
        const args = body.trim().split(/ +/).slice(1);

        const quoted = m.quoted ? m.quoted : m;
        const text = args.join(' ');


        let response;
        try {
            response = await naze.groupRequestParticipantsList(m.chat);
        } catch (err) {
            return naze.sendMessage(m.chat, { text: '❌ Gagal mengambil daftar permintaan bergabung!' }, { quoted: m });
        }

        if (!response || response.length === 0) {
            return naze.sendMessage(m.chat, { text: '📭 Tidak ada permintaan bergabung saat ini.' }, { quoted: m });
        }

        const jids = response.map(req => req.jid);
        try {
            await naze.groupRequestParticipantsUpdate(m.chat, jids, 'reject');
            //await naze.sendMessage(m.chat, { text: `✅ ${jids.length} member telah diterima ke grup!` }, { quoted: m });
        } catch (err) {
            await naze.sendMessage(m.chat, { text: '❌ Gagal menerima semua member!' }, { quoted: m });
        }
    }
};