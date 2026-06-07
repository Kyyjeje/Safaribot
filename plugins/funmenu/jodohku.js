require('../../settings');
const axios = require("axios");

module.exports = {
    name: "jodohku",
    alias: ["jodohku", "jodoh"],
    run: async ({ naze, m }) => {
        if (!m.isGroup) return naze.sendMessage(m.chat, { text: "❌ Fitur ini hanya bisa digunakan di grup." }, { quoted: m });

        let groupMetadata = await naze.groupMetadata(m.chat).catch(() => null);
        if (!groupMetadata) return m.reply("❌ Gagal mengambil data grup.");

        let members = groupMetadata.participants.map(a => a.id);
        if (members.length < 2) return naze.sendMessage(m.chat, { text: "❌ Minimal harus ada 2 anggota di grup untuk menggunakan fitur ini." }, { quoted: m });

        let jodoh1 = m.sender;
        let jodoh2 = members[Math.floor(Math.random() * members.length)];

        while (jodoh1 === jodoh2) {
            jodoh2 = members[Math.floor(Math.random() * members.length)];
        }

        // Daftar pesan random (menggunakan versi tanpa button dengan tag user)
        const messages = [
            `✨ Takdir telah berbicara! Kini @${jodoh1.split('@')[0]} dan @${jodoh2.split('@')[0]} adalah pasangan sejati! 💖`,
            `💑 Sebuah pasangan baru telah terbentuk! Apakah ini awal dari kisah cinta yang abadi? ❤️`,
            `😍 Wah, ada jodoh baru di grup ini! Jangan lupa traktiran buat kita ya! 🎉`,
            `💘 Sepertinya semesta telah merestui! @${jodoh1.split('@')[0]} dan @${jodoh2.split('@')[0]} adalah pasangan yang cocok! 💞`,
            `😂 Jangan kaget ya! Bot telah memilih @${jodoh2.split('@')[0]} sebagai jodohnya @${jodoh1.split('@')[0]}! Apakah kalian siap? 🤭`,
            `💍 Cinta bisa datang dari mana saja, bahkan dari perintah bot! Selamat untuk pasangan baru! 💕`,
            `🌹 Wah! Sepertinya ada chemistry kuat antara @${jodoh1.split('@')[0]} dan @${jodoh2.split('@')[0]}! Langgeng yaa! 😘`,
            `🔥 Fix! Kalian resmi dijodohkan oleh bot! Sekarang terserah kalian, mau lanjut atau PHP? 😆`,
            `💑 Gak ada alasan buat nolak takdir! @${jodoh1.split('@')[0]} dan @${jodoh2.split('@')[0]}, kalian ditakdirkan bersama! 💘`,
            `🎊 Selamat! Sekarang @${jodoh1.split('@')[0]} dan @${jodoh2.split('@')[0]} punya panggilan sayang baru! 🥰`,
            `😳 Wah, jodoh datang tanpa diduga! Selamat buat @${jodoh1.split('@')[0]} dan @${jodoh2.split('@')[0]} yang dipersatukan oleh bot! 💞`,
            `💌 Apakah ini pertanda? @${jodoh1.split('@')[0]} dan @${jodoh2.split('@')[0]}, mungkin ini awal kisah cinta kalian! 💖`,
            `😂 Bot gak main-main! @${jodoh1.split('@')[0]} dan @${jodoh2.split('@')[0]}, siap atau nggak, kalian adalah pasangan pilihan! 🥰`,
            `🌟 Kejutan! Siapa sangka jodohmu di grup ini adalah @${jodoh2.split('@')[0]}? Ada yang deg-degan gak nih? 😆`,
            `😆 Jangan kaget! Setelah analisis algoritma bot, @${jodoh2.split('@')[0]} adalah pasangan sempurna buat @${jodoh1.split('@')[0]}! 💑`,
            `👀 Cieee, bot udah kasih jodoh nih! @${jodoh1.split('@')[0]} ❤️ @${jodoh2.split('@')[0]}, ayo kenalan lebih dekat! 😍`,
            `🥂 Selamat! Kalian resmi dijodohkan oleh bot! @${jodoh1.split('@')[0]} dan @${jodoh2.split('@')[0]}, kapan undangan? 💕`,
            `🔥 Fix! Setelah perhitungan matang, @${jodoh1.split('@')[0]} dan @${jodoh2.split('@')[0]} punya chemistry luar biasa! 😘`,
            `💖 Wah, sepertinya @${jodoh1.split('@')[0]} gak perlu cari jodoh jauh-jauh lagi! Udah ada @${jodoh2.split('@')[0]} nih! 😆`,
            `🎶 'Jodoh pasti bertemu' katanya. Nah, sekarang udah ketemu nih! @${jodoh1.split('@')[0]} dan @${jodoh2.split('@')[0]}, semoga langgeng! 💘`
        ];

        // Inisialisasi database
        const botNumber = await naze.decodeJid(naze.user.id);
        if (!global.db) global.db = {};
        if (!global.db.set) global.db.set = {};
        if (!global.db.set[botNumber]) global.db.set[botNumber] = {};
        if (!global.db.set[botNumber].setbutton) global.db.set[botNumber].setbutton = {};
        if (!global.db.set[botNumber].setbutton.jodohku) global.db.set[botNumber].setbutton.jodohku = false;

        const useButton = global.db.set[botNumber].setbutton.jodohku;

        // Fungsi untuk mengirim pesan tanpa button
        const sendTextMessage = async () => {
            let randomMessage = messages[Math.floor(Math.random() * messages.length)];
            let message = `💖 *JODOH TELAH DITEMUKAN!* 💖\n\n` +
                          `💑 @${jodoh1.split('@')[0]} ❤️ @${jodoh2.split('@')[0]}\n\n` +
                          `💬 [ *PESAN* ]\n` +
                          `${randomMessage}`;
            await naze.sendMessage(m.chat, { text: message, mentions: [jodoh1, jodoh2] }, { quoted: m });
        };

        // Fungsi untuk mengirim pesan dengan button
        const sendButtonMessage = async () => {
            let randomMessage = messages[Math.floor(Math.random() * messages.length)];
            let message = `💖 *JODOH TELAH DITEMUKAN!* 💖\n\n` +
                          `💑 @${jodoh1.split('@')[0]} ❤️ @${jodoh2.split('@')[0]}\n\n` +
                          `💬 [ *PESAN* ]\n` +
                          `${randomMessage}`;

            const buttons = [
                { buttonId: 'jodohku', buttonText: { displayText: 'Cari Lagi ❤️' }, type: 1 }
            ];

            const buttonMessage = {
                text: message,
                footer: 'Klik tombol di bawah untuk mencari jodoh lagi!',
                buttons,
                headerType: 1,
                mentions: [jodoh1, jodoh2],
                viewOnce: true
            };

            await naze.sendMessage(m.chat, buttonMessage, { quoted: m });
        };

        // Kirim pesan berdasarkan pengaturan
        if (useButton) {
            await sendButtonMessage();
        } else {
            await sendTextMessage();
        }
    }
};