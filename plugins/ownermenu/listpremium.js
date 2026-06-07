require('../../settings');

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
    name: 'listpremium',
    alias: ['listprem'],
    description: '',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            

            if (!global.db.premium) global.db.premium = {};

            for (const user in global.db.premium) {
                const premiumData = global.db.premium[user];
                if (premiumData.expired > 0 && premiumData.expired < +new Date()) {
                    delete global.db.premium[user];
                }
            }

            const premiumList = Object.keys(global.db.premium);
            if (!premiumList.length) {
                
                return naze.sendMessage(m.chat, { text: '📋 Tidak ada pengguna premium saat ini.' }, { quoted: m });
            }

            let replyMsg = '📋 Daftar Pengguna Premium:\n\n';
            let mentions = [];

            for (const jid of premiumList) {
                const limit = global.db.premium[jid].limit || 0;
                const expired = global.db.premium[jid].expired;
                const remainingTime = expired === 0 ? 'permanen' : clockString(expired - +new Date());
                replyMsg += `👤 @${jid.split('@')[0]}\n`;
                replyMsg += `📊 Limit: ${limit}\n`;
                replyMsg += `⏳ Kedaluwarsa: ${remainingTime}\n\n`;
                mentions.push(jid);
            }

            
            await naze.sendMessage(m.chat, { text: replyMsg, mentions }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};