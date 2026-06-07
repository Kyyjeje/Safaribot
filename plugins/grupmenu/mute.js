require('../../settings');

function parseDuration(durationStr) {
    const timeUnits = {
        's': 1000,
        'min': 60 * 1000,
        'h': 60 * 60 * 1000,
        'd': 24 * 60 * 60 * 1000,
        'w': 7 * 24 * 60 * 60 * 1000,
        'm': 30 * 24 * 60 * 60 * 1000,
        'y': 365 * 24 * 60 * 60 * 1000
    };

    const match = durationStr.match(/^(\d+)(s|min|h|d|w|m|y)$/i);
    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    return value * timeUnits[unit];
}

function formatDuration(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    let result = [];
    if (days > 0) result.push(`${days} hari`);
    if (hours > 0) result.push(`${hours} jam`);
    if (minutes > 0) result.push(`${minutes} menit`);
    if (seconds > 0 && days === 0 && hours === 0 && minutes === 0) result.push(`${seconds} detik`);

    return result.length > 0 ? result.join(' ') : 'sebentar';
}

module.exports = {
    name: 'mute',
    alias: ['silence'],
    description: '(reply/tag/nomor) <waktu>,<alasan>',
    run: async ({ naze, m }) => {
        try {
            if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
            if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
            if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

            // Ekstrak body dan args dari pesan
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
            const input = args.join(' ').trim();

            // Ambil groupMetadata untuk konversi lid ke jid
            const groupMetadata = await naze.groupMetadata(m.chat);

            // Identifikasi target user (via reply, tag, atau nomor)
            let targetUser = null;
            let phoneMatch = null;
            let tagMatch = null;
            if (m.quoted && m.quoted.sender) {
                targetUser = m.quoted.sender;
            } else if (m.mentionedJid && m.mentionedJid.length > 0) {
                const mentionedId = m.mentionedJid[0];
                // Cek apakah mentionedId adalah lid, lalu konversi ke jid
                const participant = groupMetadata.participants.find(p => p.lid === mentionedId || p.id === mentionedId);
                if (participant) {
                    targetUser = participant.jid;
                } else {
                    targetUser = mentionedId; // Fallback ke mentionedId jika tidak ditemukan
                }
                // Deteksi tag dari input untuk filtering reason
                tagMatch = input.match(/@(\d+)/);
            } else if (input) {
                // Parsing nomor dengan menangani spasi, tanda minus, dan tanda plus
                phoneMatch = input.match(/(\+?\d[\d\s-]{8,14}\d)/);
                if (phoneMatch) {
                    // Hapus tanda plus, spasi, dan tanda minus, lalu tambahkan @s.whatsapp.net
                    let phoneNumber = phoneMatch[1].replace(/[\s-+]/g, '');
                    if (!phoneNumber.startsWith('62')) phoneNumber = '62' + phoneNumber.replace(/^0/, '');
                    targetUser = phoneNumber + '@s.whatsapp.net';
                }
            }

            // Validasi target user
            if (!targetUser) {
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <waktu>,<alasan> (reply/tag/nomor)\`\n> Contoh: \`${m.prefix}${m.command} 5min,Spamming\`\n> \`${m.prefix}${m.command} 1h\`` }, { quoted: m });
            }

            // Validasi apakah target adalah admin
            const isTargetAdmin = groupMetadata.participants.find(p => p.id === targetUser)?.admin;
            if (isTargetAdmin) {
                return naze.sendMessage(m.chat, { text: `⚠️ Tidak bisa memute admin grup!` }, { quoted: m });
            }

            // Parsing waktu dan alasan, pastikan nomor dan tag tidak masuk ke reason
            let [durationStr, ...reasonParts] = input.split(/[,|()]\s*/).filter(Boolean);
            if (phoneMatch) {
                // Hapus nomor dari reasonParts
                const phoneStr = phoneMatch[1];
                reasonParts = reasonParts.filter(part => !part.includes(phoneStr));
            }
            if (tagMatch) {
                // Hapus tag dari reasonParts
                const tagStr = `@${tagMatch[1]}`;
                reasonParts = reasonParts.filter(part => part !== tagStr);
            }
            const reason = reasonParts.join(' ').trim() || 'Tidak ada alasan';
            const duration = parseDuration(durationStr);

            if (!duration) {
                return naze.sendMessage(m.chat, { text: `*Format salah!* Waktu harus dalam format: <jumlah><s/min/h/d/w/m/y>\n> Contoh: \`${m.prefix}${m.command} 5min,Spamming\`\n> \`${m.prefix}${m.command} 1h\`` }, { quoted: m });
            }

            // Inisialisasi db.muteUser jika belum ada
            if (!global.db.muteUser) global.db.muteUser = {};
            if (!global.db.muteUser[m.chat]) global.db.muteUser[m.chat] = {};

            // Simpan data mute
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + duration);
            global.db.muteUser[m.chat][targetUser] = {
                startTime: startTime.toISOString(),
                duration: duration,
                endTime: endTime.toISOString(),
                reason: reason
            };

            // Kirim notifikasi ke grup
            const formattedDuration = formatDuration(duration);
            const endTimeStr = endTime.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
            await naze.sendMessage(m.chat, {
                text: `🚫 *User Dimute!*\n\n` +
                      `👤 *User:* @${targetUser.split('@')[0]}\n` +
                      `⏰ *Mulai:* ${startTime.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n` +
                      `⏳ *Durasi:* ${formattedDuration}\n` +
                      `🕒 *Berakhir:* ${endTimeStr}\n` +
                      `📜 *Alasan:* ${reason}`,
                mentions: [targetUser]
            }, { quoted: m });
        } catch (err) {
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};