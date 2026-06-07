require('../../settings');
const axios = require('axios');

module.exports = {
    name: 'setimgch',
    alias: ['setimagechannel', 'setimgchanel', 'setimagech', 'setimagechanel'],
    description: '<url gambar>',
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
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';
        const botNumber = await naze.decodeJid(naze.user.id);
        const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

        try {
            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

             if (args.length < 1) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Atur Gambar Channel:*\n` +
                              `  Perintah: \n- \`${m.prefix}${m.command} <jid atau URL channel> [URL gambar]\`\n` +
                              `  Atau reply gambar dengan: \n- \`${m.prefix}${m.command} <jid atau URL channel>\`\n` +
                              `  Contoh: \n- \`${m.prefix}${m.command} abcd@newsletter https://example.com/image.jpg\`\n` +
                              `  Atau: \n- \`${m.prefix}${m.command} https://whatsapp.com/channel/abcdefgh\` (reply gambar)`);
            }

            
            await new Promise(resolve => setTimeout(resolve, 500));
            

            let jid = args[0];
            let imageUrl = args[1];

            if (jid.includes('https://whatsapp.com/channel/')) {
                const urlParts = jid.split('https://whatsapp.com/channel/')[1].split('/');
                const inviteCode = urlParts[0];
                if (!inviteCode) {
                    
                    return naze.sendMessage(m.chat, {
                        text: '🚨 Kode invite channel tidak ditemukan di URL, yang mulia.\nContoh: https://whatsapp.com/channel/0029VanhMDo42DcjiRGJOc2m',
                        quoted: m
                    });
                }
                const metadata = await naze.newsletterMetadata('invite', inviteCode);
                if (!metadata || !metadata.id) {
                    
                    return naze.sendMessage(m.chat, {
                        text: '🚨 Gagal mendapatkan ID channel dari URL, yang mulia. Pastikan URL valid dan channel masih ada.',
                        quoted: m
                    });
                }
                jid = metadata.id;
            } else if (!jid.endsWith('@newsletter')) {
                
                return naze.sendMessage(m.chat, {
                    text: '🚨 JID tidak valid, yang mulia. Harus berakhiran "@newsletter".\nContoh: abcd@newsletter',
                    quoted: m
                });
            }

            const metadata = await naze.newsletterMetadata('jid', jid);
            const channelName = metadata?.name || 'Tidak diketahui';

            let buffer;
            if (quoted && /image/.test(mime) && !/webp/.test(mime)) {
                buffer = await quoted.download();
                if (!buffer) {
                    
                    return naze.sendMessage(m.chat, {
                        text: '🚨 Gagal mengunduh gambar yang di-reply, yang mulia. Silakan coba lagi.',
                        quoted: m
                    });
                }
            } else if (text && /^https?:\/\//.test(text)) {
                const res = await axios.get(text, { responseType: 'arraybuffer' });
                buffer = Buffer.from(res.data);
            } else {
                
                return naze.sendMessage(m.chat, {
                    text: `Reply gambar atau gunakan URL gambar!\nContoh: \n*${m.prefix}${m.command} ${jid}* (reply gambar) \natau URL image:\n*${m.prefix}${m.command} ${jid} https://example.com/image.jpg*`,
                    quoted: m
                });
            }

            if (!buffer || buffer.length === 0) {
                
                return naze.sendMessage(m.chat, {
                    text: '❌ Failed to download the image!',
                    quoted: m
                });
            }

            await naze.newsletterUpdatePicture(jid, buffer);
            await naze.sendMessage(m.chat, {
                text: `🖼️ *Gambar Channel Berhasil Diperbarui, Yang Mulia!*\n\n` +
                      `📢 *Channel*: ${channelName}\n` +
                      `🔗 *JID*: ${jid}\n` +
                      `✅ Gambar baru telah disetel!`,
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