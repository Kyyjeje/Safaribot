require('../../settings');

module.exports = {
    name: 'getallmember',
    alias: ['allmember'],
    //description: '[<group JID>]',
    run: async ({ naze, m, text }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            

            const groups = await naze.groupFetchAllParticipating();
            const allGroups = Object.values(groups);

            if (!allGroups || allGroups.length === 0) {
                
                return naze.sendMessage(m.chat, { text: `❌ Bot tidak bergabung di grup manapun.` }, { quoted: m });
            }

            let groupList = [];
            if (text) {
                const groupJid = text.trim();
                if (!groupJid.endsWith('@g.us')) {
                    
                    return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <group JID>\`\n> Contoh: \`${m.prefix}${m.command} 120363408993711318@g.us\`\n> Untuk mengambil nomor anggota dari grup tertentu\n\n\`${m.prefix}${m.command}\`\n> Untuk mengambil nomor dari semua grup` }, { quoted: m });
                }

                const group = allGroups.find(g => g.id === groupJid);
                if (!group) {
                    
                    return naze.sendMessage(m.chat, { text: `❌ Grup dengan JID ${groupJid} tidak ditemukan atau bot tidak bergabung di grup tersebut.` }, { quoted: m });
                }
                groupList = [group];
            } else {
                groupList = allGroups;
            }

            let allMemberNumbers = [];
            for (const group of groupList) {
                const members = group.participants || [];
                if (members.length === 0) continue;

                const memberNumbers = members
                    .map(member => {
                        const number = member.id.split('@')[0];
                        return number.startsWith('0') ? number : `+${number}`;
                    })
                    .filter(number => number);
                allMemberNumbers.push(...memberNumbers);
            }

            if (allMemberNumbers.length === 0) {
                
                return naze.sendMessage(m.chat, { text: `❌ Tidak ada anggota yang ditemukan di grup.` }, { quoted: m });
            }

            const output = allMemberNumbers.join('\n');
            
            await naze.sendMessage(m.chat, { text: output }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};