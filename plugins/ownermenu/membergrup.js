require('../../settings');

module.exports = {
    name: 'getmembergrup',
    alias: ['membergrup'],
    description: '[jid grup]',
    run: async ({ naze, m, text }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            

            let output = `📋 *Daftar Nomor Anggota Grup*\n\n`;
            let totalNumbers = 0;
            let groupList = [];
            const groups = await naze.groupFetchAllParticipating();
            const allGroups = Object.values(groups);

            if (!allGroups || allGroups.length === 0) {
                
                return naze.sendMessage(m.chat, { text: '❌ Bot tidak bergabung di grup manapun.' }, { quoted: m });
            }

            if (text) {
                const groupJid = text.trim();
                if (!groupJid.endsWith('@g.us')) {
                    
                    return naze.sendMessage(m.chat, { text: `*Format salah!* JID grup tidak valid.\n\nGunakan perintah:\n\`${m.prefix}${m.command} <jid grup>\`\n> Contoh: \`${m.prefix}${m.command} 120363408993711318@g.us\`` }, { quoted: m });
                }

                const group = allGroups.find(g => g.id === groupJid);
                if (!group) {
                    
                    return naze.sendMessage(m.chat, { text: `❌ Grup dengan JID ${groupJid} tidak ditemukan atau bot tidak bergabung di grup tersebut.` }, { quoted: m });
                }

                groupList = [group];
                output = `📋 *Daftar Nomor Anggota dari Grup Tertentu*\n\n`;
            } else {
                groupList = allGroups;
            }

            for (const group of groupList) {
                const groupName = group.subject || 'Grup Tanpa Nama';
                const groupId = group.id || 'Tidak Diketahui';
                const members = group.participants || [];

                if (members.length === 0) {
                    output += `📌 *Grup*: ${groupName}\n🆔 *ID Grup*: ${groupId}\nTidak ada anggota di grup ini.\n\n`;
                    continue;
                }

                const memberNumbers = members
                    .map(member => {
                        const number = member.id.split('@')[0];
                        return number.startsWith('0') ? number : `+${number}`;
                    })
                    .filter(number => number);

                output += `📌 *Grup*: ${groupName}\n`;
                output += `🆔 *ID Grup*: ${groupId}\n`;
                output += `👥 *Jumlah Anggota*: ${memberNumbers.length}\n`;
                output += `📱 *Daftar Nomor*:\n${memberNumbers.join('\n')}\n\n`;
                totalNumbers += memberNumbers.length;
            }

            output += `📊 *Total Nomor yang Diambil*: ${totalNumbers}\n`;
            output += `✨ Selesai! Gunakan data ini dengan bijak.`;

            
            await naze.sendMessage(m.chat, { text: output }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};