require('../../settings');

module.exports = {
    name: 'listgc',
    alias: ['listgroup'],
    description: '',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            

            const groups = await naze.groupFetchAllParticipating();
            const groupList = Object.values(groups);

            if (!groupList || groupList.length === 0) {
                
                return naze.sendMessage(m.chat, { text: '❌ Bot tidak bergabung di grup manapun. 😢' }, { quoted: m });
            }

            let output = `🌟 *Daftar Grup yang Dijoin Bot* 🌟\n\n`;
            let totalGroups = groupList.length;
            let totalMembers = 0;

            for (const [index, group] of groupList.entries()) {
                const groupName = group.subject || 'Grup Tanpa Nama';
                const groupId = group.id || 'Tidak Diketahui';
                const memberCount = group.participants ? group.participants.length : 0;
                const superAdmin = group.participants.find(participant => participant.admin === 'superadmin');
                const superAdminNumber = superAdmin ? superAdmin.id.split('@')[0] : 'Tidak Diketahui';
                const formattedSuperAdmin = superAdminNumber.startsWith('0') ? superAdminNumber : `+${superAdminNumber}`;

                output += `📌 *${index + 1}. ${groupName}*\n`;
                output += `👥 *Jumlah Anggota*: ${memberCount}\n`;
                output += `🆔 *ID Grup*: ${groupId}\n`;
                output += `👑 *Super Admin*: ${formattedSuperAdmin}\n\n`;
                totalMembers += memberCount;
            }

            output += `📊 *Total Grup*: ${totalGroups}\n`;
            output += `👥 *Total Anggota Keseluruhan*: ${totalMembers}\n`;
            output += `✨ Bot siap melayani di semua grup ini! 🚀`;

            
            await naze.sendMessage(m.chat, { text: output }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};