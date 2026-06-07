const fs = require('fs');
const path = require('path');
require('../../settings');

const dbPath = path.join(__dirname, '../../database/warning.json');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));

module.exports = {
    name: 'limitwarning',
    alias: ['setlimitwarn', 'limitwarning'],
    description: '<jumlah>',
    run: async ({ naze, m, q }) => {
        if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
      if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
      if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

        if (!q || isNaN(q)) return m.reply('Masukkan angka!\nContoh: .limitwarning 5');
        const limit = parseInt(q);
        if (limit < 1 || limit > 10) return m.reply('Limit harus 1-10');

        let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        const gid = m.chat;
        if (!db[gid]) db[gid] = { limit: 3, users: {} };
        db[gid].limit = limit;
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        m.reply(`Limit warning grup ini diubah jadi *${limit}* kali`);
    }
};