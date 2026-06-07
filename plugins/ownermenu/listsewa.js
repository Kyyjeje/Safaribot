require('../../settings');

const clockString = (ms) => {
    if (ms === 0) return 'permanen';
    let days = Math.floor(ms / (24 * 60 * 60 * 1000));
    let hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    let minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    let seconds = Math.floor((ms % (60 * 1000)) / 1000);
    
    let result = [];
    if (days > 0) result.push(`${days} hari`);
    if (hours > 0) result.push(`${hours} jam`);
    if (minutes > 0) result.push(`${minutes} menit`);
    if (seconds > 0 && days === 0 && hours === 0 && minutes === 0) result.push(`${seconds} detik`);
    
    return result.length > 0 ? result.join(' ') : 'sebentar';
};

module.exports = {
    name: 'listsewa',
    alias: ['listsewa', 'sewalist', 'rentallist'],
    run: async ({ naze, m }) => {
        try {
            // Check if sender is owner
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
            if (!isOwner) return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);

            // Check if database exists
            if (!global.db.sewabot || Object.keys(global.db.sewabot).length === 0) {
                return m.reply('📋 *Tidak ada grup yang sedang menyewa bot saat ini.*');
            }

            // Prepare list of active rentals
            let rentalList = [];
            const currentTime = +new Date();

            for (const groupId in global.db.sewabot) {
                const rental = global.db.sewabot[groupId];
                // Skip if rental has expired (though normally deleted by sewabot.js)
                if (rental.expired !== 0 && rental.expired <= currentTime) {
                    continue;
                }

                const remainingTime = rental.expired === 0 ? 'Permanen' : clockString(rental.expired - currentTime);
                rentalList.push({
                    groupId,
                    joinedAt: new Date(rental.joinedAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
                    expired: rental.expired === 0 ? 'Permanen' : new Date(rental.expired).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
                    duration: clockString(rental.expired === 0 ? 0 : rental.expired - rental.joinedAt),
                    remaining: remainingTime
                });
            }

            // Sort by joinedAt (newest first)
            rentalList.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));

            // Format output
            let output = `📋 *Daftar Grup yang Menyewa Bot*\n\n`;
            if (rentalList.length === 0) {
                output += '⚠️ *Tidak ada sewa aktif saat ini.*';
            } else {
                rentalList.forEach((rental, index) => {
                    output += `${global.simbol.barisjudul} *Sewa ${index + 1}*\n` +
                              `${global.simbol.tutupjudul}\n` +
                              `- 📅 *Tanggal Pesan*: ${rental.joinedAt}\n` +
                              `- ⏰ *Durasi Sewa*: ${rental.duration}\n` +
                              `- 🔔 *Berakhir*: ${rental.expired}\n` +
                              `- ⏳ *Sisa Waktu*: ${rental.remaining}\n` +
                              `- 🆔 *ID Grup*: \`${rental.groupId}\`\n` +
                              `${global.simbol.penutup}\n\n`;
                });
                output += `✅ Total: *${rentalList.length} grup*`;
            }

            await naze.sendMessage(m.chat, { text: output }, { quoted: m });

        } catch (e) {
            console.error('[ERROR] Kesalahan saat memproses listsewa:', e);
            m.reply(`❌ Terjadi kesalahan: ${e.message || 'Unknown error'}`);
        }
    }
};