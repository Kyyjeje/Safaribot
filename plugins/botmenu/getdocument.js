const { globalSettings } = require('../../settings');

module.exports = {
    name: 'getdocument',
    alias: ['.getdocument', 'getdoc', '.getdoc'],
    description: '<nomor/nama>',
    run: async ({ naze, m }) => {
        try {
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            let body = '';
            if (m.type === 'conversation') {
                body = m.message.conversation || '';
            } else if (m.type === 'imageMessage') {
                body = m.message.imageMessage.caption || '';
            } else if (m.type === 'videoMessage') {
                body = m.message.videoMessage.caption || '';
            } else if (m.type === 'extendedTextMessage') {
                body = m.message.extendedTextMessage.text || '';
            } else if (m.type === 'buttonsResponseMessage') {
                body = m.message.buttonsResponseMessage.selectedButtonId || '';
            } else if (m.type === 'listResponseMessage') {
                body = m.message.listResponseMessage.singleSelectReply.selectedRowId || '';
            } else if (m.type === 'templateButtonReplyMessage') {
                body = m.message.templateButtonReplyMessage.selectedId || '';
            } else if (m.type === 'interactiveResponseMessage') {
                const nativeFlowResponse = m.message.interactiveResponseMessage?.nativeFlowResponseMessage;
                if (nativeFlowResponse && nativeFlowResponse.paramsJson) {
                    const params = JSON.parse(nativeFlowResponse.paramsJson);
                    body = params.id || '';
                }
            } else if (m.type === 'messageContextInfo') {
                body = (m.message.buttonsResponseMessage?.selectedButtonId ||
                        m.message.listResponseMessage?.singleSelectReply.selectedRowId ||
                        m.text) || '';
            } else if (m.type === 'editedMessage') {
                body = (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage?.text ||
                        m.message.editedMessage.message.protocolMessage.editedMessage.conversation) || '';
            }

            const args = body.trim().split(/ +/).slice(1);
            const text = args.join(' ').toLowerCase();

            if (!text) {
                
                return m.reply('📜 *Cara penggunaan:*\n✦ `.getdoc <nama pesan>` (contoh: `.getdoc waalaikumsalam`)\n✦ `.getdoc <nomor urutan>` (contoh: `.getdoc 1`)\n\nLihat daftar pesan dengan `.listdoc`');
            }

            if (!global.db) global.db = {};
            if (!global.db.document) global.db.document = {};

            const msgs = global.db.document;
            const documentList = Object.keys(msgs);

            if (documentList.length === 0) {
                
                return m.reply('📜 *Database pesan kosong.*\nGunakan `.adddoc` untuk menambahkan pesan, atau lihat daftar dengan `.listdoc`.');
            }

            let messageToSend = null;
            let documentName = '';

            if (/^\d+$/.test(text)) {
                const index = parseInt(text) - 1;
                if (index < 0 || index >= documentList.length) {
                    
                    return m.reply(`⚠️ *Nomor urutan tidak valid.*\nNomor harus antara 1 dan ${documentList.length}.\nLihat daftar pesan dengan \`.listdoc\`.`);
                }
                documentName = documentList[index];
                messageToSend = msgs[documentName];
            } else {
                if (!(text in msgs)) {
                    
                    return m.reply(`⚠️ *'${text}' tidak ditemukan di database.*\nLihat daftar pesan dengan \`.listdoc\`.`);
                }
                documentName = text;
                messageToSend = msgs[text];
            }

            await naze.relayMessage(m.chat, messageToSend, {});
            
        } catch (err) {
            
            await global.handleError(naze, m, err, {
                sendRawError: true,
                useGemini: true
            });
        }
    }
};