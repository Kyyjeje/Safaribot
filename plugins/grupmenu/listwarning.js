const fs = require('fs');
const path = require('path');
require('../../settings');
const dbPath = path.join(__dirname, '../../database/warning.json');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));

module.exports = {
    name: 'listwarning',
    alias: ['listwarn', 'cek warn', 'listwarning'],
    description: 'Lihat daftar warning',
    run: async ({ naze, m }) => {
        if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
      if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
      if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

        let db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        const gid = m.chat;
        if (!db[gid]?.users || Object.keys(db[gid].users).length === 0) {
            return m.reply('Belum ada yang kena warning di grup ini.');
        }

        const metadata = await naze.groupMetadata(m.chat);

        // Mulai debug log
        console.log(`\n[DEBUG LISTWARNING] Grup: ${gid}`);

        let teks = `*DAFTAR WARNING*\n`;
        teks += `Limit grup: *${db[gid].limit || 3}* kali\n\n`;

        let no = 1;
        const mentions = [];

        for (let jid in db[gid].users) {
            const data = db[gid].users[jid];
            const num = jid.split('@')[0];
            mentions.push(jid);

            // FIX: bandingkan p.jid (real JID) dengan jid dari database
            const masihDiGrup = metadata.participants.some(p => p.jid === jid);

            // Status dari database
            const dbKickStatus = data.kick ? true : false;
            const dbStatusText = dbKickStatus ? 'Sudah dikick' : 'Masih di grup';

            // Final status: prioritas metadata
            let finalStatus;
            if (masihDiGrup) {
                finalStatus = 'Masih di grup';
            } else {
                finalStatus = 'Sudah keluar grup';
            }

            // CONSOLE LOG DEBUG PER USER
            console.log(`User: ${jid}`);
            console.log(`- Dari Database : ${dbStatusText} (${dbKickStatus})`);
            console.log(`- Dari Metadata : ${masihDiGrup ? 'Masih di grup' : 'Sudah keluar grup'} (${masihDiGrup})`);
            console.log(`→ Status Final  : ${finalStatus}`);
            console.log('---');

            const sisa = (db[gid].limit || 3) - data.count;

            teks += `${no++}. @${num}\n`;
            teks += ` ├ Warning: ${data.count}/${db[gid].limit || 3}\n`;
            teks += ` └ Status: ${finalStatus}\n\n`;
        }

        // Akhiri debug grup
        console.log(`[DEBUG SELESAI] Total user diwarning: ${Object.keys(db[gid].users).length}\n`);

        naze.sendMessage(m.chat, { text: teks.trim(), mentions }, { quoted: m });
    }
};