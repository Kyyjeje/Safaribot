module.exports = {
    name: "kendaraancek",
    alias: [".kendaraancek", "cekkendaraan"],
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

        let kendaraan = [
            "Motor Supra Fit", "Mobil Avanza", "Truk Gandeng", "Jet Pribadi",
            "Bajaj", "Helikopter", "Pesawat Tempur", "Babi Ngepet",
            "Jerapah Modifikasi", "Kuda Besi", "Odong-odong", "Sepeda Lipat",
            "Tank Baja", "Mobil Batmobile", "Skateboard Rocket", "Kereta Kuda", "Sepeda BMX"
        ];
        let kondisi = [
            "rongsok", "karatan", "butut", "kredit macet", "ngesot sendiri",
            "ban bocor tiap hari", "mesin panas auto mati", "nyicil sampai kiamat",
            "ngebul asap hitam", "roda 3 hilang 1", "jalan mundur doang",
            "turbo KW", "pintu nyangkut", "gasnya patah", "rem blong tiap belok",
            "bannya cuma satu", "roda segitiga", "nabrak angin langsung tumbang"
        ];
        let pesan = [
            "🚨 Segera ke bengkel sebelum makin ngenes!",
            "🤡 Udah nggak bisa diperbaiki, siap-siap jalan kaki!",
            "💸 Biaya perbaikan lebih mahal dari harga kendaraannya!",
            "💀 Hati-hati, kendaraan ini bisa meledak kapan saja!",
            "🛑 Peringatan! Kendaraan ini sudah dilarang beroperasi!",
            "😂 Sumpah, ini kendaraan atau besi tua?",
            "🏎️ Jangan coba-coba balapan, bisa-bisa jalan mundur!",
            "⚠️ Pastikan pakai helm dan doa sebelum naik!",
            "🚑 Asuransi nggak bakal nerima klaim kalau ini kecelakaan!",
            "💀 Siap-siap didoakan sebelum berangkat, nyawa taruhannya!"
        ];

        let randomKendaraan = kendaraan[Math.floor(Math.random() * kendaraan.length)];
        let randomKondisi = kondisi[Math.floor(Math.random() * kondisi.length)];
        let randomPesan = pesan[Math.floor(Math.random() * pesan.length)];

        let hasil = `*📝 Pertanyaan         :* ${m.body.split(" ")[0]}\n` +
                    `*👤 Nama              :* ${nama}\n` +
                    `*🚗 Kendaraan   :* ${randomKendaraan}\n` +
                    `*🔧 Kondisi        :* ${randomKondisi}\n\n` +
                    `*⚠️ [Pesan Penting] :* \n${randomPesan}`;

        // Gunakan targetJid untuk mentions, fallback ke m.sender jika tidak ada
        naze.sendMessage(m.chat, { 
            text: hasil, 
            mentions: targetJid ? [targetJid] : [m.sender] 
        }, { quoted: m });
    }
};