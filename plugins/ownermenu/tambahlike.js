require('../../settings');

module.exports = {
    name: 'tambahlike',
    alias: ['tambahlike'],
    description: '<nomor>',
    run: async ({ naze, m, text }) => {
        try {
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            let numbers = [];
            if (text && text.includes(',')) {
                numbers = text.split(',').map(num => num.trim()).filter(num => num);
            } else if (text) {
                numbers = text.split('\n').map(num => num.trim()).filter(num => num);
            } else {
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <nomor>,<nomor>\`\n> Contoh: \`${m.prefix}${m.command} 6281234567890,6280987654321\`\n\nAtau:\n\`${m.prefix}${m.command}\n<nomor>\n<nomor>\`\n> Contoh: \`${m.prefix}${m.command}\n6281234567890\n6280987654321\`` }, { quoted: m });
            }

            if (numbers.length === 0) {
                return naze.sendMessage(m.chat, { text: '❌ Tidak ada nomor yang valid untuk ditambahkan.' }, { quoted: m });
            }

            // Inisialisasi db.likeBot jika belum ada
            if (!global.db) global.db = {};
            if (!global.db.likeBot) global.db.likeBot = {};

            // Hitung total like sebelum penambahan
            const totalLikeBefore = Object.keys(global.db.likeBot).length;

            let addedNumbers = [];
            let existingNumbers = [];

            for (const number of numbers) {
                let formattedNumber = number.replace(/[^0-9]/g, '');
                if (!formattedNumber.startsWith('62')) {
                    formattedNumber = '62' + formattedNumber.replace(/^0/, '');
                }
                const userId = `${formattedNumber}@s.whatsapp.net`;

                if (global.db.likeBot[userId]) {
                    existingNumbers.push(formattedNumber);
                    continue;
                }

                global.db.likeBot[userId] = {
                    nama: '~ (No Name)', // Default nama, sesuai referensi
                    id: formattedNumber,
                    status: 'suka' // Status tetap "suka" sesuai struktur JSON
                };
                addedNumbers.push(formattedNumber);
            }

            // Hitung total like setelah penambahan
            const totalLikeAfter = Object.keys(global.db.likeBot).length;
            const addedLikeCount = addedNumbers.length;
            const failedLikeCount = existingNumbers.length;

            let output = `🌟 *Hasil Penambahan Like* 🌟\n\n`;
            output += `📊 *Total Like Sebelum*: ${totalLikeBefore}\n`;
            if (addedLikeCount > 0) {
                output += `✅ *Berhasil Menambahkan*: ${addedLikeCount} nomor\n`;
            } else {
                output += `✅ *Berhasil Menambahkan*: Tidak ada nomor baru\n`;
            }
            if (failedLikeCount > 0) {
                output += `⚠️ *Gagal Ditambahkan*: ${failedLikeCount} nomor (sudah terdaftar di LikeBot)\n`;
            }
            output += `📊 *Total Like Sesudah*: ${totalLikeAfter}\n`;
            output += `✨ Proses selesai! 🚀`;

            await naze.sendMessage(m.chat, { text: output }, { quoted: m });
        } catch (err) {
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};