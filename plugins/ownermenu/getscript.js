const fs = require('fs');
const archiver = require('archiver');
require('../../settings');

module.exports = {
    name: 'getsc',
    alias: ['getsc', 'getscript', 'backup'],
    description: '',
    run: async ({ naze, m }) => {
        try {
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
            if (!isOwner) {
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            const from = m.chat || m.sender;
            const firstOwner = global.owner[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'; // Send backup to first owner only
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();
            const outputPath = `./BangsulBotz_${day}_${month}_${year}.zip`;
            const fileName = `BangsulBotz_${day}_${month}_${year}.zip`;
            const output = fs.createWriteStream(outputPath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', async () => {
                try {
                    // Send backup file to the first owner
                    await naze.sendMessage(firstOwner, {
                        document: { url: outputPath },
                        mimetype: 'application/zip',
                        fileName: fileName
                    }, { quoted: m });
                    
                    // Send confirmation to the sender (group or private)
                    await naze.sendMessage(from, { text: '✅ Done yang mulia. Backup telah dikirim ke owner.' }, { quoted: m });
                    await fs.promises.unlink(outputPath);
                } catch (err) {
                    await naze.sendMessage(from, { text: `❌ Gagal mengirim file ZIP ke owner: ${err.message}` }, { quoted: m });
                }
            });

            archive.on('error', async (err) => {
                await naze.sendMessage(from, { text: `❌ Terjadi kesalahan saat mengarsipkan: ${err.message}` }, { quoted: m });
                throw err;
            });

            // Send processing message to the sender (group or private)
            await naze.sendMessage(from, { text: 'Sedang di proses yang mulia...' }, { quoted: m });
            archive.pipe(output);
            archive.directory('./data/', 'data');
            archive.directory('./database/', 'database');
            archive.directory('./lib/', 'lib');
            archive.directory('./src/', 'src');
            archive.directory('./nazedev/', 'nazedev');
            archive.directory('./plugins/', 'plugins');
            archive.directory('./temp/', 'temp');
            archive.file('./generics.js', { name: 'generics.js' });
            archive.file('./creds_backup.json', { name: 'creds_backup.json' });
            archive.file('./index.js', { name: 'index.js' });
            archive.file('./naze.js', { name: 'naze.js' });
            archive.file('./package.json', { name: 'package.json' });
            archive.file('./README.md', { name: 'README.md' });
            archive.file('./runspeed.py', { name: 'runspeed.py' });
            archive.file('./settings.js', { name: 'settings.js' });
            archive.file('./setting-panel.js', { name: 'setting-panel.js' });
            archive.file('./speed.py', { name: 'speed.py' });
            archive.file('./start.js', { name: 'start.js' });
            archive.file('./start(original).js', { name: 'start(original).js' });
            archive.file('./verify(original).js', { name: 'verify(original).js' });
            archive.file('./verify1.js', { name: 'verify1.js' });

            await archive.finalize();
        } catch (err) {
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};