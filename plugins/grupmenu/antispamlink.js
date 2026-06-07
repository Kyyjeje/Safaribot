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
    name: 'antispamlink',
    alias: ['antispamlink'],
    description: '<on/off>,<option>',
    run: async ({ naze, m }) => {
        

        const body = getMessageBody(m);

        let action = '';
        let option = '';
        let isButtonCommand = false;

        if (body === 'antispamlink_on_kick') {
            action = 'on';
            option = 'kick';
            isButtonCommand = true;
        } else if (body === 'antispamlink_on_delete') {
            action = 'on';
            option = 'delete';
            isButtonCommand = true;
        } else if (body === 'antispamlink_on_both') {
            action = 'on';
            option = 'both';
            isButtonCommand = true;
        } else if (body === 'antispamlink_off') {
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

        global.db.groups[m.chat].antispamlink = {
            enabled: global.db.groups[m.chat].antispamlink?.enabled || false,
            delete: global.db.groups[m.chat].antispamlink?.delete || false,
            kick: global.db.groups[m.chat].antispamlink?.kick || false,
            users: global.db.groups[m.chat].antispamlink?.users || {}
        };

        const antispamlink = global.db.groups[m.chat].antispamlink;

        if (action === 'on' && option) {
            if (option === 'kick') {
                if (!antispamlink.kick) {
                    antispamlink.enabled = true;
                    antispamlink.delete = false;
                    antispamlink.kick = true;
                    antispamlink.users = {};
                    
                    return m.reply(`Fitur antispamlink diaktifkan.
Tendang: ✅
Hapus: ❌

Gunakan salah satu perintah berikut:
\`${m.prefix}${m.command} on,delete\`
> (hapus pesan yang berisi tautan spam)

\`${m.prefix}${m.command} on,both\`
> (hapus pesan dan tendang pengirim)`);
                } else {
                    
                    return m.reply(`Fitur antispamlink tendang sudah aktif.
Tendang: ✅
Hapus: ❌

Gunakan salah satu perintah berikut:
\`${m.prefix}${m.command} on,delete\`
> (hapus pesan yang berisi tautan spam)

\`${m.prefix}${m.command} on,both\`
> (hapus pesan dan tendang pengirim)`);
                }
            }

            if (option === 'delete') {
                if (!antispamlink.delete) {
                    antispamlink.enabled = true;
                    antispamlink.delete = true;
                    antispamlink.kick = false;
                    antispamlink.users = {};
                    
                    return m.reply(`Fitur antispamlink diaktifkan.
Tendang: ❌
Hapus: ✅

Gunakan salah satu perintah berikut:
\`${m.prefix}${m.command} on,kick\`
> (tendang pengirim tautan spam)

\`${m.prefix}${m.command} on,both\`
> (hapus pesan dan tendang pengirim)`);
                } else {
                    
                    return m.reply(`Fitur antispamlink hapus pesan sudah aktif.
Tendang: ❌
Hapus: ✅

Gunakan salah satu perintah berikut:
\`${m.prefix}${m.command} on,kick\`
> (tendang pengirim tautan spam)

\`${m.prefix}${m.command} on,both\`
> (hapus pesan dan tendang pengirim)`);
                }
            }

            if (option === 'both') {
                if (!antispamlink.delete || !antispamlink.kick) {
                    antispamlink.enabled = true;
                    antispamlink.delete = true;
                    antispamlink.kick = true;
                    antispamlink.users = {};
                    
                    return m.reply(`Fitur antispamlink diaktifkan.
Tendang: ✅
Hapus: ✅

Gunakan salah satu perintah berikut:
\`${m.prefix}${m.command} on,delete\`
> (hapus pesan yang berisi tautan spam)

\`${m.prefix}${m.command} on,kick\`
> (tendang pengirim tautan spam)`);
                } else {
                    
                    return m.reply(`Fitur antispamlink hapus pesan dan tendang sudah aktif.
Tendang: ✅
Hapus: ✅

Gunakan salah satu perintah berikut:
\`${m.prefix}${m.command} on,delete\`
> (hapus pesan yang berisi tautan spam)

\`${m.prefix}${m.command} on,kick\`
> (tendang pengirim tautan spam)`);
                }
            }
        } else if (action === 'off') {
            if (!antispamlink.enabled) {
                
                return m.reply(`Fitur antispamlink sudah nonaktif.
Tendang: ❌
Hapus: ❌

Gunakan salah satu perintah berikut:
\`${m.prefix}${m.command} on,kick\`
> (tendang pengirim tautan spam)

\`${m.prefix}${m.command} on,delete\`
> (hapus pesan yang berisi tautan spam)

\`${m.prefix}${m.command} on,both\`
> (hapus pesan dan tendang pengirim)`);
            }
            antispamlink.enabled = false;
            antispamlink.delete = false;
            antispamlink.kick = false;
            antispamlink.users = {};
            
            return m.reply(`Fitur antispamlink dinonaktifkan.
Tendang: ❌
Hapus: ❌

Gunakan salah satu perintah berikut:
\`${m.prefix}${m.command} on,kick\`
> (tendang pengirim tautan spam)

\`${m.prefix}${m.command} on,delete\`
> (hapus pesan yang berisi tautan spam)

\`${m.prefix}${m.command} on,both\`
> (hapus pesan dan tendang pengirim)`);
        } else {
            
            return m.reply(`*Format salah!* Gunakan perintah:

\`${m.prefix}${m.command} on,kick\`
> (tendang pengirim tautan spam)

\`${m.prefix}${m.command} on,delete\`
> (hapus pesan yang berisi tautan spam)

\`${m.prefix}${m.command} on,both\`
> (hapus pesan dan tendang pengirim)

\`${m.prefix}${m.command} off\`
> (nonaktifkan fitur antispamlink)`);
        }
    }
};