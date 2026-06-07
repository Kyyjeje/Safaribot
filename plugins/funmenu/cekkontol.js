module.exports = {
    name: "kontolcek",
    alias: [".kontolcek", "cekkontol"],
    description: '<reply/@tag>',
    run: async ({ naze, m }) => {
        if (!m.isGroup) return m.reply("Fitur ini hanya bisa digunakan di dalam grup.");

        let nama;
        let targetJid;

        // Cek jika pesan adalah reply
        if (m.quoted && m.quoted.sender) {
            targetJid = m.quoted.sender;
            nama = `@${targetJid.split("@")[0]}`;
        } else if (m.mentionedJid?.length) {
            // Jika ada mention
            targetJid = m.mentionedJid[0];
            nama = `@${targetJid.split("@")[0]}`;
        } else {
            // Jika tidak ada mention atau reply, gunakan teks atau pengirim
            let teks = m.body.split(" ").slice(1).join(" ");
            if (teks) {
                nama = teks.replace(/@/g, ""); // Hilangkan @ dari teks
                targetJid = m.sender; // Default ke pengirim jika hanya nama teks
            } else {
                nama = `@${m.sender.split("@")[0]}`;
                targetJid = m.sender;
            }
        }

        const panjang = Math.floor(Math.random() * 100) + 1;
        const satuan = ['cm', 'meter', 'mm', 'km'];
        const randomSatuan = satuan[Math.floor(Math.random() * satuan.length)];

        const message = `*📝 Pertanyaan :* ${m.body.split(" ")[0]}\n` +
                        `*👤 Nama       :* ${nama}\n` +
                        `*📏 Ukuran    :* ${panjang} ${randomSatuan}`;

        // Gunakan targetJid untuk mentions, fallback ke m.sender jika tidak ada
        naze.sendMessage(m.chat, { 
            text: message, 
            mentions: targetJid ? [targetJid] : [m.sender] 
        }, { quoted: m });
    }
};