const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
require('../../settings');

const projectRoot = path.resolve(__dirname, '../../'); // Direktori root proyek
const stickerDatabasePath = path.join(projectRoot, 'data/media/database/sticker.json');
const stickerFolderPath = path.join(projectRoot, 'data/media/sticker');

module.exports = {
    name: 'addsticker',
    alias: ['stickeradd'],
    description: '(reply sticker) <nama>',
    run: async ({ naze, m }) => {
        try {
            // Pastikan direktori database ada
            const databaseDir = path.dirname(stickerDatabasePath);
            if (!fs.existsSync(databaseDir)) {
                fs.mkdirSync(databaseDir, { recursive: true });
            }

            // Pastikan direktori sticker ada
            if (!fs.existsSync(stickerFolderPath)) {
                fs.mkdirSync(stickerFolderPath, { recursive: true });
            }

            // Inisialisasi sticker.json jika belum ada
            if (!fs.existsSync(stickerDatabasePath)) {
                fs.writeFileSync(stickerDatabasePath, JSON.stringify([]), 'utf8');
            }

            // Muat ulang database sticker
            delete require.cache[require.resolve(stickerDatabasePath)];
            let NanoSticker = JSON.parse(fs.readFileSync(stickerDatabasePath));

            const body = m.text || '';
            const args = body.trim().split(/ +/).slice(1);
            const text = args.join(' ');
            const quoted = m.quoted ? m.quoted : null;
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            if (!text) {
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <nama>\`\n> Contoh: \`${m.prefix}${m.command} StikerLucu\`\n> Reply sticker untuk menyimpan` }, { quoted: m });
            }

            const fileName = text.replace(/[^a-zA-Z0-9_-]/g, '');
            if (NanoSticker.includes(fileName)) {
                return naze.sendMessage(m.chat, { text: `❌ Nama "${fileName}" telah digunakan!` }, { quoted: m });
            }

            if (!quoted || !quoted.msg || !quoted.msg.mimetype || !quoted.msg.mimetype.includes('webp')) {
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <nama>\`\n> Contoh: \`${m.prefix}${m.command} StikerLucu\`\n> Reply sticker untuk menyimpan` }, { quoted: m });
            }

            const savePath = path.join(stickerFolderPath, `${fileName}.webp`);
            const mediaPath = await naze.downloadAndSaveMediaMessage(quoted);
            await fse.copy(mediaPath, savePath);
            fs.unlinkSync(mediaPath);

            NanoSticker.push(fileName);
            fs.writeFileSync(stickerDatabasePath, JSON.stringify(NanoSticker, null, 2));
            fs.fsyncSync(fs.openSync(stickerDatabasePath, 'r+'));

            await naze.sendMessage(m.chat, { text: `✅ Berhasil menambahkan sticker baru!\n📂 Nama: *${fileName}*` }, { quoted: m });
        } catch (err) {
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};