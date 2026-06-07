require('../../settings');
const axios = require("axios");

module.exports = {
    name: 'react',
    alias: ['reaction'],
    description: '(reply) <emoji>',
    run: async ({ naze, m }) => {
        try {
            const body = (m.type === 'conversation') ? m.message.conversation :
                (m.type === 'imageMessage') ? m.message.imageMessage.caption :
                (m.type === 'videoMessage') ? m.message.videoMessage.caption :
                (m.type === 'extendedTextMessage') ? m.message.extendedTextMessage.text :
                (m.type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId :
                (m.type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                (m.type === 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId :
                (m.type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) :
                (m.type === 'editedMessage') ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage ? m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage.text : m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
            const args = body.trim().split(/ +/).slice(1);
            if (!args[0]) throw new Error('Silakan masukkan emoji untuk reaksi!');
            await naze.sendMessage(m.chat, { react: { text: args[0], key: m.quoted ? m.quoted.key : m.key } });
        } catch (e) {
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};