require('../../settings');

module.exports = {
    name: 'antiupswHandler',
    alias: ['antiupswon', 'antiupswoff'],
    run: async ({ naze, m }) => {
        if (!m.isGroup) return m.reply(mess.group);
        if (!m.isAdmin) return m.reply(mess.admin);
        if (!m.isBotAdmin) return m.reply(mess.botAdmin);

        // Cek jika pesan berasal dari tombol
        let command = m.text || m.message?.buttonsResponseMessage?.selectedButtonId || '';

        // Pastikan tombol bisa terbaca
        if (m.type === 'buttonsResponseMessage' && m.message.buttonsResponseMessage) {
            command = m.message.buttonsResponseMessage.selectedButtonId;
        }

        const chatData = db.groups[m.chat];

        if (command === 'antiupswon') {
            if (chatData.antiupsw) return m.reply('*🔔 Sudah Aktif Sebelumnya! Coba langgar, langsung lenyap!*');
            chatData.antiupsw = true;
            return m.reply(`*✅ ANTI UP STORY AKTIF!*\n\n🚷 *Peraturan sudah ditegakkan!*\nSiapapun yang berani up story di grup ini akan dihapus pesannya dan langsung *dikeluarkan tanpa ampun!* 😈🔥`);
        } else if (command === 'antiupswoff') {
            if (!chatData.antiupsw) return m.reply('*🔕 Fitur ini sudah nonaktif dari tadi! Jangan panik, santai aja!*');
            chatData.antiupsw = false;
            return m.reply(`*🚫 ANTI UP STORY DINONAKTIFKAN!*\n\n⚠️ *Peraturan sudah dicabut!*\nMulai sekarang, siapa pun bisa up story di grup ini tanpa takut ditendang! 🎉`);
        }
    }
};
