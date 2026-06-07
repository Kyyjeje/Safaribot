module.exports = {
    name: "cekbau",
    alias: ["cekbau", "baucek"],
    description: '<reply/@tag>',
    run: async ({ naze, m }) => {
        if (!m.isGroup) return m.reply("Fitur ini hanya bisa digunakan di dalam grup.");

        const bauList = [
            'Bau Ketiak 🦨', 'Bau Jengkol 😷', 'Bau Terasi 🦐', 
            'Bau Tahu Busuk 🤢', 'Bau Ngganteng 😎', 'Bau Asem 😖', 
            'Bau Kambing 🐐', 'Bau Pete 🌿', 'Bau Nggak Enak 🤮',
            'Bau Sepatu 👞', 'Bau Nggaring 🥴', 'Bau Kecut 🤢',
            'Bau Wangi Parfum 🌸', 'Bau Dupa 🔥', 'Bau Minyak Kayu Putih 🌿',
            'Bau Kencing 😷', 'Bau Asem Kecut 😖', 'Bau Kopi ☕',
            'Bau Roko 🚬', 'Bau Gembus 👃', 'Bau Angin 😤'
        ];

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
                nama = teks;
                targetJid = m.sender; // Default ke pengirim jika hanya nama teks
            } else {
                nama = `@${m.sender.split("@")[0]}`;
                targetJid = m.sender;
            }
        }

        let randomBau = bauList[Math.floor(Math.random() * bauList.length)];

        const message = `*📝 Pertanyaan :* ${m.body.split(" ")[0]}\n` +
                        `*👤 Nama             :* ${nama}\n` +
                        `*👃 Bau kamu     :* ${randomBau}`;

        // Gunakan targetJid untuk mentions, fallback ke m.sender jika tidak ada
        naze.sendMessage(m.chat, { 
            text: message, 
            mentions: targetJid ? [targetJid] : [m.sender] 
        }, { quoted: m });
    }
};