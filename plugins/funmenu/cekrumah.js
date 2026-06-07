require('../../settings');

module.exports = {
    name: 'rumahcek',
    alias: ['.rumahcek', 'cekrumah'],
    description: '<reply/@tag>',
    run: async ({ naze, m }) => {
        if (!m.isGroup) return m.reply("Fitur ini hanya bisa digunakan di dalam grup.");

        try {
            const urls = [
                "https://i.supa.codes/KCorrYO", 
                "https://i.supa.codes/0ARBMz", 
                "https://i.supa.codes/69u9HW", 
                "https://i.supa.codes/ose-fy", 
                "https://i.supa.codes/8HezZ9", 
                "https://i.supa.codes/YCxPol", 
                "https://i.supa.codes/gmpuId", 
                "https://i.supa.codes/T7v1Wd", 
                "https://i.supa.codes/1CtkzI", 
                "https://i.supa.codes/TKpLel", 
                "https://i.supa.codes/DvZjqR", 
                "https://i.supa.codes/JatPLb", 
                "https://i.supa.codes/40l2CS", 
                "https://i.supa.codes/HQ74hN", 
                "https://i.supa.codes/U4klFQ", 
                "https://i.supa.codes/YdlJHy", 
                "https://i.supa.codes/cqtm_U", 
                "https://i.supa.codes/NV72Em", 
                "https://i.supa.codes/1C5yAQ", 
                "https://i.supa.codes/Ys4h-V", 
                "https://i.supa.codes/GVHiX2", 
                "https://i.supa.codes/oN-Zqi", 
                "https://i.supa.codes/O_KRmz"
            ];

            const captions = [
                "Akhirnya ketemu rumah impian! Minimalis, elegan, dan... unik!",
                "Inilah istana! Tempat di mana semua impian dan kenangan tercipta... atau malah tempat buat nyari utangan?",
                "Rumah sejuta kenangan... atau sejuta beban? Yang penting tetap tempat berteduh!",
                "Wah, cozy banget! Cocok buat healing... atau malah butuh healing setelah lihat?",
                "Simple, aesthetic, dan pastinya punya vibe yang... gak bisa dijelaskan!",
                "Mau renovasi atau tinggal langsung? Tergantung tingkat penerimaan hati.",
                "Rumah ini cocok buat yang suka ketenangan... atau yang suka tantangan!",
                "Gak perlu istana, yang penting nyaman dan bisa rebahan!",
                "Rumah ini udah siap huni... atau siap direnovasi? Terserah imajinasi!",
                "Setiap rumah punya cerita, termasuk yang ini... meskipun ceritanya belum tentu bahagia.",
                "Kalau ini rumah impian, berarti selera yang unik!",
                "Sederhana di luar, penuh kehangatan di dalam... atau malah penuh kejutan?",
                "Bisa jadi surga dunia... atau malah tempat uji mental!",
                "Desain yang klasik, aura yang mistis, dan harga yang... realistis?",
                "Tempat berteduh, tempat beristirahat, dan tempat berpikir 'kok gini ya hidup?'",
                "Bentuk boleh sederhana, yang penting hati tetap mewah!",
                "Mungkin gak sempurna, tapi selalu ada cerita di baliknya!",
                "Antara cozy dan butuh direnovasi, tapi yang penting tetap bisa ngopi!",
                "Bukan cuma tempat tinggal, tapi tempat di mana semua mimpi bermula!",
                "Siap jadi rumah impian, atau cukup jadi kenangan di galeri foto?",
                "Setiap rumah punya keunikannya sendiri, termasuk rumah ini!",
                "Bukan rumah hantu, tapi mungkin rumah penuh misteri!",
                "Dari luar biasa, dari dalam lebih luar biasa lagi!",
                "Kalau ada atap, berarti masih ada harapan!"
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
                    nama = teks.replace(/@/g, ""); // Hilangkan @ dari teks
                    targetJid = m.sender; // Default ke pengirim jika hanya nama teks
                } else {
                    nama = `@${m.sender.split("@")[0]}`;
                    targetJid = m.sender;
                }
            }

            const randomImage = pickRandom(urls);
            const randomCaption = pickRandom(captions);

            const text = `*📝 Pertanyaan         :* ${m.body.split(" ")[0]}\n` +
                         `*👤 Nama             :* ${nama}\n\n` +
                        // `*🏠 Rumah         :* [Gambar Rumah]\n\n` +
                         `*💬 [Pesan] :* \n${randomCaption}`;

            await naze.sendMessage(m.chat, { 
                text: text,
                contextInfo: {
                    forwardingScore: 10,
                    isForwarded: true,
                    mentionedJid: targetJid ? [targetJid] : [m.sender], // Tag user yang sesuai
                    externalAdReply: {
                        title: "Cek Rumah Impian!",
                        body: "Klik untuk melihat lebih jelas",
                        thumbnailUrl: randomImage,
                        mediaType: 1,
                        previewType: "PHOTO",
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });

        } catch (error) {
            console.error("Error:", error);
            await naze.sendMessage(m.chat, { text: "❌ Terjadi kesalahan saat mengambil gambar!" }, { quoted: m });
        }
    }
};

// Fungsi untuk mengambil elemen acak dari array
function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}