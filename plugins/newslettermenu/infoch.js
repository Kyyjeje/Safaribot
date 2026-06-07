require('../../settings');

module.exports = {
    name: 'chinfo',
    alias: ['infoch'],
    description: '<jid/url chanel>',
    run: async ({ naze, m }) => {
        const body = (m.type === 'conversation') ? m.message.conversation : 
                     (m.type === 'imageMessage') ? m.message.imageMessage.caption : 
                     (m.type === 'videoMessage') ? m.message.videoMessage.caption : 
                     (m.type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
                     (m.type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : 
                     (m.type === 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : 
                     (m.type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : 
                     (m.type === 'editedMessage') ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage?.text || m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');
        const botNumber = await naze.decodeJid(naze.user.id);
        const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

        try {
            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            if (!text) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Ambil Info Newsletter:*\n` +
                              `  Perintah: \n- \`${m.prefix}${m.command} <jid atau URL channel>\`\n` +
                              `  Contoh: \n- \`${m.prefix}${m.command} abcd@newsletter\`\n` +
                              `  Atau: \n- \`${m.prefix}${m.command} https://whatsapp.com/channel/abcdefgh\``);
            }

            
            await new Promise(resolve => setTimeout(resolve, 500));
            

            let type = 'jid';
            let identifier = text;
            if (text.includes('whatsapp.com/channel/')) {
                type = 'invite';
                const inviteCodeMatch = text.match(/\/channel\/([A-Za-z0-9]+)/);
                if (!inviteCodeMatch) {
                    
                    return naze.sendMessage(m.chat, {
                        text: `🚨 *Link Channel Salah, Yang Mulia!*\n\nLink harus berbentuk: https://whatsapp.com/channel/xxxxx`,
                        quoted: m
                    });
                }
                identifier = inviteCodeMatch[1];
            }

            const metadata = await naze.newsletterMetadata(type, identifier);
            if (!metadata) {
                
                return naze.sendMessage(m.chat, {
                    text: '⚠️ *Maaf yang mulia, tidak bisa mengambil info newsletter.*',
                    quoted: m
                });
            }

            const jid = metadata.id;
            const channelName = metadata.name || 'Tidak diketahui';
            await naze.sendMessage(m.chat, {
                text: `📝 *Informasi Newsletter Berhasil Diambil, Yang Mulia!*\n\n` +
                      `📢 *Channel*: ${channelName}\n` +
                      `🔗 *JID*: ${jid}\n` +
                      `ℹ️ *Detail*:\n${JSON.stringify(metadata, null, 2)}`,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: jid,
                        newsletterName: channelName
                    }
                },
                quoted: m
            });
            
        } catch (e) {
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};