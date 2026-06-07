const fs = require('fs');
const archiver = require('archiver');
require('../../settings');

module.exports = {
    name: 'getdata',
    alias: ['getdata'],
    description: '',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            

            const from = m.chat || m.sender;
            const outputPath = './data.zip';
            const output = fs.createWriteStream(outputPath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', async () => {
                try {
                    await naze.sendMessage(from, {
                        document: { url: outputPath },
                        mimetype: 'application/zip',
                        fileName: 'data.zip'
                    }, { quoted: m });
                    
                    await naze.sendMessage(from, { text: '✅ Done yang mulia.' }, { quoted: m });
                    await fs.promises.unlink(outputPath);
                } catch (err) {
                    
                    await naze.sendMessage(from, { text: `❌ Gagal mengirim file ZIP: ${err.message}` }, { quoted: m });
                }
            });

            archive.on('error', async (err) => {
                
                await naze.sendMessage(from, { text: `❌ Terjadi kesalahan saat mengarsipkan: ${err.message}` }, { quoted: m });
                throw err;
            });

            await naze.sendMessage(from, { text: 'Sedang di proses yang mulia...' }, { quoted: m });
            archive.pipe(output);
            archive.directory('./data/', 'data');
            await archive.finalize();
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};