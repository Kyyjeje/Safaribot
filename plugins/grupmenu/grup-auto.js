require('../../settings');
const moment = require('moment-timezone');

module.exports = {
    name: 'grup-auto',
    alias: ['grup-auto', 'group-auto', 'grupauto'],
    description: '<on/off>',
    run: async ({ naze, m }) => {
        const body = m.type === 'conversation' ? m.message.conversation :
                     m.type === 'imageMessage' ? m.message.imageMessage.caption :
                     m.type === 'videoMessage' ? m.message.videoMessage.caption :
                     m.type === 'extendedTextMessage' ? m.message.extendedTextMessage.text :
                     m.type === 'buttonsResponseMessage' ? m.message.buttonsResponseMessage.selectedButtonId :
                     m.type === 'listResponseMessage' ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                     m.type === 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId :
                     m.type === 'messageContextInfo' ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) :
                     m.type === 'editedMessage' ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage ? m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage.text : m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
        const args = body.trim().split(/ +/).slice(1);

        if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

        if (!db.groups[m.chat]) db.groups[m.chat] = {};
        if (!db.groups[m.chat].autoGroup) db.groups[m.chat].autoGroup = { enabled: false, openTime: null, closeTime: null };

        const command = args[0]?.toLowerCase();
        if (!command) {
            
            return m.reply(`*Format salah!*\nGunakan perintah:\n\`${m.prefix}${m.command} on <HH:MM-HH:MM>\`\nContoh: \`${m.prefix}${m.command} on 06:00-22:00\`\nHasil: Grup otomatis dibuka jam *06:00* dan ditutup jam *22:00*\n\nUntuk mematikannya: \`${m.prefix}${m.command} off\``);
        }

        

        try {
            if (command === 'on') {
                if (args.length < 2) {
                    
                    return m.reply(`*Format salah!*\nGunakan perintah: *${m.prefix}${m.command} on <HH:MM-HH:MM>*\nContoh: *${m.prefix}${m.command} on 07:00-22:00*`);
                }
                const timeRange = args[1].split('-');
                if (timeRange.length !== 2) {
                    
                    return m.reply('Format waktu salah! Gunakan HH:MM-HH:MM');
                }
                const [openTime, closeTime] = timeRange;
                if (!moment(openTime, 'HH:mm', true).isValid() || !moment(closeTime, 'HH:mm', true).isValid()) {
                    
                    return m.reply(`Waktu tidak valid! Gunakan format HH:MM (contoh: 07:00-22:00)`);
                }

                db.groups[m.chat].autoGroup = { enabled: true, openTime, closeTime };
                
                await m.reply(`✅ *Grup Auto diaktifkan!*\nBuka: ${openTime}, Tutup: ${closeTime} WIB.`);
            } else if (command === 'off') {
                db.groups[m.chat].autoGroup.enabled = false;
                
                await m.reply('✅ *Grup Auto dimatikan!*');
            } else {
                
                return m.reply(`*Perintah salah!*\nGunakan *${m.prefix}${m.command} on <HH:MM-HH:MM>* atau *${m.prefix}${m.command} off*.`);
            }
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};