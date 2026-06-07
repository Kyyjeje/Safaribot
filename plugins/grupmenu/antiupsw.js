require('../../settings');
const axios = require("axios");

function getMessageBody(m) {
    const messageHandlers = {
        conversation: () => m.message.conversation,
        imageMessage: () => m.message.imageMessage.caption,
        videoMessage: () => m.message.videoMessage.caption,
        extendedTextMessage: () => m.message.extendedTextMessage.text,
        buttonsResponseMessage: () => m.message.buttonsResponseMessage.selectedButtonId || '',
        listResponseMessage: () => m.message.listResponseMessage.singleSelectReply.selectedRowId || '',
        templateButtonReplyMessage: () => m.message.templateButtonReplyMessage.selectedId || '',
        interactiveResponseMessage: () => {
            const nativeFlowResponse = m.message.interactiveResponseMessage?.nativeFlowResponseMessage;
            return nativeFlowResponse && nativeFlowResponse.paramsJson ? JSON.parse(nativeFlowResponse.paramsJson).id || '' : '';
        },
        messageContextInfo: () => m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text || '',
        editedMessage: () => {
            const edited = m.message.editedMessage.message.protocolMessage.editedMessage;
            return edited.extendedTextMessage ? edited.extendedTextMessage.text : edited.conversation || '';
        }
    };

    return messageHandlers[m.type]?.() || '';
}

module.exports = {
    name: 'antiupsw',
    alias: [],
    description: '<on/off>,<option>',
    run: async ({ naze, m }) => {
        

        const body = getMessageBody(m);

        let action = '';
        let option = '';
        const args = body.trim().split(/ +/).slice(1);
        const fullAction = args.join(' ').toLowerCase();
        if (fullAction.includes(',')) {
            [action, option] = fullAction.split(/ *, */);
        } else {
            action = fullAction;
        }

        const botNumber = await naze.decodeJid(naze.user.id);
        const isAdmin = m.metadata.participants.find(p => p.id === m.sender)?.admin;
        if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        if (!m.isBotAdmin) return  global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);


        if (!global.db) global.db = {};
        if (!global.db.groups) global.db.groups = {};
        if (!global.db.groups[m.chat]) global.db.groups[m.chat] = {};

        global.db.groups[m.chat].antiupsw = {
            enabled: global.db.groups[m.chat].antiupsw?.enabled || false,
            delete: global.db.groups[m.chat].antiupsw?.delete || false,
            kick: global.db.groups[m.chat].antiupsw?.kick || false
        };

        const antiupsw = global.db.groups[m.chat].antiupsw;

        if (action === 'on' && option) {
            if (option === 'kick') {
                if (!antiupsw.kick) {
                    antiupsw.enabled = true;
                    antiupsw.delete = false;
                    antiupsw.kick = true;
                    
                    return m.reply(`Fitur antiupsw diaktifkan.
Tendang: ✅
Hapus: ❌

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,delete
> (hapus pesan status)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
                } else {
                    
                    return m.reply(`Fitur antiupsw tendang sudah aktif.
Tendang: ✅
Hapus: ❌

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,delete
> (hapus pesan status)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
                }
            }

            if (option === 'delete') {
                if (!antiupsw.delete) {
                    antiupsw.enabled = true;
                    antiupsw.delete = true;
                    antiupsw.kick = false;
                    
                    return m.reply(`Fitur antiupsw diaktifkan.
Tendang: ❌
Hapus: ✅

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim status)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
                } else {
                    
                    return m.reply(`Fitur antiupsw hapus pesan sudah aktif.
Tendang: ❌
Hapus: ✅

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim status)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
                }
            }

            if (option === 'both') {
                if (!antiupsw.delete || !antiupsw.kick) {
                    antiupsw.enabled = true;
                    antiupsw.delete = true;
                    antiupsw.kick = true;
                    
                    return m.reply(`Fitur antiupsw diaktifkan.
Tendang: ✅
Hapus: ✅

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,delete
> (hapus pesan status)

${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim status)`);
                } else {
                    
                    return m.reply(`Fitur antiupsw hapus pesan dan tendang sudah aktif.
Tendang: ✅
Hapus: ✅

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,delete
> (hapus pesan status)

${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim status)`);
                }
            }
        } else if (action === 'off') {
            if (!antiupsw.enabled) {
                
                return m.reply(`Fitur antiupsw sudah nonaktif.
Tendang: ❌
Hapus: ❌

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim status)

${m.prefix}${m.command} on,delete
> (hapus pesan status)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
            }
            antiupsw.enabled = false;
            antiupsw.delete = false;
            antiupsw.kick = false;
            
            return m.reply(`Fitur antiupsw dinonaktifkan.
Tendang: ❌
Hapus: ❌

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim status)

${m.prefix}${m.command} on,delete
> (hapus pesan status)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
        } else {
            
            return m.reply(`Format salah! Gunakan: 
\`${m.prefix}${m.command} <on/off,option>\`

Contoh:
${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim status)

${m.prefix}${m.command} on,delete
> (hapus pesan status)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)

${m.prefix}${m.command} off
> (nonaktifkan fitur antiupsw)`);
        }
    }
};