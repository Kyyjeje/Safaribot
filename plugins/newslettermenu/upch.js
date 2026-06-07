require('../../settings');

module.exports = {
    name: 'upch',
    alias: ['upchannel', 'upch'],
    description: '(reply)',
    run: async ({ naze, m }) => {
        const botNumber = await naze.decodeJid(naze.user.id);
        const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
        const jid = global.chanel;

        try {
            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            if (!m.quoted) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Unggah ke Channel:*\n` +
                              `  Perintah: Reply pesan lalu ketik \n\`${m.prefix}${m.command}\`\n` +
                              `  Contoh: Reply teks/gambar/video/stiker/audio/dokumen dengan \n\`${m.prefix}${m.command}\`\n` +
                              `  Support: teks, gambar, video, stiker, audio, dokumen`);
            }

            
            await new Promise(resolve => setTimeout(resolve, 500));
            

            const quotedMsg = m.quoted;
            let messageToSend = {};

            if (quotedMsg.conversation || quotedMsg.extendedTextMessage) {
                messageToSend.text = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || '';
            } else if (quotedMsg.imageMessage) {
                const buffer = await quotedMsg.download();
                messageToSend.image = buffer;
                messageToSend.mimetype = quotedMsg.imageMessage.mimeType || 'image/jpeg';
                if (quotedMsg.imageMessage.caption) messageToSend.caption = quotedMsg.imageMessage.caption;
            } else if (quotedMsg.videoMessage) {
                const buffer = await quotedMsg.download();
                messageToSend.video = buffer;
                messageToSend.mimetype = quotedMsg.videoMessage.mimeType || 'video/mp4';
                if (quotedMsg.videoMessage.caption) messageToSend.caption = quotedMsg.videoMessage.caption;
            } else if (quotedMsg.stickerMessage) {
                const buffer = await quotedMsg.download();
                messageToSend.sticker = buffer;
                messageToSend.mimetype = quotedMsg.stickerMessage.mimeType || 'image/webp';
                messageToSend.isAnimated = quotedMsg.stickerMessage.isAnimated || false;
            } else if (quotedMsg.audioMessage) {
                const buffer = await quotedMsg.download();
                messageToSend.audio = buffer;
                messageToSend.mimetype = quotedMsg.audioMessage.mimeType || 'audio/mpeg';
                messageToSend.fileName = quotedMsg.audioMessage.fileName || 'audio.mp3';
                messageToSend.ptt = quotedMsg.audioMessage.ptt || false;
            } else if (quotedMsg.documentMessage) {
                const buffer = await quotedMsg.download();
                messageToSend.document = buffer;
                messageToSend.mimetype = quotedMsg.documentMessage.mimeType || 'application/octet-stream';
                messageToSend.fileName = quotedMsg.documentMessage.fileName || 'document';
                if (quotedMsg.documentMessage.caption) messageToSend.caption = quotedMsg.documentMessage.caption;
            } else {
                
                return m.reply(`🚨 *Jenis Pesan Tidak Didukung, Yang Mulia!*\n\n` +
                              `✨ *Unggah ke Channel:*\n` +
                              `  Perintah: Reply pesan lalu ketik \n\`${m.prefix}${m.command}\`\n` +
                              `  Contoh: Reply teks/gambar/video/stiker/audio/dokumen dengan \n\`${m.prefix}${m.command}\`\n` +
                              `  Support: teks, gambar, video, stiker, audio, dokumen`);
            }

            const metadata = await naze.newsletterMetadata('jid', jid);
            const channelName = metadata?.name || 'Tidak diketahui';

            await naze.sendMessage(jid, messageToSend);
            await m.reply(`🎉 *Pesan Berhasil Diunggah ke Channel, Yang Mulia!*\n\n` +
                         `📢 *Channel*: ${channelName}\n` +
                         `🔗 *JID*: ${jid}\n` +
                         `✅ Pesan telah dikirim ke channel!`, {
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