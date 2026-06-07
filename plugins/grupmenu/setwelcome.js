require('../../settings');
const { jidNormalizedUser } = require('baileys');

module.exports = {
    name: 'setwelcome',
    alias: ['.setwelcome'],
    run: async ({ naze, m }) => {
        // Ambil informasi pesan
        let body = '';
        if (m.type === 'conversation') {
            body = m.message.conversation;
        } else if (m.type === 'imageMessage') {
            body = m.message.imageMessage.caption;
        } else if (m.type === 'videoMessage') {
            body = m.message.videoMessage.caption;
        } else if (m.type === 'extendedTextMessage') {
            body = m.message.extendedTextMessage.text;
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
            body = (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) || '';
        } else if (m.type === 'editedMessage') {
            body = (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage ? m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage.text : m.message.editedMessage.message.protocolMessage.editedMessage.conversation) || '';
        }

        // Kirim reaksi sebelum memproses
        

        // Pastikan perintah dijalankan di grup
        if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

        // Pastikan global.db dan global.db.groups ada
        if (!global.db) global.db = {};
        if (!global.db.groups) global.db.groups = {};
        if (!global.db.groups[m.chat]) global.db.groups[m.chat] = { welcome: true };

        // Ambil argumen
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ').trim();

        if (!text) {
            const initialWelcome = global.db.groups[m.chat].setwelcome || 'Default';
            
            return m.reply(`*Pesan welcome saat ini*: \n========================\n\n${initialWelcome}\n\n========================\nGunakan perintah: \n\`${m.prefix}setwelcome <teks>\` \n\nCatatan:\n\`@user\` = nama user\n\`@grup\` = nama grup\n\n untuk kembali ke pesan default gunakan:\n \`${m.prefix}setwelcome default\``);
        }

        if (text.toLowerCase() === 'default') {
            delete global.db.groups[m.chat].setwelcome;
            
            return m.reply('*Pesan welcome telah dikembalikan ke default!*');
        }

        global.db.groups[m.chat].setwelcome = text;
        
        return m.reply(`*Pesan welcome telah diatur menjadi*:\n${text.replace(/@user/g, '@namauser').replace(/@grup/g, '@namagrup')}`);
    }
};