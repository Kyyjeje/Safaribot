require('../../settings');
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');

module.exports = {
    name: 'setlist',
    alias: ['setformat', 'customlist'],
    description: '<reply teks>',
    run: async ({ naze, m}) => {
        try {
            

            if (!m.isGroup) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
            }
            if (!m.isAdmin) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
            }
            if (!m.isBotAdmin) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);
            }

            if (!m.quoted || !m.quoted.message || !m.quoted.message.conversation) {
                
                return naze.sendMessage(m.chat, { text: `Reply pesan teks untuk format daftar kustom!\nContoh: \n${m.prefix}${m.command} (reply teks)` }, { quoted: m });
            }

            const text = m.quoted.message.conversation;
            const chatId = m.chat;
            const databaseListPath = path.join(__dirname, '../../data/media/database/database_list.json');
            let databaseList = {};

            if (fs.existsSync(databaseListPath)) {
                try {
                    databaseList = JSON.parse(fs.readFileSync(databaseListPath, 'utf-8'));
                } catch (err) {
                    console.error(`Gagal parsing database_list.json: ${err.message}`);
                    
                    return naze.sendMessage(m.chat, { text: `Gagal membaca database: ${err.message}` }, { quoted: m });
                }
            }

            databaseList[chatId] = { text };
            await fse.ensureDir(path.dirname(databaseListPath));
            try {
                fs.writeFileSync(databaseListPath, JSON.stringify(databaseList, null, 2));
            } catch (err) {
                console.error(`Gagal menyimpan database_list.json: ${err.message}`);
                
                return naze.sendMessage(m.chat, { text: `Gagal menyimpan data: ${err.message}` }, { quoted: m });
            }

            
            return naze.sendMessage(m.chat, { text: 'Sukses menyimpan format daftar kustom untuk grup!' }, { quoted: m });
        } catch (err) {
            console.error(`Kesalahan saat memproses setlist: ${err.message}`);
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};