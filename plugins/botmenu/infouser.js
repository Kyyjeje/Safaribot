const { globalSettings } = require('../../settings');
const axios = require('axios');
const moment = require('moment-timezone');

module.exports = {
    name: 'infouser',
    alias: ['userinfo'],
    description: '<reply/no reply>',
    run: async ({ naze, m }) => {
        try {
            

            const target = m.quoted ? m.quoted.sender : m.sender;
            const userInfoArray = await naze.fetchStatus(target);
            const userInfo = userInfoArray.length > 0 ? userInfoArray[0] : null;

            const groupMetadata = m.isGroup ? await naze.groupMetadata(m.chat) : null;
            const groupParticipants = m.isGroup ? groupMetadata.participants : [];
            const isAdmin = m.isGroup ? groupParticipants.find(v => v.id === target)?.admin !== null : false;
            const isOwner = global.owner.includes(target.split('@')[0]);
            const isBot = target.includes('g.us') || target.includes('broadcast');

            const pushName = m.quoted ? m.quoted.pushName : m.pushName || 'Tidak diketahui';
            const nomor = target.split('@')[0];
            const bio = userInfo?.status?.status || 'Tidak ada bio';
            const bioSetAt = userInfo?.status?.setAt ? new Date(userInfo.status.setAt) : null;

            const wib = bioSetAt ? moment(bioSetAt).tz('Asia/Jakarta').format('HH:mm:ss') + ' WIB' : '-';
            const wita = bioSetAt ? moment(bioSetAt).tz('Asia/Makassar').format('HH:mm:ss') + ' WITA' : '-';
            const wit = bioSetAt ? moment(bioSetAt).tz('Asia/Jayapura').format('HH:mm:ss') + ' WIT' : '-';
            const groupName = m.isGroup ? groupMetadata.subject : 'Tidak dalam grup';

            const result = `📌 *INFORMASI PENGGUNA* 📌

👤 *Nama:* ${pushName}
📞 *Nomor:* wa.me/${nomor}
🆔 *ID:* ${target}
📜 *Bio:* ${bio}
📅 *Terakhir Bio Diperbarui:*
   ├ 🗓 ${moment(bioSetAt).tz('Asia/Jakarta').format('dddd, D MMMM YYYY')}
   ├ ⏰ ${wib}
   ├ ⏰ ${wita}
   └ ⏰ ${wit}

👑 *Pemilik Bot:* ${isOwner ? '✅ Ya' : '❌ Tidak'}
🛡 *Admin Grup:* ${isAdmin ? '✅ Ya' : '❌ Tidak'}
🤖 *Bot:* ${isBot ? '✅ Ya' : '❌ Tidak'}

🏠 *Dalam Grup:* ${m.isGroup ? '✅ Ya' : '❌ Tidak'}
📛 *Nama Grup:* ${groupName}`;

            const ppUrl = await naze.profilePictureUrl(target, 'image').catch(() => 'https://i.pinimg.com/564x/8a/e9/e9/8ae9e92fa4e69967aa61bf2bda967b7b.jpg');

            await naze.sendMessage(m.chat, {
                caption: result,
                image: { url: ppUrl }
            }, { quoted: m });
            
        } catch (err) {
            
            await global.handleError(naze, m, err, {
                sendRawError: true,
                useGemini: true
            });
        }
    }
};