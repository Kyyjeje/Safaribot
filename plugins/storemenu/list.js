require('../../settings');
const fs = require('fs');
const path = require('path');
const { replacePlaceholders } = require('../../database/list_function');

module.exports = {
    name: 'list',
    alias: ['showlist', 'viewlist'],
    run: async ({ naze, m }) => {
        try {
            const chatId = m.chat;
            const textListPath = path.join(__dirname, '../../data/media/database/textlist.json');
            const databaseListPath = path.join(__dirname, '../../data/media/database/database_list.json');
            let TextList = {};

            if (fs.existsSync(textListPath)) {
                try {
                    TextList = JSON.parse(fs.readFileSync(textListPath, 'utf-8'));
                } catch (err) {
                    console.error(`Gagal parsing textlist.json: ${err.message}`);
                    return naze.sendMessage(m.chat, { text: `Gagal membaca database: ${err.message}` }, { quoted: m });
                }
            }
            if (!TextList[chatId]) TextList[chatId] = [];

            let listNames = 'Tidak ada perintah yang tersimpan di database grup.';
            if (TextList[chatId].length > 0) {
                let listSymbol = '-';
                if (fs.existsSync(databaseListPath)) {
                    try {
                        const dbData = JSON.parse(fs.readFileSync(databaseListPath, 'utf-8'));
                        const rawText = dbData[chatId]?.text || '';
                        const lines = rawText.split('\n');
                        for (let line of lines) {
                            const match = line.trim().match(/^(.+?)\s+@list$/);
                            if (match) {
                                listSymbol = match[1].trim();
                                break;
                            }
                        }
                    } catch (err) {
                        console.error(`Gagal parsing database_list.json: ${err.message}`);
                    }
                }
                // Mengurutkan TextList[chatId] berdasarkan properti name secara alfabetis
                TextList[chatId].sort((a, b) => a.name.localeCompare(b.name));
                listNames = TextList[chatId].map(item => `${listSymbol} ${item.name}`).join('\n');
            }

            let responseText = listNames;
            if (fs.existsSync(databaseListPath)) {
                try {
                    const databaseList = JSON.parse(fs.readFileSync(databaseListPath, 'utf-8'));
                    if (databaseList[chatId]?.text) {
                        responseText = await replacePlaceholders(databaseList[chatId].text, m, naze, TextList[chatId]);
                    }
                } catch (err) {
                    console.error(`Gagal parsing database_list.json: ${err.message}`);
                }
            }

            return naze.sendMessage(m.chat, { text: responseText }, { quoted: m });
        } catch (err) {
            console.error(`Kesalahan saat memproses list: ${err.message}`);
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};