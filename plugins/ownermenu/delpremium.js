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

module.exports = {
    name: 'delpremium',
    alias: ['delpremium', 'delprem'],
    description: '<nomor/reply/tag>',
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
            let numbers = [];
            if (m.quoted) numbers.push(m.quoted.sender);
            if (m.mentionedJid.length) numbers.push(...m.mentionedJid);
            if (text) numbers.push(...text.split(',').map(num => num.trim()));

            if (!numbers.length) {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <nomor>\`\n> Contoh: \`${m.prefix}${m.command} +6282268881337\`\n> atau reply pesan, atau tag user` }, { quoted: m });
            }

            if (!global.db.premium) global.db.premium = {};

            let success = [];
            let notPremium = [];
            let invalidNumbers = [];
            let mentions = [];

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

                if (global.db.premium[jid]) {
                    delete global.db.premium[jid];
                    success.push(jid.split('@')[0]);
                    mentions.push(jid);
                } else {
                    notPremium.push(jid.split('@')[0]);
                    mentions.push(jid);
                }
            }

            let replyMsg = '';
            if (success.length) replyMsg += `✅ Berhasil menghapus premium:\n${success.map(n => `@${n}`).join('\n')}\n\n`;
            if (notPremium.length) replyMsg += `⚠️ Bukan pengguna premium:\n${notPremium.map(n => `@${n}`).join('\n')}\n\n`;
            if (invalidNumbers.length) replyMsg += `❌ Nomor tidak valid:\n${invalidNumbers.join('\n')}`;

            
            await naze.sendMessage(m.chat, {
                text: replyMsg || 'Tidak ada nomor yang diproses.',
                mentions
            }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};