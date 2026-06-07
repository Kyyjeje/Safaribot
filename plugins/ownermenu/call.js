const { parsePhoneNumber } = require('libphonenumber-js');
require('../../settings');

module.exports = {
    name: 'call',
    alias: ['telpon', 'phone'],
    description: '<nomor/reply/tag>',
    run: async ({ naze, m, text }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            let targetNumber;
            if (m.quoted && m.quoted.sender1) {
                targetNumber = m.quoted.sender1;
            } else if (text && !text.startsWith('@')) {
                try {
                    const phoneNumber = parsePhoneNumber(text, 'ID');
                    if (!phoneNumber.isValid()) throw new Error('Nomor telepon tidak valid!');
                    targetNumber = phoneNumber.formatInternational().replace(/\s/g, '') + '@s.whatsapp.net';
                } catch (e) {
                    
                    return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <nomor>\`\n> Contoh: \`${m.prefix}${m.command} +6281234567890\`\n> atau reply pesan, atau tag user` }, { quoted: m });
                }
            } else if (text && text.startsWith('@')) {
                const tagged = text.replace('@', '').replace(/\s/g, '');
                targetNumber = tagged.includes('@s.whatsapp.net') ? tagged : `${tagged}@s.whatsapp.net`;
            } else {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <nomor>\`\n> Contoh: \`${m.prefix}${m.command} +6281234567890\`\n> atau reply pesan, atau tag user` }, { quoted: m });
            }

            
            await naze.offerCall(targetNumber, true);
            
            await naze.sendMessage(m.chat, { text: `✅ Memulai panggilan ke ${targetNumber.split('@')[0]}...` }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};