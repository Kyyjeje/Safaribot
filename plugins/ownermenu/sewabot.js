require('../../settings');
const fs = require('fs');

const isUrl = (url) => {
    return url.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi);
};

const parseDuration = (durationStr) => {
    durationStr = durationStr.toLowerCase().trim();
    const durationMap = {
        'minute': 'min', 'minutes': 'min', 'menit': 'min',
        'hour': 'h', 'hours': 'h', 'jam': 'h',
        'day': 'd', 'days': 'd', 'hari': 'd',
        'week': 'w', 'weeks': 'w', 'minggu': 'w',
        'month': 'm', 'months': 'm', 'bulan': 'm'
    };

    for (const [key, unit] of Object.entries(durationMap)) {
        if (durationStr.includes(key)) {
            durationStr = durationStr.replace(key, unit);
        }
    }

    const match = durationStr.match(/^(\d+)([hdwm]|min)$/i);
    if (!match) {
        throw new Error(`*Format salah!* Gunakan: \`<angka><unit>\`\n> Contoh: \`30min\`, \`12h\`, \`3d\`, \`1w\`, \`2m\`\n> Unit: min (menit/minute), h (jam/hour), d (hari/day), w (minggu/week), m (bulan/month)`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    if (value <= 0) {
        throw new Error('⚠️ Durasi harus lebih dari 0!');
    }

    let durationMs;
    switch (unit) {
        case 'min':
            durationMs = value * 60 * 1000;
            break;
        case 'h':
            durationMs = value * 60 * 60 * 1000;
            break;
        case 'd':
            durationMs = value * 24 * 60 * 60 * 1000;
            break;
        case 'w':
            durationMs = value * 7 * 24 * 60 * 60 * 1000;
            break;
        case 'm':
            durationMs = value * 30 * 24 * 60 * 60 * 1000;
            break;
        default:
            throw new Error('⚠️ Unit durasi tidak valid!');
    }

    return durationMs;
};

const clockString = (ms) => {
    if (ms === 0) return 'permanen';
    let days = Math.floor(ms / (24 * 60 * 60 * 1000));
    let hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    let minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    let seconds = Math.floor((ms % (60 * 1000)) / 1000);
    let result = [];
    if (days > 0) result.push(`${days} hari`);
    if (hours > 0) result.push(`${hours} jam`);
    if (minutes > 0) result.push(`${minutes} menit`);
    if (seconds > 0 && days === 0 && hours === 0 && minutes === 0) result.push(`${seconds} detik`);
    return result.length > 0 ? result.join(' ') : 'sebentar';
};

module.exports = {
    name: 'sewabot',
    alias: ['sewabot', 'addsewa', 'rentbot', 'rentalbot'],
    description: '<durasi>,<url_grup>',
    run: async ({ naze, m }) => {
        try {
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

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

            if (!text) {
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <durasi>,<url_grup>\`\n> Contoh: \`${m.prefix}${m.command} 30min,https://chat.whatsapp.com/xxx\`` }, { quoted: m });
            }

            const [durationStr, groupUrl] = text.split(',').map(s => s.trim());
            if (!durationStr || !groupUrl) {
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <durasi>,<url_grup>\`\n> Contoh: \`${m.prefix}${m.command} 30min,https://chat.whatsapp.com/xxx\`` }, { quoted: m });
            }

            if (!isUrl(groupUrl) || !groupUrl.includes('whatsapp.com')) {
                return naze.sendMessage(m.chat, { text: `*Format salah!* Link grup tidak valid.\n\nGunakan perintah:\n\`${m.prefix}${m.command} <durasi>,<url_grup>\`\n> Contoh: \`${m.prefix}${m.command} 30min,https://chat.whatsapp.com/xxx\`` }, { quoted: m });
            }

            let durationMs;
            try {
                durationMs = parseDuration(durationStr);
            } catch (e) {
                return naze.sendMessage(m.chat, { text: e.message }, { quoted: m });
            }

            // Updated join logic from the provided join command
            const result = groupUrl.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/);
            if (!result) {
                return naze.sendMessage(m.chat, { text: 'Link Invalid❗' }, { quoted: m });
            }

            await naze.sendMessage(m.chat, { text: '⏳ Tunggu sebentar...' }, { quoted: m });
            let groupId;
            try {
                groupId = await naze.groupAcceptInvite(result[1]);
                await global.sendMessageWithThumbnail(naze, m.chat, 'done', m);
            } catch (res) {
                const errors = {
                    400: '❌ Grup Tidak Di Temukan❗',
                    401: '❌ Bot Di Kick Dari Grup Tersebut❗',
                    409: '✅ Bot Sudah Join Di Grup Tersebut❗ Menambahkan ke database sewa.',
                    410: '🔄 Url Grup Telah Di Setel Ulang❗',
                    500: '❌ Grup Penuh❗'
                };
                const errorMsg = errors[res.data] || `❌ Gagal bergabung ke grup: ${res.message || 'Unknown error'}`;
                if (res.data !== 409) {
                    return naze.sendMessage(m.chat, { text: errorMsg }, { quoted: m });
                }
            }

            // Fetch group info to ensure groupId is set
            const inviteCode = result[1];
            let groupInfo;
            try {
                groupInfo = await naze.groupGetInviteInfo(inviteCode);
                groupId = groupInfo?.id || groupId;
            } catch (res) {
                const errors = {
                    400: '❌ Grup tidak ditemukan!',
                    406: '❌ Grup tidak ditemukan!',
                    410: '🔄 Link grup telah direset!'
                };
                const errorMsg = errors[res.data] || `❌ Gagal mendapatkan info grup: ${res.message || 'Unknown error'}`;
                return naze.sendMessage(m.chat, { text: errorMsg }, { quoted: m });
            }

            if (!global.db.sewabot) global.db.sewabot = {};

            const joinedAt = +new Date();
            const expired = durationMs === 0 ? 0 : joinedAt + durationMs;
            global.db.sewabot[groupId] = {
                url: groupUrl,
                expired,
                joinedAt
            };

            try {
                fs.writeFileSync('./database.json', JSON.stringify(global.db, null, 2));
            } catch (e) {
                return naze.sendMessage(m.chat, { text: '❌ Gagal menyimpan data sewa ke database!' }, { quoted: m });
            }

            const orderMsg = `${global.simbol.barisjudul}📋 *Pesanan Sewa Bot Baru*\n` +
                             `${global.simbol.tutupjudul}\n` +
                             `- 📅 *Tanggal Pesan*: ${new Date(joinedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n` +
                             `- ⏰ *Durasi*: ${clockString(durationMs)}\n` +
                             `- 🔔 *Berakhir*: ${expired === 0 ? 'Permanen' : new Date(expired).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n` +
                             `- 🔗 *URL Grup*: ${groupUrl}\n` +
                             `- 🆔 *ID Grup*: ${groupId}\n` +
                             `${global.simbol.penutup}\n\n` +
                             `Bot telah bergabung ke grup!`;

            const owners = global.owner.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net');
            for (const owner of owners) {
                await naze.sendMessage(owner, { text: orderMsg }, { quoted: m }).catch(err => {
                    console.error(`Gagal mengirim notifikasi ke owner ${owner}:`, err);
                });
            }

            const successMsg = `${global.simbol.barisjudul}✅ *Berhasil menyewa bot!*\n` +
                               `${global.simbol.tutupjudul}\n` +
                               `- 🔗 *Grup*: ${groupUrl}\n` +
                               `- ⏰ *Durasi*: ${clockString(durationMs)}\n` +
                               `- 📅 *Berakhir*: ${expired === 0 ? 'Permanen' : new Date(expired).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n` +
                               `${global.simbol.penutup}\n\n` +
                               `Bot akan otomatis keluar saat masa sewa berakhir. Terima kasih!`;
            
            await naze.sendMessage(m.chat, { text: successMsg }, { quoted: m });
        } catch (err) {
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};