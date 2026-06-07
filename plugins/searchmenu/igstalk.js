const fetch = require('node-fetch');

module.exports = {
    name: 'igstalk',
    alias: ['instagramstalk', 'igprofile'],
    description: '<username>',
    run: async ({ naze, m, text }) => {
        const fetchProfile = async (username, apiKey) => {
            const profileUrl = `https://instagram-profile1.p.rapidapi.com/getprofile/${encodeURIComponent(username)}`;
            const options = {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': apiKey,
                    'x-rapidapi-host': 'instagram-profile1.p.rapidapi.com'
                }
            };
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);
            try {
                const response = await fetch(profileUrl, { ...options, signal: controller.signal });
                clearTimeout(timeoutId);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return await response.json();
            } catch (e) {
                clearTimeout(timeoutId);
                throw e;
            }
        };

        try {
            if (!text) {
                await naze.sendMessage(m.chat, { text: `Masukkan username Instagram!\nContoh: ${m.prefix}${m.command} mhd_ghfar_` }, { quoted: m });
                return;
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            const username = text.trim();
            let result;

            for (const apiKey of global.rapid_api) {
                try {
                    result = await fetchProfile(username, apiKey);
                    break;
                } catch {
                    continue;
                }
            }

            if (!result) {
                await global.handleError(naze, m, new Error('Semua kunci API gagal'), { sendRawError: false, useGemini: true });
                return;
            }

            if (!result.username) {
                await global.handleError(naze, m, new Error('Data pengguna tidak ditemukan'), { sendRawError: false, useGemini: true });
                return;
            }

            const user = result;
            const profileMessage = `🌟 Instagram Profile 🌟\n\n` +
                                 `👤 Username: @${user.username}\n` +
                                 `📛 Nama Lengkap: ${user.full_name || 'Tidak ada'}\n` +
                                 `📝 Bio: ${user.bio || 'Tidak ada'}\n` +
                                 `🏷 Kategori: ${user.category_name || 'Tidak ada'}\n` +
                                 `👀 Follower: ${user.followers.toLocaleString()}\n` +
                                 `📌 Following: ${user.following.toLocaleString()}\n` +
                                 `📸 Jumlah Postingan: ${user.media_count || 0}\n` +
                                 `🔒 Status Akun: ${user.is_private ? 'Private 🔐' : 'Publik 🌐'}\n` +
                                 `✅ Terverifikasi: ${user.is_verified ? 'Ya ✅' : 'Tidak ❌'}\n` +
                                 `💼 Akun Bisnis: ${user.is_business ? 'Ya 🏢' : 'Tidak 🧑'}\n` +
                                 `🆔 ID Pengguna: ${user.id}\n`;

            await naze.sendMessage(m.chat, {
                text: profileMessage,
                contextInfo: {
                    externalAdReply: {
                        title: `@${user.username} - Instagram Profile`,
                        body: user.full_name || 'Instagram User',
                        previewType: 'PHOTO',
                        thumbnailUrl: user.profile_pic_url_hd || user.profile_pic_url || '',
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        sourceUrl: `https://instagram.com/${user.username}`
                    }
                }
            }, { quoted: m });
        } catch (error) {
            await global.handleError(naze, m, error, { sendRawError: false, useGemini: true });
            await global.sendMessageWithThumbnail(naze, m.chat, 'error', m);
        }
    }
};