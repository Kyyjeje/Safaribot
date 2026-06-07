const { format } = require('util');

module.exports = {
    name: 'sewa',
    alias: ['rental'],
    run: async ({ naze, m }) => {
        try {
            
            const rentalMessage = `
✦═══✦ Sewa ${global.botname} ✦═══✦

Selamat datang di layanan sewa ${global.botname}! Bot ini siap membantu grup Anda dengan berbagai fitur menarik dan canggih. Berikut adalah detail harga dan ketentuan sewa:

✦ *Daftar Harga Sewa:*
- 7 Hari    : \`Rp 10.000\`/grup
- 14 Hari : \`Rp 18.000\`/grup
- 21 Hari : \`Rp 25.000\`/grup
- 30 Hari: \`Rp 30.000\`/grup

✦ *Ketentuan Sewa:*
- Jika bot di-kick dari grup, masa sewa tidak hangus. Anda dapat menyimpan sisa masa sewa atau memindahkan bot ke grup lain.
- Harga berlaku per grup, tanpa batasan fitur selama masa sewa aktif.
- Proses sewa mudah dan cepat, langsung hubungi owner untuk pemesanan.

✦ *Hubungi Owner:*
Untuk memesan atau bertanya lebih lanjut, silakan hubungi:

*${global.ownername}* (\`Pendiri ${global.botname}\`)
WhatsApp: +${global.nomorSewaBot}

✦ *Catatan Penting:*
Jika ada kendala selama penggunaan bot, seperti error atau fitur yang tidak berjalan, owner akan segera memperbaikinya. Kami berkomitmen untuk memberikan pengalaman terbaik bagi Anda.`;
            await naze.sendMessage(m.chat, {
                image: { url: global.getRandomThumbnailUrl() },
                caption: rentalMessage
            }, { quoted: m });
            
        } catch (e) {
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};