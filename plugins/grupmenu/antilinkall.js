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
    name: 'antilinkall',
    alias: [],
    description: '<on/off>,<option>',
    run: async ({ naze, m }) => {
        

        const body = getMessageBody(m);

        let action = '';
        let option = '';
        let isButtonCommand = false;

        if (body === 'antilinkall_on_kick') {
            action = 'on';
            option = 'kick';
            isButtonCommand = true;
        } else if (body === 'antilinkall_on_delete') {
            action = 'on';
            option = 'delete';
            isButtonCommand = true;
        } else if (body === 'antilinkall_on_both') {
            action = 'on';
            option = 'both';
            isButtonCommand = true;
        } else if (body === 'antilinkall_off') {
            action = 'off';
            isButtonCommand = true;
        } else {
            const args = body.trim().split(/ +/).slice(1);
            const fullAction = args.join(' ').toLowerCase();
            if (fullAction.includes(',')) {
                [action, option] = fullAction.split(/ *, */);
            } else {
                action = fullAction;
            }
        }

        const botNumber = await naze.decodeJid(naze.user.id);
        const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

       if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        if (!m.isBotAdmin) return  global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);


        if (!global.db) global.db = {};
        if (!global.db.groups) global.db.groups = {};
        if (!global.db.groups[m.chat]) global.db.groups[m.chat] = {};

        global.db.groups[m.chat].antilinkall = {
            enabled: global.db.groups[m.chat].antilinkall?.enabled || false,
            delete: global.db.groups[m.chat].antilinkall?.delete || false,
            kick: global.db.groups[m.chat].antilinkall?.kick || false
        };

        const antilinkall = global.db.groups[m.chat].antilinkall;

        if (action === 'on' && option) {
            if (option === 'kick') {
                if (!antilinkall.kick) {
                    antilinkall.enabled = true;
                    antilinkall.delete = false;
                    antilinkall.kick = true;
                    
                    return m.reply(`Fitur antilinkall diaktifkan.
Tendang: ✅
Hapus: ❌

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,delete
> (hapus pesan yang berisi link grup)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
                } else {
                    
                    return m.reply(`Fitur antilinkall tendang sudah aktif.
Tendang: ✅
Hapus: ❌

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,delete
> (hapus pesan yang berisi link grup)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
                }
            }

            if (option === 'delete') {
                if (!antilinkall.delete) {
                    antilinkall.enabled = true;
                    antilinkall.delete = true;
                    antilinkall.kick = false;
                    
                    return m.reply(`Fitur antilinkall diaktifkan.
Tendang: ❌
Hapus: ✅

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim link grup)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
                } else {
                    
                    return m.reply(`Fitur antilinkall hapus pesan sudah aktif.
Tendang: ❌
Hapus: ✅

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim link grup)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
                }
            }

            if (option === 'both') {
                if (!antilinkall.delete || !antilinkall.kick) {
                    antilinkall.enabled = true;
                    antilinkall.delete = true;
                    antilinkall.kick = true;
                    
                    return m.reply(`Fitur antilinkall diaktifkan.
Tendang: ✅
Hapus: ✅

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,delete
> (hapus pesan yang berisi link grup)

${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim link grup)`);
                } else {
                    
                    return m.reply(`Fitur antilinkall hapus pesan dan tendang sudah aktif.
Tendang: ✅
Hapus: ✅

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,delete
> (hapus pesan yang berisi link grup)

${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim link grup)`);
                }
            }
        } else if (action === 'off') {
            if (!antilinkall.enabled) {
                
                return m.reply(`Fitur antilinkall sudah nonaktif.
Tendang: ❌
Hapus: ❌

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim link grup)

${m.prefix}${m.command} on,delete
> (hapus pesan yang berisi link grup)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
            }
            antilinkall.enabled = false;
            antilinkall.delete = false;
            antilinkall.kick = false;
            
            return m.reply(`Fitur antilinkall dinonaktifkan.
Tendang: ❌
Hapus: ❌

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim link grup)

${m.prefix}${m.command} on,delete
> (hapus pesan yang berisi link grup)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
        } else {
            
            return m.reply(`Format salah! Gunakan: 
\`${m.prefix}${m.command} <on/off,option>\`

Contoh:
${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim link grup)

${m.prefix}${m.command} on,delete
> (hapus pesan yang berisi link grup)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)

${m.prefix}${m.command} off
> (nonaktifkan fitur antilinkall)`);
        }
    }
};