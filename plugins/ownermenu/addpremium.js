require('../../settings');

const parseDuration = (durationStr) => {
    durationStr = durationStr.toLowerCase();
    if (durationStr === 'p' || durationStr === 'permanent') {
        return 0;
    }

    const match = durationStr.match(/^(\d+)([hdmy])$/i);
    if (!match) {
        throw new Error(`Format durasi tidak valid!\nGunakan <angka>h/d/m/y\n\`(misal: 12h, 30d, 3m, 1y)\` atau p untuk permanen.`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    if (value <= 0) {
        throw new Error('Durasi harus lebih dari 0!');
    }

    let durationMs;
    switch (unit) {
        case 'h':
            durationMs = value * 60 * 60 * 1000;
            break;
        case 'd':
            durationMs = value * 24 * 60 * 60 * 1000;
            break;
        case 'm':
            durationMs = value * 30 * 24 * 60 * 60 * 1000;
            break;
        case 'y':
            durationMs = value * 365 * 24 * 60 * 60 * 1000;
            break;
        default:
            throw new Error('Unit durasi tidak valid!');
    }

    return durationMs;
};

const formatPhoneNumber = (num) => {
    let normalizedNum = num.replace(/[^0-9+]/g, '');
    if (normalizedNum.startsWith('0')) {
        normalizedNum = '62' + normalizedNum.slice(1);
    } else if (normalizedNum.startsWith('+')) {
        normalizedNum = normalizedNum.slice(1);
    }
    return normalizedNum + '@s.whatsapp.net';
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
    name: 'addpremium',
    alias: ['addprem'],
    description: '<nomor/@tag>,<durasi>',
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
            const quoted = m.quoted ? m.quoted : m;
            const text = args.join(' ');

            let numbers = [];
            if (m.quoted) {
                numbers.push(m.quoted.sender);
            }
            if (m.mentionedJid.length) {
                numbers.push(...m.mentionedJid);
            }
            if (text) {
                const [numberInput, durationStr] = text.split(',').map(s => s.trim());
                if (!durationStr) {
                    
                    return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <nomor>,<durasi>\`\n> Contoh: \`${m.prefix}${m.command} +6282268881337,30d\`\n\n\`${m.prefix}${m.command} ,<durasi>\`\n> Contoh: \`${m.prefix}${m.command} ,p\`\n> Reply/tag user untuk menambahkan premium` }, { quoted: m });
                }
                if (numberInput) {
                    numbers.push(...numberInput.split(',').map(num => num.trim()));
                }
                var duration = durationStr;
            } else {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <nomor>,<durasi>\`\n> Contoh: \`${m.prefix}${m.command} +6282268881337,30d\`\n\n\`${m.prefix}${m.command} ,<durasi>\`\n> Contoh: \`${m.prefix}${m.command} ,p\`\n> Reply/tag user untuk menambahkan premium` }, { quoted: m });
            }

            if (!numbers.length) {
                
                return naze.sendMessage(m.chat, { text: `❌ Harap reply pesan, tag user, atau masukkan nomor!` }, { quoted: m });
            }

            let durationMs;
            try {
                durationMs = parseDuration(duration);
            } catch (e) {
                
                return naze.sendMessage(m.chat, { text: `❌ ${e.message}` }, { quoted: m });
            }

            if (!global.db.premium) {
                global.db.premium = {};
            }

            let success = [];
            let alreadyPremium = [];
            let invalidNumbers = [];

            for (let num of numbers) {
                let jid;
                if (num.includes('@s.whatsapp.net')) {
                    jid = num;
                } else {
                    try {
                        jid = formatPhoneNumber(num);
                    } catch (e) {
                        invalidNumbers.push(num);
                        continue;
                    }
                }

                for (const user in global.db.premium) {
                    const premiumData = global.db.premium[user];
                    if (premiumData.expired > 0 && premiumData.expired < +new Date()) {
                        delete global.db.premium[user];
                    }
                }

                let currentLimit = 0;
                let newExpired = durationMs === 0 ? 0 : +new Date() + durationMs;

                if (global.db.premium[jid]) {
                    currentLimit = global.db.premium[jid].limit || 0;
                    if (durationMs !== 0 && global.db.premium[jid].expired === 0) {
                        global.db.premium[jid].expired = newExpired;
                    } else if (durationMs !== 0) {
                        if (global.db.premium[jid].expired > +new Date()) {
                            global.db.premium[jid].expired += durationMs;
                        } else {
                            global.db.premium[jid].expired = newExpired;
                        }
                    }
                    global.db.premium[jid].limit = currentLimit + 100;
                    alreadyPremium.push(jid.split('@')[0]);
                } else {
                    global.db.premium[jid] = {
                        limit: 100,
                        expired: newExpired
                    };
                    success.push(jid.split('@')[0]);
                }
            }

            let replyMsg = '';
            if (success.length) {
                replyMsg += `✅ Berhasil menambahkan premium:\n${success.map(n => `@${n} (${clockString(global.db.premium[formatPhoneNumber(n)].expired - +new Date())})`).join('\n')}\n\n`;
            }
            if (alreadyPremium.length) {
                replyMsg += `🔄 Memperpanjang premium:\n${alreadyPremium.map(n => `@${n} (${clockString(global.db.premium[formatPhoneNumber(n)].expired - +new Date())})`).join('\n')}\n\n`;
            }
            if (invalidNumbers.length) {
                replyMsg += `❌ Nomor tidak valid:\n${invalidNumbers.join('\n')}`;
            }

            
            await naze.sendMessage(m.chat, {
                text: replyMsg || 'Tidak ada nomor yang diproses.',
                mentions: [...success, ...alreadyPremium].map(n => formatPhoneNumber(n))
            }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};