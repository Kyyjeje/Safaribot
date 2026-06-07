require('../../settings');
const { generateWAMessage } = require('baileys');
const { generateMessageID } = require('../../node_modules/baileys/lib/Utils/generics');
const crypto = require('crypto');

async function sendPoll(naze, jid, pollName, options, selectableCount = 1, toAnnouncement = false, quoted = null) {
    try {
        const pollContent = {
            poll: {
                name: pollName,
                values: options,
                selectableCount: selectableCount,
                toAnnouncementGroup: toAnnouncement
            },
            viewOnce: true
        };

        const pollMsg = await generateWAMessage(
            jid,
            pollContent,
            {
                userJid: naze.user.id,
                messageId: generateMessageID(),
                quoted: quoted
            }
        );
        const relayResult = await naze.relayMessage(jid, pollMsg.message, { messageId: pollMsg.key.id });
        return relayResult;
    } catch (e) {
        await naze.sendMessage(jid, { react: { text: '❌', key: m.key } });
        await global.sendMessageWithThumbnail(naze, jid, 'eror', m);
        await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
    }
}

module.exports = {
    name: 'absen',
    alias: ['attendance'],
   
    run: async ({ naze, m }) => {
        const groupJid = m.key.remoteJid;
        const nomorBot = global.number_bot;

        await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

        if (!m.isGroup) {
            
            if (typeof m.reply === 'function') {
                return m.reply(`Fitur ini hanya bisa digunakan di grup.\nContoh: ${m.prefix}${m.command}`);
            } else {
                const fakeReply = {
                    key: {
                        fromMe: false,
                        participant: nomorBot + '@s.whatsapp.net',
                        remoteJid: groupJid
                    },
                    message: { conversation: '📢 Pemberitahuan Absen' }
                };
                await naze.sendMessage(groupJid, {
                    text: `Fitur ini hanya bisa digunakan di grup.\nContoh: ${m.prefix}${m.command}`
                }, { quoted: fakeReply, ephemeralExpiration: 0 });
                return;
            }
        }

        try {
            const now = new Date();
            const wibTime = now.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour12: false, hour: '2-digit', minute: '2-digit' });
            const pollName = `📅 Absensi Member - ${wibTime} WIB`;

            const options = [
                'Terang 🌕☀️ ',
                'Berawan ⛅',
                'Mendung ☁️',
                'hujan 🌧️',
                'hujan lebat ⛈️'
            ];
            const selectableCount = 1;

            const participants = m.metadata.participants.map(a => a.id);
            const mentionText = `📢 *Absensi Member*\n━━━━━━━━━━━━━━━━\n🕒 Waktu: ${wibTime} WIB\nSilakan pilih opsi kehadiran di polling berikut.\n`;
            await naze.sendMessage(m.chat, {
                image: { url: `${global.thumbnailabsen}` },
                caption: mentionText,
                mentions: participants
            }, { quoted: m });

            await sendPoll(naze, groupJid, pollName, options, selectableCount, false, m);
            
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};