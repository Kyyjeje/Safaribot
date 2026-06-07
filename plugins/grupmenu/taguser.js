require('../../settings');

module.exports = {
    name: "taguser",
    description: '<reply/@tag>',
    run: async ({ naze, m }) => {
        if (!m.isGroup) return m.reply("Fitur ini hanya bisa digunakan di grup.");

        let nama;
        let targetJid;

        if (m.quoted && m.quoted.sender) {
            // Jika reply
            targetJid = m.quoted.sender;
            nama = `@${targetJid.split("@")[0]}`;
        } else if (m.mentionedJid?.length) {
            // Jika mention
            targetJid = m.mentionedJid[0];
            nama = `@${targetJid.split("@")[0]}`;
        } else {
            // Jika tidak ada, fallback ke sender
            nama = `@${m.sender.split("@")[0]}`;
            targetJid = m.sender;
        }

        const message = `Halo ${nama}, kamu ditandai oleh bot!`;

        naze.sendMessage(m.chat, {
            text: message,
            mentions: [targetJid]
        }, { quoted: m });
    }
};
