require('../../settings');

module.exports = {
    name: 'auto-absen-enable',
    alias: ['auto-absen-enable', 'autoabsen','auto-absen','absenauto'],
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

        let action = '';
        let isButtonCommand = false;

        if (body === 'autoabsen_on') {
            action = 'on';
            isButtonCommand = true;
        } else if (body === 'autoabsen_off') {
            action = 'off';
            isButtonCommand = true;
        } else {
            const args = body.trim().split(/ +/).slice(1);
            action = args.join(' ').toLowerCase();
        }

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
                if (global.db.groups[m.chat].autoabsen) {
                    
                    return m.reply('*Sudah Aktif Sebelumnya*');
                }
                global.db.groups[m.chat].autoabsen = true;
                
                await m.reply('*Auto-Absen Aktif!* Polling absen akan otomatis muncul setiap hari pada pukul 07:00 WIB.');
            } else if (action === 'off') {
                if (!global.db.groups[m.chat].autoabsen) {
                    
                    return m.reply('*Sudah Nonaktif Sebelumnya*');
                }
                global.db.groups[m.chat].autoabsen = false;
                
                await m.reply('*Auto-Absen Tidak Aktif!*');
            } else {
                
                return m.reply(`*Format salah!*\nGunakan perintah:\n➜ *${m.prefix}${m.command} on* _(untuk mengaktifkan)_\n➜ *${m.prefix}${m.command} off* _(untuk menonaktifkan)_`);
            }
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};