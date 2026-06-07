require('../../settings');

module.exports = {
    name: 'autojoingc',
    alias: ['autojoingc'],
    description: '<on/off>',
    run: async ({ naze, m }) => {
        let body = '';
        if (m.type === 'conversation') body = m.message.conversation;
        else if (m.type === 'imageMessage') body = m.message.imageMessage.caption;
        else if (m.type === 'videoMessage') body = m.message.videoMessage.caption;
        else if (m.type === 'extendedTextMessage') body = m.message.extendedTextMessage.text;
        else if (m.type === 'buttonsResponseMessage') body = m.message.buttonsResponseMessage.selectedButtonId || '';
        else if (m.type === 'listResponseMessage') body = m.message.listResponseMessage.singleSelectReply.selectedRowId || '';
        else if (m.type === 'templateButtonReplyMessage') body = m.message.templateButtonReplyMessage.selectedId || '';
        else if (m.type === 'interactiveResponseMessage') {
            const nativeFlowResponse = m.message.interactiveResponseMessage?.nativeFlowResponseMessage;
            if (nativeFlowResponse && nativeFlowResponse.paramsJson) {
                const params = JSON.parse(nativeFlowResponse.paramsJson);
                body = params.id || '';
            }
        } else if (m.type === 'messageContextInfo') body = (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) || '';
        else if (m.type === 'editedMessage') body = (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage ? m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage.text : m.message.editedMessage.message.protocolMessage.editedMessage.conversation) || '';

        const args = body.trim().split(/ +/).slice(1);
        const action = args.join(' ').toLowerCase();

        const botNumber = await naze.decodeJid(naze.user.id);
        const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

        

        if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

        if (!global.db) global.db = {};
        if (!global.db.groups) global.db.groups = {};
        if (!global.db.groups[m.chat]) global.db.groups[m.chat] = {};

        try {
            if (action === 'on') {
                if (global.db.groups[m.chat].autojoingc) {
                    
                    return m.reply('*Auto Join Grup Sudah Aktif Sebelumnya*');
                }
                global.db.groups[m.chat].autojoingc = true;
                
                await m.reply('*Auto Join Grup Aktif!*');
            } else if (action === 'off') {
                if (!global.db.groups[m.chat].autojoingc) {
                    
                    return m.reply('*Auto Join Grup Sudah Nonaktif Sebelumnya*');
                }
                global.db.groups[m.chat].autojoingc = false;
                
                await m.reply('*Auto Join Grup Tidak Aktif!*');
            } else {
                
                return m.reply(`*Format salah!* Gunakan perintah:\n\`${m.prefix}${m.command} on\` \n> (untuk mengaktifkan)\n\n\`${m.prefix}${m.command} off\` \n> (untuk menonaktifkan)`);
            }
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};