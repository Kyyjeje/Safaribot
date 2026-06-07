require('../../settings');

const formatPhoneNumber = (num) => {
    let normalizedNum = num.replace(/[^0-9+]/g, '');
    if (normalizedNum.startsWith('0')) {
        normalizedNum = '62' + normalizedNum.slice(1);
    } else if (normalizedNum.startsWith('+')) {
        normalizedNum = normalizedNum.slice(1);
    }
    if (!/^\d+$/.test(normalizedNum)) {
        throw new Error('Nomor tidak valid!');
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
    name: 'cekpremium',
    alias: ['cekpremium', 'checkpremium', 'cekprem'],
    description: '<nomor/reply/tag>',
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
            const args = body.trim().split(/ +/).slice(1);
            const quoted = m.quoted ? m.quoted : m;
            const text = args.join(' ').trim();
            let numbers = [];
            if (quoted) numbers.push(quoted.sender);
            if (m.mentionedJid.length) numbers.push(...m.mentionedJid);
            if (text) numbers.push(...text.split(',').map(num => num.trim()));
            if (!numbers.length) numbers.push(m.sender);

            if (!global.db.premium) global.db.premium = {};

            let replyMsg = '';
            let mentions = [];

            for (let num of numbers) {
                let jid;
                if (num.includes('@s.whatsapp.net')) {
                    jid = num;
                } else {
                    try {
                        jid = formatPhoneNumber(num);
                    } catch (e) {
                        replyMsg += `❌ Nomor tidak valid: ${num}\n`;
                        continue;
                    }
                }

                for (const user in global.db.premium) {
                    const premiumData = global.db.premium[user];
                    if (premiumData.expired > 0 && premiumData.expired < +new Date()) {
                        delete global.db.premium[user];
                    }
                }

                if (global.db.premium[jid]) {
                    const limit = global.db.premium[jid].limit || 0;
                    const expired = global.db.premium[jid].expired;
                    const remainingTime = expired === 0 ? 'permanen' : clockString(expired - +new Date());
                    replyMsg += `✅ Status Premium @${jid.split('@')[0]}:\n` +
                                `📊 Limit: ${limit}\n` +
                                `⏳ Kedaluwarsa: ${remainingTime}\n\n`;
                    mentions.push(jid);
                } else {
                    replyMsg += `❌ @${jid.split('@')[0]} bukan pengguna premium!\n\n`;
                    mentions.push(jid);
                }
            }

            
            await naze.sendMessage(m.chat, {
                text: replyMsg || 'Tidak ada nomor yang diproses.',
                mentions
            }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};