require('../../settings');

module.exports = {
    name: 'accsingle',
    run: async ({ naze, m }) => {
        if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m); // Pesan wait dengan thumbnail
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m); // Pesan wait dengan thumbnail
        if (!m.isBotAdmin) return  global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m); // Pesan wait dengan thumbnail
        
        // Debugging: Log tipe pesan
        console.log('Message Type:', m.type);

        // Ambil body dengan prioritas interactiveResponseMessage
        let body = '';
        if (m.type === 'interactiveResponseMessage' && m.message.interactiveResponseMessage) {
            try {
                const paramsJson = m.message.interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson || '{}';
                const params = JSON.parse(paramsJson);
                body = params.id || ''; // Ambil ID button dari paramsJson
            } catch (err) {
                console.error('Error parsing interactiveResponseMessage paramsJson:', err);
            }
        } else if (m.type === 'buttonsResponseMessage' && m.message.buttonsResponseMessage) {
            body = m.message.buttonsResponseMessage.selectedButtonId || '';
        } else if (m.type === 'listResponseMessage' && m.message.listResponseMessage) {
            body = m.message.listResponseMessage.singleSelectReply.selectedRowId || '';
        } else if (m.type === 'templateButtonReplyMessage' && m.message.templateButtonReplyMessage) {
            body = m.message.templateButtonReplyMessage.selectedId || '';
        } else if (m.type === 'conversation') {
            body = m.message.conversation || '';
        } else if (m.type === 'extendedTextMessage') {
            body = m.message.extendedTextMessage.text || '';
        } else if (m.type === 'imageMessage' && m.message.imageMessage.caption) {
            body = m.message.imageMessage.caption || '';
        } else if (m.type === 'videoMessage' && m.message.videoMessage.caption) {
            body = m.message.videoMessage.caption || '';
        } else if (m.type === 'messageContextInfo') {
            body = (m.message.buttonsResponseMessage?.selectedButtonId || 
                    m.message.listResponseMessage?.singleSelectReply.selectedRowId || 
                    m.text) || '';
        } else if (m.type === 'editedMessage') {
            body = (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage?.text || 
                    m.message.editedMessage.message.protocolMessage.editedMessage.conversation) || '';
        }

        // Debugging: Log body
        console.log('Body:', body);

        // Parsing args
        const args = body.trim().split(/ +/).slice(1);

        // Debugging: Log args
        console.log('Args:', args);

        if (!args[0]) {
            return naze.sendMessage(m.chat, { text: '❌ Harap masukkan nomor yang akan diterima!' }, { quoted: m });
        }

        // Gunakan nomor langsung, tambahkan @s.whatsapp.net jika perlu
        const jid = args[0].includes('@s.whatsapp.net') ? args[0] : `${args[0]}@s.whatsapp.net`;

        try {
            await naze.groupRequestParticipantsUpdate(m.chat, [jid], 'approve');
            //await naze.sendMessage(m.chat, { text: `✅ ${args[0].split('@')[0]} telah diterima ke grup!` }, { quoted: m });
        } catch (err) {
            console.error('Error in accsingle:', err);
            await naze.sendMessage(m.chat, { text: '❌ Gagal menerima member!' }, { quoted: m });
        }
    }
};