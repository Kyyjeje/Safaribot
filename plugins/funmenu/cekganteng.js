module.exports = {
    name: "gantengcek",
    alias: [".gantengcek", "cekganteng"],
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

        // Persentase pintar dengan metode yang lebih balance
        let persentase = Math.floor(Math.random() * 100) + 1;
        if (persentase < 20 && Math.random() > 0.5) persentase += Math.floor(Math.random() * 20);

        let pesan;

        if (persentase <= 25) {
            const pesanList = [
                `Bro ${nama}, lo butuh upgrade level kegantengan nih! 😅`,
                `${nama}, mungkin lo lebih cocok di kategori unik daripada ganteng. 😂`,
                `Jangan sedih ${nama}, yang penting inner beauty tetep juara! 😎`,
                `Ganteng tuh relatif, dan kayanya lo masih dalam proses menuju ke sana. 😆`,
                `Semangat ${nama}! Dengan effort yang cukup, lo bisa naik level ganteng! 🔥`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else if (persentase <= 50) {
            const pesanList = [
                `Hmm, ${nama}, level kegantengan lo udah lumayan nih! 🔥`,
                `Gak buruk, ${nama}! Lo udah punya modal jadi calon idola. 😎`,
                `Wajah lo udah masuk radar kaum hawa nih, ${nama}. Terus pertahankan! 😏`,
                `Lo punya daya tarik tersendiri, ${nama}. Tinggal sedikit polesan lagi! ✨`,
                `Gantengnya masih pemula, tapi ada potensi jadi legenda! 🚀`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else if (persentase <= 75) {
            const pesanList = [
                `${nama}, lo udah masuk kategori ganteng yang bisa bikin hati berdebar! ❤️`,
                `Cewek-cewek mulai melirik nih, ${nama}! Jangan sia-siakan potensimu. 😉`,
                `Wajah lo udah bisa bersaing sama artis FTV nih, ${nama}! 😏`,
                `Ganteng lo udah 75%, tinggal nambahin karisma dikit lagi! 🔥`,
                `Bro ${nama}, lo udah hampir jadi standar cowok idaman. Satu langkah lagi! 😎`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else {
            const pesanList = [
                `GILA! ${nama}, lo tuh bukan sekadar ganteng, lo tuh MATAHARI! 🌞🔥`,
                `NASA udah konfirmasi, ganteng lo ini bukan level manusia biasa! 🚀✨`,
                `${nama}, wajah lo udah diakui internasional! Hollywood kapan nelpon nih? 😎`,
                `Cewek-cewek sampe kehabisan kata-kata liat lo, ${nama}. Luar biasa! 🔥`,
                `Fix, lo bukan manusia biasa ${nama}. Lo tuh Dewa Ganteng! 👑🔥`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        }

        const pesanRespon = `*📝 Pertanyaan :* ${m.body.split(" ")[0]}\n` +
                            `*👤 Nama             :* ${nama}\n` +
                            `*🔥 Tingkat Ganteng :* ${persentase}%\n\n` +
                            `*💬 [Pesan] :* \n${pesan}`;

        // Gunakan targetJid untuk mentions, fallback ke m.sender jika tidak ada
        naze.sendMessage(m.chat, { 
            text: pesanRespon, 
            mentions: targetJid ? [targetJid] : [m.sender] 
        }, { quoted: m });
    }
};