require('../../settings');
const axios = require('axios');

async function fetchProfilePic(phoneNumber, rapidApiKeys) {
    const baseUrl = 'https://whatsapp-profile-pic.p.rapidapi.com/wspic/png';
    let lastError = null;

    let formattedNumber = phoneNumber.replace(/[+-\s]/g, '');
    if (formattedNumber.startsWith('08')) formattedNumber = '628' + formattedNumber.slice(2);

    for (const key of rapidApiKeys) {
        try {
            const url = `${baseUrl}?phone=${encodeURIComponent(formattedNumber)}`;
            const response = await axios.get(url, {
                headers: {
                    'x-rapidapi-key': key,
                    'x-rapidapi-host': 'whatsapp-profile-pic.p.rapidapi.com'
                },
                responseType: 'arraybuffer'
            });
            return response.data;
        } catch (error) {
            lastError = error;
            continue;
        }
    }

    throw lastError || new Error('Semua kunci API gagal');
}

module.exports = {
    name: 'getpp',
    alias: ['getpp', 'profilepic'],
    description: '<nomor/@tag/reply>',
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
        const quoted = m.quoted ? m.quoted : m;
        const text = args.join(' ');
        const phoneNumber = text.trim();

        

        try {
            if (!phoneNumber) {
                if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);

                const userss = m.mentionedJid?.[0] || quoted?.sender || (text.trim() !== '' ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
                if (!userss) {
                    
                    return m.reply(`*Format salah!*\nHarap mention pengguna, balas pesan, atau gunakan *${m.prefix}${m.command} <nomor telepon>*`);
                }

                let ppuser;
                try {
                    ppuser = await naze.profilePictureUrl(userss, 'image');
                } catch {
                    ppuser = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60';
                }

                await naze.sendMessage(m.key.remoteJid, {
                    image: { url: ppuser },
                    caption: '📸 Foto profil WhatsApp berhasil diambil!'
                }, { quoted: m });
                
                return;
            }

            if (!/^\d+$/.test(phoneNumber.replace(/[+-\s]/g, ''))) {
                
                return m.reply(`*Format salah!*\nGunakan perintah: *${m.prefix}${m.command} <nomor telepon>*\nContoh: *${m.prefix}${m.command} 081266021317*`);
            }

            if (!global.rapid_api || !Array.isArray(global.rapid_api) || global.rapid_api.length === 0) {
                
                return m.reply('❌ Konfigurasi API tidak valid!');
            }

            let imageBuffer = await fetchProfilePic(phoneNumber, global.rapid_api);
            let caption = '📸 Foto profil WhatsApp berhasil diambil!';
            if (!imageBuffer || Buffer.byteLength(imageBuffer) < 512) {
                imageBuffer = await axios.get('https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60', { responseType: 'arraybuffer' }).then(res => res.data);
                caption = '📸 Foto profil WhatsApp tidak diizinkan untuk dilihat semua orang, menggunakan gambar default.';
            }

            await naze.sendMessage(m.key.remoteJid, {
                image: imageBuffer,
                caption: caption
            }, { quoted: m });
            
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};