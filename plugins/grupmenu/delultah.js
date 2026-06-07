require('../../settings');
const fs = require('fs');
const path = require('path');

const ultahDbPath = './database/database_ultah.json';

// Fungsi load DB ultah
function loadUltahDb() {
    if (!fs.existsSync(ultahDbPath)) {
        fs.writeFileSync(ultahDbPath, JSON.stringify({}, null, 2));
        return {};
    }
    return JSON.parse(fs.readFileSync(ultahDbPath, 'utf8'));
}

// Fungsi save DB ultah
function saveUltahDb(data) {
    fs.writeFileSync(ultahDbPath, JSON.stringify(data, null, 2));
}

// Format contoh untuk pesan error (sama dengan addultah.js)
const formatContoh = `> -----------------------------------
addultah nama : ghofar
tanggal lahir: 07-10-2004
nomor : +6282268881337
> -----------------------------------`;

module.exports = {
    name: 'delultah',
    alias: [],
    //description: 'Menghapus data ulang tahun (admin only)\nFormat: delultah <nama>',
    run: async ({ naze, m }) => {
        try {
            if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
            //if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
            if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

            // Ekstrak body
            const body = m.type === 'conversation' ? m.message?.conversation || '' :
                         m.type === 'imageMessage' ? m.message?.imageMessage?.caption || '' :
                         m.type === 'videoMessage' ? m.message?.videoMessage?.caption || '' :
                         m.type === 'extendedTextMessage' ? m.message?.extendedTextMessage?.text || '' :
                         m.type === 'buttonsResponseMessage' ? m.message?.buttonsResponseMessage?.selectedButtonId || '' :
                         m.type === 'listResponseMessage' ? m.message?.listResponseMessage?.singleSelectReply?.selectedRowId || '' :
                         m.type === 'templateButtonReplyMessage' ? m.message?.templateButtonReplyMessage?.selectedId || '' :
                         m.type === 'messageContextInfo' ? (m.message?.buttonsResponseMessage?.selectedButtonId || m.message?.listResponseMessage?.singleSelectReply.selectedRowId || m.text || '') : '';
            
            const args = body.trim().split(/ +/).slice(1);
            const namaToDel = args.join(' ').trim();

            if (!namaToDel) {
                await naze.sendMessage(m.chat, { 
                    text: `Maaf format salah! Gunakan: \`${m.prefix}delultah <nama sesuai di list ultah>\`\nContoh: \`${m.prefix}delultah Ghofar\`\n\nUntuk menambah data, gunakan format seperti berikut:\n${formatContoh}` 
                }, { quoted: m });
                return;
            }

            // Load dan cek DB
            let ultahDb = loadUltahDb();
            if (!ultahDb[m.chat]) ultahDb[m.chat] = [];
            const index = ultahDb[m.chat].findIndex(u => u.nama.toLowerCase() === namaToDel.toLowerCase());
            if (index === -1) {
                await naze.sendMessage(m.chat, { 
                    text: `⚠️ Nama "${namaToDel}" tidak ditemukan di daftar ultah grup ini!\n\nUntuk menambah data, gunakan format seperti berikut:\n${formatContoh}` 
                }, { quoted: m });
                return;
            }

            // Hapus data
            const deleted = ultahDb[m.chat].splice(index, 1)[0];
            saveUltahDb(ultahDb);
            global.db.ultah = ultahDb;

            await naze.sendMessage(m.chat, { 
                text: `🗑️ *Berhasil hapus ultah!*\n\n👤 Nama: ${deleted.nama}\n📅 Tanggal Lahir: ${deleted.tanggal_lahir}\n📱 Nomor: ${deleted.nomor.split('@')[0]}` 
            }, { quoted: m });

        } catch (err) {
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};