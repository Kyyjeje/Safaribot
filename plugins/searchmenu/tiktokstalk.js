require('../../settings');
const axios = require('axios');

module.exports = {
    name: 'tiktokstalk',
    alias: ['tiktokstalker', 'ttstalk'],
    description: '<username>',
    run: async ({ naze, m, args, text }) => {
        try {
            
            

            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Masukkan username TikTok yang ingin dicari!\nContoh: ${m.prefix}${m.command} mrbeast` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            let response = await axios.get(`https://api.siputzx.my.id/api/stalk/tiktok?username=${encodeURIComponent(text)}`);
            let res = response.data;

            if (!res.status || !res.data.user) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Gagal menemukan akun TikTok. Pastikan username benar.` }, { quoted: m });
            }

            let user = res.data.user;
            let stats = res.data.stats;
            let profilePic = user.avatarLarger;
            let googleMapsLink = `https://www.tiktok.com/@${user.uniqueId}`;

            let caption = `*「 TIKTOK STALKER 」*\n\n` +
                          `✨ *Nama*: ${user.nickname}\n` +
                          `🧑‍💻 *Username*: @${user.uniqueId}\n` +
                          `🔑 *ID Pengguna*: ${user.id}\n` +
                          `📝 *Bio*: ${user.signature || 'Tidak ada bio'}\n` +
                          `✔️ *Akun Terverifikasi*: ${user.verified ? '✅ Ya' : '❌ Tidak'}\n` +
                          `🌍 *Wilayah*: ${user.region || 'Tidak tersedia'}\n` +
                          `🔗 *Link Bio*: ${user.bioLink?.link || 'Tidak ada link bio'}\n\n` +
                          `📊 *Statistik Akun:*\n` +
                          `👥 *Pengikut*: ${stats.followerCount.toLocaleString()}\n` +
                          `📲 *Mengikuti*: ${stats.followingCount.toLocaleString()}\n` +
                          `❤️ *Total Likes*: ${stats.heartCount.toLocaleString()}\n` +
                          `🎬 *Jumlah Video*: ${stats.videoCount.toLocaleString()}\n` +
                          `🧑‍🤝‍🧑 *Teman*: ${stats.friendCount.toLocaleString()}\n\n` +
                          `🌐 *Profil TikTok*: ${googleMapsLink}`;

            await naze.sendMessage(m.chat, {
                text: caption,
                contextInfo: {
                    externalAdReply: {
                        title: `Profil TikTok: ${user.nickname}`,
                        thumbnailUrl: profilePic,
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        mediaUrl: googleMapsLink,
                        sourceUrl: googleMapsLink,
                    }
                }
            }, { quoted: m });
            
        } catch (e) {
            console.error(`Fatal error di tiktokstalk: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};