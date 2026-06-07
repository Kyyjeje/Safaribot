const fs = require('fs');
const path = require('path');
require('../../settings');

const projectRoot = path.resolve(__dirname, '../../'); // Direktori root proyek
const stickerDatabasePath = path.join(projectRoot, 'data', 'media', 'database', 'sticker.json');
const stickerFolderPath = path.join(projectRoot, 'data', 'media', 'sticker');

module.exports = {
    name: 'delsticker',
    alias: ['stickerdelete', 'deletesticker'],
    description: '<nama>',
    run: async ({ naze, m }) => {
        try {
            // Log untuk debugging path
            console.log(`[DEBUG] Project root: ${projectRoot}`);
            console.log(`[DEBUG] Database path: ${stickerDatabasePath}, exists: ${fs.existsSync(stickerDatabasePath)}`);
            console.log(`[DEBUG] Sticker folder path: ${stickerFolderPath}, exists: ${fs.existsSync(stickerFolderPath)}`);

            // Pastikan file sticker.json ada
            if (!fs.existsSync(stickerDatabasePath)) {
                console.log(`[DEBUG] sticker.json not found at: ${stickerDatabasePath}`);
                return naze.sendMessage(m.chat, { text: `❌ Database sticker tidak ditemukan! Tidak ada sticker yang tersimpan.` }, { quoted: m });
            }

            // Muat ulang database sticker
            delete require.cache[require.resolve(stickerDatabasePath)];
            let NanoSticker;
            try {
                NanoSticker = JSON.parse(fs.readFileSync(stickerDatabasePath));
                if (!Array.isArray(NanoSticker)) {
                    console.log(`[DEBUG] sticker.json is not an array, resetting to empty array`);
                    NanoSticker = [];
                }
            } catch (err) {
                console.error(`[ERROR] Failed to parse sticker.json: ${err.message}`);
                NanoSticker = [];
            }

            const body = m.text || '';
            const args = body.trim().split(/ +/).slice(1);
            const text = args.join(' ');
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            if (!text) {
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <nama>\`\n> Contoh: \`${m.prefix}${m.command} StikerLucu\`` }, { quoted: m });
            }

            const fileName = text.replace(/[^a-zA-Z0-9_-]/g, '');
            if (!NanoSticker.includes(fileName)) {
                return naze.sendMessage(m.chat, { text: `❌ Sticker dengan nama "${fileName}" tidak ditemukan di database!` }, { quoted: m });
            }

            // Hapus nama dari database
            NanoSticker = NanoSticker.filter(name => name !== fileName);
            fs.writeFileSync(stickerDatabasePath, JSON.stringify(NanoSticker, null, 2));
            fs.fsyncSync(fs.openSync(stickerDatabasePath, 'r+'));

            // Hapus file sticker dari folder jika ada
            const savePath = path.join(stickerFolderPath, `${fileName}.webp`);
            try {
                if (fs.existsSync(savePath)) {
                    fs.unlinkSync(savePath);
                    console.log(`[DEBUG] Deleted sticker file: ${savePath}`);
                } else {
                    console.log(`[DEBUG] Sticker file not found: ${savePath}`);
                }
            } catch (unlinkErr) {
                console.error(`[ERROR] Failed to delete sticker file: ${unlinkErr.message}`);
                // Lanjutkan eksekusi meskipun file gagal dihapus
            }

            await naze.sendMessage(m.chat, { text: `✅ Berhasil menghapus sticker!\n📂 Nama: *${fileName}*` }, { quoted: m });
        } catch (err) {
            console.error(`[ERROR] Failed in delsticker: ${err.message}`);
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};