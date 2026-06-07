require('../../settings');
const axios = require('axios');

module.exports = {
    name: 'ghstalk',
    alias: ['ghstalker', 'githubstalk', 'githubstalker'],
    run: async ({ naze, m, args, text }) => {
        try {
            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Harap masukkan username GitHub.\nContoh: ${m.prefix}${m.command} torvalds` }, { quoted: m });
            }

            let response = await axios.get(`https://api.github.com/users/${encodeURIComponent(text)}`);
            let userData = response.data;

            if (!userData || response.status !== 200) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Tidak dapat menemukan pengguna GitHub dengan username tersebut.` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            let thumb = userData.avatar_url;
            let hasil = `*GITHUB STALK*\n\n` +
                        `*Name*: ${userData.name || 'Tidak ada'}\n` +
                        `*Username*: ${userData.login}\n` +
                        `*ID*: ${userData.id}\n` +
                        `*Bio*: ${userData.bio || 'Tidak ada'}\n\n` +
                        `*Created At*: ${userData.created_at}\n` +
                        `*Updated At*: ${userData.updated_at}\n` +
                        `*Location*: ${userData.location || 'Tidak ada'}\n\n` +
                        `*Company*: ${userData.company || 'Tidak ada'}\n` +
                        `*Public Repos*: ${userData.public_repos}\n` +
                        `*Public Gists*: ${userData.public_gists}\n\n` +
                        `*Followers*: ${userData.followers}\n` +
                        `*Following*: ${userData.following}\n\n` +
                        `*Link*: ${userData.html_url}\n`;

            await naze.sendMessage(m.chat, { image: { url: thumb }, caption: hasil }, { quoted: m });
            
        } catch (e) {
            console.error(`Fatal error di ghstalk: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};