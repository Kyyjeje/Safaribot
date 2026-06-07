require('../../settings');
const axios = require("axios");

module.exports = {
    name: 'request',
    alias: ['req','keterangan|request', 'keterangan|req'],
    description: '<teks>',
    run: async ({ naze, m, text }) => {
        try {
            
            const keterangan = `*Fitur Request* ✨\n\n` +
                              `*Fungsi* 📩:\nMengirimkan permintaan, saran, atau laporan langsung ke owner bot.\n\n` +
                              `*Manfaat* 🚀:\nMemudahkan komunikasi dengan owner untuk fitur baru, laporan bug, atau pertanyaan.\n\n` +
                              `*Cara Penggunaan* 🛠️:\n\`request <pesan>\`\n` +
                              `*Contoh* 💡: \n\`request Tambahkan fitur game RPG\`\n\n` +
                              `*Catatan* ⚠️: \nPastikan pesan jelas dan spesifik.`;
            if (m.text?.toLowerCase().startsWith('keterangan|')) {
                const cmd = m.text.split('|')[1];
                if (['request', 'req'].includes(cmd)) {
                    await naze.sendMessage(m.chat, { text: keterangan }, { quoted: m });
                    
                    return;
                }
            }
            if (!text) throw new Error('Mau Request apa ke Owner?\n\nGunakan perintah:\n`request <pesan>`\n\nUntuk keterangan lengkap, ketik:\n`keterangan|request`');
            await naze.sendMessage(m.chat, { text: `*Baik Yang Mulia, Request Telah Terkirim Ke Owner*\n_Terima Kasih🙏_` }, { quoted: m });
            await naze.sendFromOwner(global.owner, `Pesan Dari : @${m.sender.split('@')[0]}\nUntuk Owner\n\nRequest ${text}`, m, { contextInfo: { mentionedJid: [m.sender], isForwarded: true } });
            
        } catch (e) {
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};