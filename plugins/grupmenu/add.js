require('../../settings');

module.exports = {
    name: 'add',
    alias: ['addmember'],
    description: '<nomor/@tag>',
    run: async ({ naze, m, text }) => {
        

       if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        if (!m.isBotAdmin) return  global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

        if (!text) {
            
            return m.reply(`Format salah!\nGunakan: ${m.prefix}${m.command} <nomor>\nContoh: ${m.prefix}${m.command} +6281212121212`);
        }

        let number = text.replace(/[^0-9+]/g, '');
        if (!number) {
            
            return m.reply(`Nomor tidak valid!\nGunakan: ${m.prefix}${m.command} <nomor>\nContoh: ${m.prefix}${m.command} +6281212121212`);
        }
        await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
        let formattedNumber, jid;
        if (number.startsWith('+')) {
            formattedNumber = number;
            number = number.slice(1);
        } else {
            if (number.startsWith('0')) {
                number = '62' + number.slice(1);
            } else if (number.startsWith('8')) {
                number = '62' + number;
            } else {
                number = '62' + number;
            }
            formattedNumber = `+${number}`;
        }
        jid = `${number}@s.whatsapp.net`;

        try {
            let isBlocked = false;
            try {
                const blockStatus = await naze.fetchBlocklist();
                if (blockStatus.includes(jid)) {
                    isBlocked = true;
                    await naze.updateBlockStatus(jid, 'unblock');
                    await m.reply(`@${number} diblokir oleh bot. Membuka blokir untuk menambahkan ke grup...`, { mentions: [jid] });
                }
            } catch (e) {
                
                await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
                await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
            }

            try {
                const res = await naze.groupParticipantsUpdate(m.chat, [jid], 'add');
                for (let i of res) {
                    const invv = await naze.groupInviteCode(m.chat);
                    const statusMessages = {
                        200: `Berhasil menambahkan @${number} ke grup!`,
                        401: 'Pengguna memblokir bot!',
                        409: 'Pengguna sudah bergabung di grup!',
                        500: 'Grup sudah penuh!'
                    };

                    if (statusMessages[i.status]) {
                        
                        await m.reply(statusMessages[i.status], { mentions: [jid] });
                    } else if (i.status == 408) {
                        await m.reply(`@${number} baru saja keluar dari grup ini!\n\nKarena akun privat, undangan akan dikirimkan ke\n➜ wa.me/${number}\nmelalui jalur pribadi`, { mentions: [jid] });
                        await naze.sendMessage(jid, {
                            text: `https://chat.whatsapp.com/${invv}\n------------------------------------------------------\n\nAdmin: @${m.sender.split('@')[0]}\nMengundang Anda ke grup ini\nSilakan masuk jika berkenan 🙇`,
                            mentions: [m.sender]
                        }).catch(() => m.reply('Gagal mengirim undangan ke pengguna!'));
                    } else if (i.status == 403) {
                        let inviteData = i.content?.content?.[0]?.attrs || {};
                        await naze.sendGroupInvite(m.chat, jid, inviteData.code || invv, inviteData.expiration, m.metadata.subject, `Admin: @${m.sender.split('@')[0]}\nMengundang Anda ke grup ini\nSilakan masuk jika berkenan 🙇`, null, { mentions: [m.sender] });
                        await m.reply(`@${number} tidak dapat ditambahkan\n\nKarena akun privat, undangan akan dikirimkan ke\n➜ wa.me/${number}\nmelalui jalur pribadi`, { mentions: [jid] });
                    } else {
                        
                        await m.reply(`Gagal menambahkan pengguna\nStatus: ${i.status}`);
                    }
                }
            } finally {
                if (isBlocked) {
                    await naze.updateBlockStatus(jid, 'block');
                    await m.reply(`@${number} telah diblokir kembali oleh bot setelah proses penambahan.`, { mentions: [jid] });
                }
            }
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};