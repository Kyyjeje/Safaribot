module.exports = {
    name: "bodohcek",
    alias: ["bodohcek", "cekbodoh"],
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

        // Persentase bodoh dengan metode yang lebih balance
        let persentase = Math.floor(Math.random() * 100) + 1;
        if (persentase > 80 && Math.random() > 0.5) persentase -= Math.floor(Math.random() * 20);

        let pesan;

        if (persentase <= 25) {
            const pesanList = [
                `Buset ${nama}, lo itu paket hemat Albert Einstein! 🔥`,
                `Wah ${nama}, lo pinter banget! Sampai-sampai orang goblok iri liat lo. 😎`,
                `NASA lagi cari lo nih, ${nama}. Katanya otak lo lebih canggih dari AI! 🚀`,
                `${nama}, lo itu definisi manusia jenius! Otak lo bersinar kayak supernova! 🌟`,
                `Goblok? Bukan lo sih, ${nama}. Lo bahkan bisa ngajar dosen di kampus! 📚`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else if (persentase <= 50) {
            const pesanList = [
                `Santai aja ${nama}, masih di batas aman. Cuma kadang suka nge-lag dikit. 🤔`,
                `Lo setengah pinter setengah bodoh, ${nama}. Untung masih ada sisa otak buat dipake! 😆`,
                `${nama}, kadang pinter, kadang goblok. Otak lo main petak umpet ya? 😂`,
                `Otak lo itu kayak sinyal 4G, ${nama}. Kadang full bar, kadang no service. 📶`,
                `Bisa lah masih di-upgrade, ${nama}. Jangan kebanyakan rebahan, nanti makin turun IQ-nya! 🛌`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else if (persentase <= 75) {
            const pesanList = [
                `Waduh ${nama}, lo udah mulai masuk jurang kebodohan. Pegang tangga sebelum jatuh! 🚨`,
                `Bodoh level pendingin ruangan, dingin banget otaknya, jarang dipakai. ❄️`,
                `Lo sering kepentok tembok ya, ${nama}? Soalnya makin hari makin ga nyambung ngomongnya. 🤣`,
                `Lo ini contoh nyata dari "Bodoh tapi beruntung". Hidup lo penuh keajaiban! 🍀`,
                `Jangan sering-sering tidur siang, ${nama}. Katanya kebanyakan tidur bisa bikin makin bego! 🛏️`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else {
            const pesanList = [
                `Bodoh level legenda, ${nama}! Kalau ada lomba bodoh, lo juara bertahan! 🏆`,
                `Fix, ${nama} ini bukan sekadar bodoh, tapi spesies langka yang perlu dilestarikan! 🦖`,
                `Kalau kebodohan bisa diukur, lo udah setara dengan black hole! Ilmu masuk, langsung hilang! 🕳️`,
                `Lo udah bukan manusia biasa lagi, ${nama}. Lo udah masuk kategori eksperimen gagal! 🧪`,
                `Google sampe nyerah buat jawab pertanyaan lo, ${nama}. Katanya terlalu absurd! 🤯`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        }

        const pesanRespon = `*📝 Pertanyaan        :* ${m.body.split(" ")[0]}\n` +
                            `*👤 Nama                    :* ${nama}\n` +
                            `*🧠 Tingkat Bodoh  :* ${persentase}%\n\n` +
                            `*💬 [Pesan] :* \n${pesan}`;

        // Gunakan targetJid untuk mentions, fallback ke m.sender jika tidak ada
        naze.sendMessage(m.chat, { 
            text: pesanRespon, 
            mentions: targetJid ? [targetJid] : [m.sender] 
        }, { quoted: m });
    }
};