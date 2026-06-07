require('../../settings');
const axios = require('axios');

module.exports = {
    name: 'ffstalk',
    alias: ['ffstalker', 'freefirestalk', 'freefirestalker'],
    description: '<ID>',
    run: async ({ naze, m, args, text }) => {
        try {
            
            

            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Harap masukkan ID Free Fire.\nContoh: ${m.prefix}${m.command} 123456789` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            const config = {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer alif_64d5307e-9a02-4e5d-8d53-9ac2a15f0186'
                },
                params: { uid: text }
            };

            const response = await axios.get('https://fastapi2.alifproject.cloud/api/search/ffstalk', config);
            const { data } = response.data;

            if (response.data.status !== 'success') {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Tidak dapat menemukan data Free Fire dengan ID tersebut.` }, { quoted: m });
            }

            const thumb = data.images.banner;
            const hasil = `*FREE FIRE STALK*\n\n` +
                         `*Basic Info:*\n` +
                         `- Nickname: ${data.basicInfo.nickname}\n` +
                         `- Account ID: ${data.basicInfo.accountId}\n` +
                         `- Region: ${data.basicInfo.region}\n` +
                         `- Level: ${data.basicInfo.level}\n` +
                         `- Likes: ${data.basicInfo.likes}\n` +
                         `- Rank: ${data.basicInfo.rank}\n` +
                         `- Max Rank: ${data.basicInfo.maxRank}\n` +
                         `- CS Rank: ${data.basicInfo.csRank}\n` +
                         `- Exp: ${data.basicInfo.exp}\n` +
                         `- Created At: ${data.basicInfo.createdAt}\n` +
                         `- Last Login: ${data.basicInfo.lastLoginAt}\n` +
                         `- Ranking Points: ${data.basicInfo.rankingPoints}\n` +
                         `- Prime Level: ${data.basicInfo.primeLevel}\n` +
                         `- Diamond Cost: ${data.basicInfo.diamondCost}\n\n` +
                         `*Pet Info:*\n` +
                         `- Name: ${data.petInfo.name}\n` +
                         `- Level: ${data.petInfo.level}\n` +
                         `- Exp: ${data.petInfo.exp}\n` +
                         `- Skin ID: ${data.petInfo.skinId}\n` +
                         `- Skill ID: ${data.petInfo.skillId}\n\n` +
                         `*Profile Info:*\n` +
                         `- Avatar ID: ${data.profileInfo.avatarId}\n` +
                         `- Clothes: ${data.profileInfo.clothes}\n` +
                         `- Equipped Skills: ${data.profileInfo.equippedSkills}\n\n` +
                         `*Social Info:*\n` +
                         `- Battle Tags: ${data.socialInfo.battleTags.length ? data.socialInfo.battleTags.join(', ') : 'None'}\n` +
                         `- Language: ${data.socialInfo.language}\n` +
                         `- Rank Show: ${data.socialInfo.rankShow}\n` +
                         `- Signature: ${data.socialInfo.signature}\n\n` +
                         `*Credit Score:*\n` +
                         `- Score: ${data.creditScore.score}\n` +
                         `- Reward State: ${data.creditScore.rewardState}\n\n` +
                         `*Images:*\n` +
                         `- Banner: ${data.images.banner}\n` +
                         `- Outfit: ${data.images.outfit}\n`;

            await naze.sendMessage(m.chat, { image: { url: thumb }, caption: hasil }, { quoted: m });
            
        } catch (e) {
            console.error(`Fatal error di ffstalk: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};