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
    name: 'antitext',
    alias: [],
    run: async ({ naze, m }) => {
        

        const body = getMessageBody(m);

        let action = '';
        let option = '';
        let isButtonCommand = false;

        if (body === 'antitext_on_kick') {
            action = 'on';
            option = 'kick';
            isButtonCommand = true;
        } else if (body === 'antitext_on_delete') {
            action = 'on';
            option = 'delete';
            isButtonCommand = true;
        } else if (body === 'antitext_on_both') {
            action = 'on';
            option = 'both';
            isButtonCommand = true;
        } else if (body === 'antitext_off') {
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

        global.db.groups[m.chat].antitext = {
            enabled: global.db.groups[m.chat].antitext?.enabled || false,
            delete: global.db.groups[m.chat].antitext?.delete || false,
            kick: global.db.groups[m.chat].antitext?.kick || false
        };

        const antitext = global.db.groups[m.chat].antitext;

        if (action === 'on' && option) {
            if (option === 'kick') {
                if (!antitext.kick) {
                    antitext.enabled = true;
                    antitext.delete = false;
                    antitext.kick = true;
                    
                    return m.reply(`Fitur antitext diaktifkan.
Tendang: ✅
Hapus: ❌

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,delete
> (hapus pesan teks)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
                } else {
                    
                    return m.reply(`Fitur antitext tendang sudah aktif.
Tendang: ✅
Hapus: ❌

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,delete
> (hapus pesan teks)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
                }
            }
            if (option === 'delete') {
                if (!antitext.delete) {
                    antitext.enabled = true;
                    antitext.delete = true;
                    antitext.kick = false;
                    
                    return m.reply(`Fitur antitext diaktifkan.
Tendang: ❌
Hapus: ✅

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim teks)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
                } else {
                    
                    return m.reply(`Fitur antitext hapus pesan sudah aktif.
Tendang: ❌
Hapus: ✅

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim teks)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
                }
            }
            if (option === 'both') {
                if (!antitext.delete || !antitext.kick) {
                    antitext.enabled = true;
                    antitext.delete = true;
                    antitext.kick = true;
                    
                    return m.reply(`Fitur antitext diaktifkan.
Tendang: ✅
Hapus: ✅

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,delete
> (hapus pesan teks)

${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim teks)`);
                } else {
                    
                    return m.reply(`Fitur antitext hapus pesan dan tendang sudah aktif.
Tendang: ✅
Hapus: ✅

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,delete
> (hapus pesan teks)

${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim teks)`);
                }
            }
        } else if (action === 'off') {
            if (!antitext.enabled) {
                
                return m.reply(`Fitur antitext sudah nonaktif.
Tendang: ❌
Hapus: ❌

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim teks)

${m.prefix}${m.command} on,delete
> (hapus pesan teks)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
            }
            antitext.enabled = false;
            antitext.delete = false;
            antitext.kick = false;
            
            return m.reply(`Fitur antitext dinonaktifkan.
Tendang: ❌
Hapus: ❌

Gunakan salah satu perintah berikut:
${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim teks)

${m.prefix}${m.command} on,delete
> (hapus pesan teks)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)`);
        } else {
            
            return m.reply(`Format salah! Gunakan: 
\`${m.prefix}${m.command} <on/off,option>\`

Contoh:
${m.prefix}${m.command} on,kick
> (tendang anggota yang mengirim teks)

${m.prefix}${m.command} on,delete
> (hapus pesan teks)

${m.prefix}${m.command} on,both
> (hapus pesan dan tendang anggota)

${m.prefix}${m.command} off
> (nonaktifkan fitur antitext)`);
        }
    }
};