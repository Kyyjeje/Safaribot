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

// Fungsi cek admin dengan support jid/lid
function checkAdmin(participants, target) {
    return participants.some(p =>
        (p.jid === target || p.id === target || p.lid === target) && p.admin
    );
}

module.exports = {
    name: 'antivirtex',
    alias: ['antivirtex'],
    description: '<on/off>,<option>',
    run: async ({ naze, m }) => {
        const body = getMessageBody(m);

        let action = '';
        let option = '';
        let isButtonCommand = false;

        if (body === 'antivirtex_on_kick') {
            action = 'on';
            option = 'kick';
            isButtonCommand = true;
        } else if (body === 'antivirtex_on_delete') {
            action = 'on';
            option = 'delete';
            isButtonCommand = true;
        } else if (body === 'antivirtex_on_both') {
            action = 'on';
            option = 'both';
            isButtonCommand = true;
        } else if (body === 'antivirtex_off') {
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


        // === DATABASE HANDLING ===
        if (!global.db) global.db = {};
        if (!global.db.groups) global.db.groups = {};
        if (!global.db.groups[m.chat]) global.db.groups[m.chat] = {};

        global.db.groups[m.chat].antivirtex = {
            enabled: global.db.groups[m.chat].antivirtex?.enabled || false,
            delete: global.db.groups[m.chat].antivirtex?.delete || false,
            kick: global.db.groups[m.chat].antivirtex?.kick || false
        };

        const antivirtex = global.db.groups[m.chat].antivirtex;

        if (action === 'on' && option) {
            if (option === 'kick') {
                if (!antivirtex.kick) {
                    antivirtex.enabled = true;
                    antivirtex.delete = false;
                    antivirtex.kick = true;
                    
                    return m.reply(`Fitur antivirtex diaktifkan.
Tendang: ✅
Hapus: ❌

Gunakan salah satu perintah berikut:
\`${m.prefix}${m.command} on,delete\`
> (hapus pesan virtex/bug)

\`${m.prefix}${m.command} on,both\`
> (hapus pesan dan tendang pengirim)`);
                } else {
                    
                    return m.reply(`Fitur antivirtex tendang sudah aktif.
Tendang: ✅
Hapus: ❌

Gunakan salah satu perintah berikut:
\`${m.prefix}${m.command} on,delete\`
> (hapus pesan virtex/bug)

\`${m.prefix}${m.command} on,both\`
> (hapus pesan dan tendang pengirim)`);
                }
            }

            if (option === 'delete') {
                if (!antivirtex.delete) {
                    antivirtex.enabled = true;
                    antivirtex.delete = true;
                    antivirtex.kick = false;
                    
                    return m.reply(`Fitur antivirtex diaktifkan.
Tendang: ❌
Hapus: ✅

Gunakan salah satu perintah berikut:
\`${m.prefix}${m.command} on,kick\`
> (tendang pengirim virtex/bug)

\`${m.prefix}${m.command} on,both\`
> (hapus pesan dan tendang pengirim)`);
                } else {
                    
                    return m.reply(`Fitur antivirtex hapus pesan sudah aktif.
Tendang: ❌
Hapus: ✅

Gunakan salah satu perintah berikut:
\`${m.prefix}${m.command} on,kick\`
> (tendang pengirim virtex/bug)

\`${m.prefix}${m.command} on,both\`
> (hapus pesan dan tendang pengirim)`);
                }
            }

            if (option === 'both') {
                if (!antivirtex.delete || !antivirtex.kick) {
                    antivirtex.enabled = true;
                    antivirtex.delete = true;
                    antivirtex.kick = true;
                    
                    return m.reply(`Fitur antivirtex diaktifkan.
Tendang: ✅
Hapus: ✅

Gunakan salah satu perintah berikut:
\`${m.prefix}${m.command} on,delete\`
> (hapus pesan virtex/bug)

\`${m.prefix}${m.command} on,kick\`
> (tendang pengirim virtex/bug)`);
                } else {
                    
                    return m.reply(`Fitur antivirtex hapus pesan dan tendang sudah aktif.
Tendang: ✅
Hapus: ✅

Gunakan salah satu perintah berikut:
\`${m.prefix}${m.command} on,delete\`
> (hapus pesan virtex/bug)

\`${m.prefix}${m.command} on,kick\`
> (tendang pengirim virtex/bug)`);
                }
            }
        } else if (action === 'off') {
            if (!antivirtex.enabled) {
                
                return m.reply(`Fitur antivirtex sudah nonaktif.
Tendang: ❌
Hapus: ❌

Gunakan salah satu perintah berikut:
\`${m.prefix}${m.command} on,kick\`
> (tendang pengirim virtex/bug)

\`${m.prefix}${m.command} on,delete\`
> (hapus pesan virtex/bug)

\`${m.prefix}${m.command} on,both\`
> (hapus pesan dan tendang pengirim)`);
            }
            antivirtex.enabled = false;
            antivirtex.delete = false;
            antivirtex.kick = false;
            
            return m.reply(`Fitur antivirtex dinonaktifkan.
Tendang: ❌
Hapus: ❌

Gunakan salah satu perintah berikut:
\`${m.prefix}${m.command} on,kick\`
> (tendang pengirim virtex/bug)

\`${m.prefix}${m.command} on,delete\`
> (hapus pesan virtex/bug)

\`${m.prefix}${m.command} on,both\`
> (hapus pesan dan tendang pengirim)`);
        } else {
            
            return m.reply(`*Format salah!* Gunakan perintah:

\`${m.prefix}${m.command} on,kick\`
> (tendang pengirim virtex/bug)

\`${m.prefix}${m.command} on,delete\`
> (hapus pesan virtex/bug)

\`${m.prefix}${m.command} on,both\`
> (hapus pesan dan tendang pengirim)

\`${m.prefix}${m.command} off\`
> (nonaktifkan fitur antivirtex)`);
        }
    }
};