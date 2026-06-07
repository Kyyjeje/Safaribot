require('../../settings');
const fs = require('fs');

module.exports = {
    name: 'setppbot',
    alias: ['ubahppbot'],
    description: '[reply gambar]',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            

            const quoted = m.quoted ? m.quoted : m;
            const mime = (quoted.msg || quoted).mimetype || '';
            const body = m.type === 'conversation' ? m.message.conversation :
                         m.type === 'imageMessage' ? m.message.imageMessage.caption :
                         m.type === 'videoMessage' ? m.message.videoMessage.caption :
                         m.type === 'extendedTextMessage' ? m.message.extendedTextMessage.text :
                         m.type === 'buttonsResponseMessage' ? m.message.buttonsResponseMessage.selectedButtonId :
                         m.type === 'listResponseMessage' ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                         m.type === 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId :
                         m.type === 'messageContextInfo' ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) :
                         m.type === 'editedMessage' ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage?.text || m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
            const args = body.trim().split(/ +/).slice(1);
            const text = args.join(' ').trim();

            if (!/image/.test(mime)) {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Reply gambar dengan caption:\n\n\`${m.prefix}${m.command}\`\n> Contoh: \`${m.prefix}${m.command}\`` }, { quoted: m });
            }

            let media = await naze.downloadAndSaveMediaMessage(quoted, 'ppbot');

            if (text.length > 0) {
                let { img } = await generateProfilePicture(media);
                await naze.query({
                    tag: 'iq',
                    attrs: {
                        to: botNumber,
                        type: 'set',
                        xmlns: 'w:profile:picture'
                    },
                    content: [{
                        tag: 'picture',
                        attrs: { type: 'image' },
                        content: img
                    }]
                });
            } else {
                await naze.updateProfilePicture(botNumber, { url: media });
            }

            await fs.unlinkSync(media);
            
            await naze.sendMessage(m.chat, { text: '✅ Foto profil bot berhasil diperbarui!' }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};