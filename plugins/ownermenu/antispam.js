require('../../settings');

const parseTimeString = (str) => {
    if (!str) return null;
    const match = str.match(/^(\d+)(s|m|h)$/);
    if (!match) return null;
    const num = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
        case 's': return num * 1000;
        case 'm': return num * 60 * 1000;
        case 'h': return num * 60 * 60 * 1000;
        default: return null;
    }
};

const formatTime = (ms) => {
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000) % 60;
    const h = Math.floor(ms / 3600000);
    let out = [];
    if (h > 0) out.push(`${h} jam`);
    if (m > 0) out.push(`${m} menit`);
    if (s > 0) out.push(`${s} detik`);
    return out.join(', ');
};

module.exports = {
    name: 'antispam',
    alias: ['antispam'],
    description: '<on/off>,<durasi>',
    run: async ({ naze, m }) => {
        try {
            
            const body = m.type === 'conversation' ? m.message.conversation :
                         m.type === 'imageMessage' ? m.message.imageMessage.caption :
                         m.type === 'videoMessage' ? m.message.videoMessage.caption :
                         m.type === 'extendedTextMessage' ? m.message.extendedTextMessage.text :
                         m.type === 'buttonsResponseMessage' ? m.message.buttonsResponseMessage.selectedButtonId :
                         m.type === 'listResponseMessage' ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                         m.type === 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId :
                         m.type === 'messageContextInfo' ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) :
                         m.type === 'editedMessage' ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage?.text || m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
            const args = body.trim().split(/ +/).slice(1).join(' ');
            const [status, timeStr] = args.split(',').map(s => s.trim());
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            db.set[botNumber] = db.set[botNumber] || {};
            db.set[botNumber].antispam = db.set[botNumber].antispam || {};

            if (status === 'on') {
                if (!timeStr) {
                    
                    return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} on,<durasi>\`\n> Contoh: \`${m.prefix}${m.command} on,5s\`\n> Untuk mengaktifkan antispam dengan cooldown\n\n\`${m.prefix}${m.command} off\`\n> Untuk menonaktifkan antispam` }, { quoted: m });
                }
                const timeMs = parseTimeString(timeStr);
                if (!timeMs) {
                    
                    return naze.sendMessage(m.chat, { text: `*Format salah!* Format waktu tidak valid. Gunakan:\n\n\`${m.prefix}${m.command} on,<durasi>\`\n> Contoh: \`${m.prefix}${m.command} on,5s\`\n> Durasi: s (detik), m (menit), h (jam)` }, { quoted: m });
                }
                db.set[botNumber].antispam.aktif = true;
                db.set[botNumber].antispam.durasi = timeMs;
                
                await naze.sendMessage(m.chat, { text: `*Antispam aktif!* ⏳\nCooldown per perintah: ${formatTime(timeMs)}` }, { quoted: m });
            } else if (status === 'off') {
                db.set[botNumber].antispam.aktif = false;
                
                await naze.sendMessage(m.chat, { text: '*Antispam dimatikan!* ❌' }, { quoted: m });
            } else {
                
                await naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} on,<durasi>\`\n> Contoh: \`${m.prefix}${m.command} on,5s\`\n> Untuk mengaktifkan antispam dengan cooldown\n\n\`${m.prefix}${m.command} off\`\n> Untuk menonaktifkan antispam` }, { quoted: m });
            }
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};