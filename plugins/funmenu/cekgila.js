require('../../settings');
const axios = require("axios");

module.exports = {
    name: 'gilacek',
    alias: ['gilacek', 'cekgila'],
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
                nama = teks;
                targetJid = m.sender; // Default ke pengirim jika hanya nama teks
            } else {
                nama = `@${m.sender.split("@")[0]}`;
                targetJid = m.sender;
            }
        }

        // Persentase gila dengan metode yang lebih balance
        let persentase = Math.floor(Math.random() * 100) + 1;
        if (persentase > 80 && Math.random() > 0.5) persentase -= Math.floor(Math.random() * 20);

        let pesan;

        if (persentase <= 25) {
            const pesanList = [
                `Buset ${nama}, lo paling waras di grup ini! 🔥`,
                `Wah ${nama}, lo terlalu normal. Bahkan psikolog bingung sama lo. 😎`,
                `NASA lagi cari lo nih, ${nama}. Katanya lo manusia paling rasional! 🚀`,
                `${nama}, lo adalah bukti bahwa kewarasan masih ada di dunia ini! 🌍`,
                `Gila? Bukan lo sih, ${nama}. Lo bahkan bisa jadi penasihat kejiwaan! 📚`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else if (persentase <= 50) {
            const pesanList = [
                `Santai aja ${nama}, masih di batas aman. Kadang agak aneh, tapi wajar. 🤔`,
                `Lo setengah waras setengah gila, ${nama}. Untung masih ada keseimbangan! 😆`,
                `${nama}, kadang normal, kadang absurd. Kayak mood swing tingkat dewa! 😂`,
                `Otak lo itu kayak sinyal WiFi, ${nama}. Kadang kuat, kadang nyari koneksi. 📶`,
                `Bisa lah masih diselamatkan, ${nama}. Jangan kebanyakan ngelawak, nanti kebablasan! 🎭`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else if (persentase <= 75) {
            const pesanList = [
                `Waduh ${nama}, lo udah mulai masuk zona abu-abu. Jangan terlalu sering halu! 🚨`,
                `Gila level santai, masih bisa diajak ngobrol, walau kadang suka ngaco. 🤯`,
                `Lo sering nonton teori konspirasi ya, ${nama}? Soalnya makin absurd pemikiran lo. 🤣`,
                `Lo ini contoh nyata dari "Gila tapi jenius". Dunia butuh orang kayak lo! 🧠`,
                `Jangan terlalu lama di dunia mimpi, ${nama}. Takutnya lupa jalan balik ke realita! 🌌`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else {
            const pesanList = [
                `Gila level legenda, ${nama}! Kalau ada lomba unik, lo juara bertahan! 🏆`,
                `Fix, ${nama} ini bukan sekadar gila, tapi udah masuk kategori mahakarya! 🎨`,
                `Kalau kegilaan bisa diukur, lo udah setara dengan karakter anime! 💥`,
                `Lo udah bukan manusia biasa lagi, ${nama}. Lo udah masuk kategori dimensi lain! 🚀`,
                `Google sampe nyerah buat memahami cara pikir lo, ${nama}. Katanya terlalu di luar nalar! 🤯`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        }

        const pesanRespon = `*📝 Pertanyaan         :* ${m.body.split(" ")[0]}\n` +
                            `*👤 Nama                     :* ${nama}\n` +
                            `*🤪 Tingkat Gila       :* *${persentase}%* \n\n` +
                            `*💬 [Pesan] :* \n${pesan}`;
 // Gunakan targetJid untuk mentions, fallback ke m.sender jika tidak ada
        naze.sendMessage(m.chat, { 
            text: pesanRespon, 
            mentions: targetJid ? [targetJid] : [m.sender] 
        }, { quoted: m });
    }
};
