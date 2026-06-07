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
    name: 'antihidetag',
    alias: ['antiht'],
    description: '<on/off,option>',
    run: async ({ naze, m }) => {
        const body = getMessageBody(m);

        let action = '';
        let option = '';
        let isButtonCommand = false;

        if (body === 'antihidetag_on_kick') {
            action = 'on';
            option = 'kick';
            isButtonCommand = true;
        } else if (body === 'antihidetag_on_delete') {
            action = 'on';
            option = 'delete';
            isButtonCommand = true;
        } else if (body === 'antihidetag_on_both') {
            action = 'on';
            option = 'both';
            isButtonCommand = true;
        } else if (body === 'antihidetag_off') {
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
        if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

        if (!global.db) global.db = {};
        if (!global.db.groups) global.db.groups = {};
        if (!global.db.groups[m.chat]) global.db.groups[m.chat] = {};

        global.db.groups[m.chat].antihidetag = {
            enabled: global.db.groups[m.chat].antihidetag?.enabled || false,
            delete: global.db.groups[m.chat].antihidetag?.delete || false,
            kick: global.db.groups[m.chat].antihidetag?.kick || false
        };

        const antihidetag = global.db.groups[m.chat].antihidetag;

        if (action === 'on' && option) {
            if (option === 'kick') {
                if (!antihidetag.kick) {
                    antihidetag.enabled = true;
                    antihidetag.delete = false;
                    antihidetag.kick = true;
                    
                    return m.reply(`Fitur antihidetag diaktifkan.
Tendang: ✅
Hapus: ❌

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,delete
> (hapus pesan hidetag)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
                } else {
                    return m.reply(`Fitur antihidetag tendang sudah aktif.
Tendang: ✅
Hapus: ❌

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,delete
> (hapus pesan hidetag)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
                }
            }

            if (option === 'delete') {
                if (!antihidetag.delete) {
                    antihidetag.enabled = true;
                    antihidetag.delete = true;
                    antihidetag.kick = false;
                    
                    return m.reply(`Fitur antihidetag diaktifkan.
Tendang: ❌
Hapus: ✅

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim hidetag)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
                } else {
                    return m.reply(`Fitur antihidetag hapus pesan sudah aktif.
Tendang: ❌
Hapus: ✅

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim hidetag)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
                }
            }

            if (option === 'both') {
                if (!antihidetag.delete || !antihidetag.kick) {
                    antihidetag.enabled = true;
                    antihidetag.delete = true;
                    antihidetag.kick = true;
                    
                    return m.reply(`Fitur antihidetag diaktifkan.
Tendang: ✅
Hapus: ✅

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,delete
> (hapus pesan hidetag)

${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim hidetag)`);
                } else {
                    return m.reply(`Fitur antihidetag hapus pesan dan tendang sudah aktif.
Tendang: ✅
Hapus: ✅

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,delete
> (hapus pesan hidetag)

${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim hidetag)`);
                }
            }
        } else if (action === 'off') {
            if (!antihidetag.enabled) {
                return m.reply(`Fitur antihidetag sudah nonaktif.
Tendang: ❌
Hapus: ❌

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim hidetag)

${m.prefix}${m.command} on,delete
> (hapus pesan hidetag)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
            }
            antihidetag.enabled = false;
            antihidetag.delete = false;
            antihidetag.kick = false;
            
            return m.reply(`Fitur antihidetag dinonaktifkan.
Tendang: ❌
Hapus: ❌

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim hidetag)

${m.prefix}${m.command} on,delete
> (hapus pesan hidetag)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
        } else {
            return m.reply(`Format salah! Gunakan: 
\`${m.prefix}${m.command} <on/off,option>\`

Contoh:
${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim hidetag)

${m.prefix}${m.command} on,delete
> (hapus pesan hidetag)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)

${m.prefix}${m.command} off
> (nonaktifkan fitur antihidetag)`);
        }
    }
};