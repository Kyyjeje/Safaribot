require('../../settings');

module.exports = {
    name: 'linkgroup',
    alias: ['linkgrup','linkgc','urlgroup','urlgrup','urlgc'],
    run: async ({ naze, m }) => {
        if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

        let groupCode = await naze.groupInviteCode(m.chat);
        let groupMeta = await naze.groupMetadata(m.chat);
        let senderTag = '@' + m.sender.split('@')[0];

        let caption = `*🔗 Link Group Saat Ini*\n` +
                      `─────────────────\n\n` +
                      `👮‍♂️ Diminta oleh: ${senderTag}\n`+
                      `📌 Nama Grup:${groupMeta.subject}\n\n` +
                      `🌐 Link:\nhttps://chat.whatsapp.com/${groupCode}`;

        await naze.sendMessage(m.chat, {
            text: caption,
            mentions: [m.sender],
        }, { quoted: m });
    }
};
