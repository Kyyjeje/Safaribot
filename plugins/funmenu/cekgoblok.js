module.exports = {
    name: "goblokcek",
    alias: [".goblokcek", "cekgoblok"],
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
        // Persentase goblok dengan metode yang lebih balance
        let persentase = Math.floor(Math.random() * 100) + 1;
        if (persentase > 80 && Math.random() > 0.5) persentase -= Math.floor(Math.random() * 20);

        let pesan;

        if (persentase <= 25) {
            const pesanList = [
                `Gila ${nama}, lo pinter banget! Nih dunia butuh lebih banyak orang kayak lo. 🔥`,
                `Wah ${nama}, goblok sih jauh dari lo. Lo itu cerdas alami! 😎`,
                `${nama}, IQ lo bukan main, NASA sampai butuh lo buat jadi penasihat! 🚀`,
                `Lo bukan manusia biasa, ${nama}. Lo manusia emas dengan otak di atas rata-rata! 🤖`,
                `Kalau goblok itu penyakit, lo udah vaksin sejak lahir, ${nama}! 🏆`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else if (persentase <= 50) {
            const pesanList = [
                `Lumayan sih ${nama}, masih ada sisa-sisa kecerdasan dalam dirimu. 🌟`,
                `Ya masih oke lah ${nama}, meskipun kadang ngeluarin statement yang bikin orang geleng-geleng. 🤔`,
                `${nama}, lo gak goblok, cuma... ya gitu deh. Ada saat-saat di mana otak lo absen. 😂`,
                `Lo setengah pinter, setengah goblok, ${nama}. Untung masih bisa diselamatkan! ⏳`,
                `Masih ada harapan, ${nama}. Jangan kebanyakan begadang, nanti makin turun IQ-nya! 🔥`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else if (persentase <= 75) {
            const pesanList = [
                `Duh ${nama}, lo udah mulai masuk zona bahaya. Kebanyakan goblok bisa kronis lho. 🚨`,
                `IQ lo kayak WiFi gratisan, kadang nyambung kadang putus, ${nama}. 😭`,
                `Lo sering kepentok pintu ya, ${nama}? Soalnya makin hari makin nggak nyambung omongannya. 🤣`,
                `Kata dokter, kebanyakan gabut bisa nurunin kecerdasan. Lo gabut mulu ya, ${nama}? 💀`,
                `Lo ini contoh nyata dari "Bodoh tapi tidak jahat". Tenang, masih ada harapan kok. 😂`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else {
            const pesanList = [
                `Goblok level dewa, ${nama}! Kalau ada sekolah khusus buat orang kayak lo, lo pasti lulusan terbaiknya! 🤯`,
                `Fix, ${nama} ini bukan sekadar goblok, tapi goblok yang sudah berevolusi ke tingkat kosmik! 🚀`,
                `Kalau goblok bisa dicetak di sertifikat, nama lo bakal ada di museum Guinness World Records! 🏆`,
                `Lo udah bukan manusia biasa lagi, ${nama}. Lo udah masuk kategori spesimen langka yang bikin ilmuwan kebingungan! 🧠💥`,
                `NASA udah verifikasi, otak lo itu lubang hitam, semua ilmu yang masuk langsung menghilang! 🕳️`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        }

        const pesanRespon = `*📝 Pertanyaan         :* ${m.body.split(" ")[0]}\n` +
                            `*👤 Nama                     :* ${nama}\n` +
                            `*🧠 Tingkat Goblok  :* *${persentase}%* \n\n` +
                            `*💬 [Pesan] :* \n${pesan}`;

        // Gunakan targetJid untuk mentions, fallback ke m.sender jika tidak ada
        naze.sendMessage(m.chat, { 
            text: pesanRespon, 
            mentions: targetJid ? [targetJid] : [m.sender] 
        }, { quoted: m });
    }
};
