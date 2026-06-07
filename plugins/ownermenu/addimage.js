const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
require('../../settings');

const imageDatabasePath = '../../data/media/database/image.json';
const imageFolderPath = './data/media/image/';

module.exports = {
    name: 'addimage',
    alias: ['addimg'],
    description: '<reply gambar> <nama>',
    run: async ({ naze, m }) => {
        try {
            
            let ImageNano = JSON.parse(fs.readFileSync(imageDatabasePath));
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
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <nama>\`\n> Contoh: \`${m.prefix}${m.command} FotoKeren\`\n> Reply gambar untuk menyimpan` }, { quoted: m });
            }

            const fileName = text.replace(/[^a-zA-Z0-9_-]/g, '');
            if (ImageNano.includes(fileName)) {
                
                return naze.sendMessage(m.chat, { text: `❌ Nama "${fileName}" telah digunakan!` }, { quoted: m });
            }

            if (!quoted || !quoted.msg || !quoted.msg.mimetype || !quoted.msg.mimetype.includes('image')) {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <nama>\`\n> Contoh: \`${m.prefix}${m.command} FotoKeren\`\n> Reply gambar untuk menyimpan` }, { quoted: m });
            }

            
            const savePath = path.join(imageFolderPath, `${fileName}.jpg`);
            const mediaPath = await naze.downloadAndSaveMediaMessage(quoted);
            await fse.copy(mediaPath, savePath);
            fs.unlinkSync(mediaPath);

            ImageNano.push(fileName);
            fs.writeFileSync(imageDatabasePath, JSON.stringify(ImageNano, null, 2));

            
            await naze.sendMessage(m.chat, { text: `✅ Berhasil menambahkan gambar baru!\n📂 Nama: *${fileName}*` }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};