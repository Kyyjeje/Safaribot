require('../../settings');

module.exports = {
    name: 'tambahdb',
    alias: ['tambahdb'],
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

            if (!global.db) global.db = {};
            if (!global.db.users) global.db.users = {};

            let addedNumbers = [];
            let existingNumbers = [];

            for (const number of numbers) {
                let formattedNumber = number;

                // Jika berawalan +, biarkan apa adanya (tanpa replace kode negara)
                if (formattedNumber.startsWith('+')) {
                    formattedNumber = formattedNumber.replace(/[^0-9]/g, '');
                } else {
                    // Jika berawalan 08, ubah ke 62
                    formattedNumber = formattedNumber.replace(/[^0-9]/g, '');
                    if (formattedNumber.startsWith('08')) {
                        formattedNumber = '62' + formattedNumber.slice(1);
                    } else if (!formattedNumber.startsWith('62')) {
                        formattedNumber = '62' + formattedNumber.replace(/^0/, '');
                    }
                }

                const userId = `${formattedNumber}@s.whatsapp.net`;

                if (global.db.users[userId]) {
                    existingNumbers.push(formattedNumber);
                    continue;
                }

                global.db.users[userId] = {
                    pushname: '~ (No Name)',
                    lastUpdated: Date.now()
                };
                addedNumbers.push(formattedNumber);
            }

            let output = `🌟 *Hasil Penambahan ke Database* 🌟\n\n`;
            if (addedNumbers.length > 0) {
                output += `✅ *Berhasil Ditambahkan*:\n${addedNumbers.join('\n')}\n\n`;
            } else {
                output += `✅ *Berhasil Ditambahkan*: Tidak ada nomor baru.\n\n`;
            }
            if (existingNumbers.length > 0) {
                output += `⚠️ *Nomor yang Sudah Ada di Database*:\n${existingNumbers.join('\n')}\n\n`;
                output += `ℹ️ Nomor yang sudah ada di database diabaikan.\n\n`;
            }
            output += `📊 *Total Nomor Ditambahkan*: ${addedNumbers.length}\n`;
            output += `✨ Proses selesai! 🚀`;

            await naze.sendMessage(m.chat, { text: output }, { quoted: m });
        } catch (err) {
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};