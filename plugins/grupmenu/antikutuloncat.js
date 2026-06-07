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
    name: 'kutuloncat',
    alias: ['antikutuloncat'],
    description: '<on/off>',
    run: async ({ naze, m }) => {
        const body = getMessageBody(m);
        let action = '';

        if (body === 'kutuloncat_on') {
            action = 'on';
        } else if (body === 'kutuloncat_off') {
            action = 'off';
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

        global.db.groups[m.chat].kutuLoncat = {
            active: global.db.groups[m.chat].kutuLoncat?.active || false
        };

        const kutuLoncat = global.db.groups[m.chat].kutuLoncat;

        if (action === 'on') {
            if (!kutuLoncat.active) {
                kutuLoncat.active = true;
                return m.reply(`Fitur kutuloncat diaktifkan.
Status: ✅

Gunakan perintah berikut untuk menonaktifkan:
${m.prefix}${m.command} off
> (nonaktifkan fitur kutuloncat)`);
            } else {
                return m.reply(`Fitur kutuloncat sudah aktif.
Status: ✅

Gunakan perintah berikut untuk menonaktifkan:
${m.prefix}${m.command} off
> (nonaktifkan fitur kutuloncat)`);
            }
        } else if (action === 'off') {
            if (!kutuLoncat.active) {
                return m.reply(`Fitur kutuloncat sudah nonaktif.
Status: ❌

Gunakan perintah berikut untuk mengaktifkan:
${m.prefix}${m.command} on
> (aktifkan fitur kutuloncat)`);
            }
            kutuLoncat.active = false;
            return m.reply(`Fitur kutuloncat dinonaktifkan.
Status: ❌

Gunakan perintah berikut untuk mengaktifkan:
${m.prefix}${m.command} on
> (aktifkan fitur kutuloncat)`);
        } else {
            return m.reply(`Format salah! Gunakan:
\`${m.prefix}${m.command} <on/off>\`

Contoh:
${m.prefix}${m.command} on
> (aktifkan fitur kutuloncat)

${m.prefix}${m.command} off
> (nonaktifkan fitur kutuloncat)`);
        }
    }
};