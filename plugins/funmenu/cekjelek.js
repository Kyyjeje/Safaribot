module.exports = {
    name: "jelekcek",
    alias: [".jelekcek",'cekjelek'],
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
                `Wah ${nama}, lo masih dalam kategori aman, nggak terlalu jelek sih. Selamat! 🎉`,
                `${nama}, lo bisa bernafas lega! Kejelekan lo masih di bawah batas krisis. 😆`,
                `Not bad, ${nama}. Masih bisa nongkrong tanpa bikin orang kabur! 😂`,
                `Tenang aja ${nama}, lo masih bisa masuk frame kamera tanpa bikin retak! 🤭`,
                `${nama}, lo bukan yang terbaik, tapi setidaknya lo nggak bikin orang mimpi buruk! 😆`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else if (persentase <= 50) {
            const pesanList = [
                `${nama}, mulai waspada ya... Kejelekan lo mulai terasa dampaknya di masyarakat. 😬`,
                `Hmm, ${nama}, lo masih bisa diselamatkan! Mungkin coba pakai filter? 🤣`,
                `Astaga ${nama}, ini masih level biasa, tapi jangan sampai naik ke atas ya! 😂`,
                `Cukup jelek buat ditandai, tapi masih bisa diterima oleh peradaban. Bertahanlah, ${nama}! 😆`,
                `${nama}, lo kayak WiFi di rumah, kadang normal, kadang ngaco. Tapi tetep jelek sih. 😂`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else if (persentase <= 75) {
            const pesanList = [
                `${nama}, lo udah mulai memasuki level kejelekan yang mengkhawatirkan! 😱`,
                `Waduh, ${nama}, ini sih udah alarm merah buat dunia estetika! 🚨`,
                `Bro, ${nama}, lo masuk daftar orang yang perlu dibantu dengan editan ekstrim! 😂`,
                `${nama}, kalau jelek ada levelnya, lo udah hampir mentok di hard mode! 😭`,
                `Gawat ${nama}, ini sih udah susah diselamatkan... coba doa tiap malam! 🤣`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        } else {
            const pesanList = [
                `Ya ampun ${nama}, lo tuh legend dalam dunia kejelekan! 🤯`,
                `${nama}, NASA baru aja ngirimin peringatan, kejelekan lo bisa mengancam satelit! 🚀`,
                `Sejujurnya ${nama}, lo itu nggak jelek... tapi lebih dari itu. Ekstrem! 😂`,
                `Orang-orang bakal nyari lo buat eksperimen, karena level jelek lo langka banget! 🏆`,
                `${nama}, ini bukan sekadar jelek. Ini seni! Sayangnya, abstrak banget! 🤣`
            ];
            pesan = pesanList[Math.floor(Math.random() * pesanList.length)];
        }

        const pesanRespon = `*📝 Pertanyaan :* ${m.body.split(" ")[0]}\n` +
                            `*👤 Nama             :* ${nama}\n` +
                            `*🔮 Jawaban      :* ${persentase}%\n\n` +
                            `*💬 [Pesan] :* \n${pesan}`;

         // Gunakan targetJid untuk mentions, fallback ke m.sender jika tidak ada
        naze.sendMessage(m.chat, { 
            text: pesanRespon, 
            mentions: targetJid ? [targetJid] : [m.sender] 
        }, { quoted: m });
    }
};