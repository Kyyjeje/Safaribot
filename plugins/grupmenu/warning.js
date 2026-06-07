// File: commands/group/warning.js ← GANTI TOTAL, PASTI JADI!
const fs = require('fs');
const path = require('path');
require('../../settings');

const dbPath = path.join(__dirname, '../../database/warning.json');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));

const load = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const save = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

module.exports = {
    name: 'warning',
    alias: ['warn', 'warning'],
    run: async ({ naze, m, q }) => {
        if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
      if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
      if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

        const metadata = await naze.groupMetadata(m.chat);
        let db = load();
        const gid = m.chat;
        if (!db[gid]) db[gid] = { limit: 3, users: {} };

        let targets = new Set();
        if (m.quoted?.sender) targets.add(m.quoted.sender);
        if (m.mentionedJid?.length) m.mentionedJid.forEach(j => targets.add(j));
        if (targets.size === 0 && q) {
            const nums = q.trim().split(/\s+|,/).map(t => t.replace(/[^0-9]/g, '')).filter(Boolean);
            for (let num of nums) {
                let jid = num.length > 14
                    ? metadata.participants.find(p => p.id === `${num}@lid`)?.jid
                    : num + '@s.whatsapp.net';
                if (jid) targets.add(jid);
            }
        }
        if (targets.size === 0) return m.reply('Tag/reply dulu bro!');

        // Force WIB (UTC+7)
const now = new Date();
const wibOffset = 7 * 60; // +7 jam dalam menit
const wibTime = new Date(now.getTime() + wibOffset * 60 * 1000);

// Tanggal tetap pakai locale biar formatnya bagus (13 Desember 2025)
const tanggal = wibTime.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
});

// Jam manual biar PASTI pakai titik dua (:)
const hours = wibTime.getHours().toString().padStart(2, '0');
const minutes = wibTime.getMinutes().toString().padStart(2, '0');
const jam = `${hours}:${minutes}`;

        for (let rawJid of targets) {
            let jid = rawJid.includes('@lid')
                ? metadata.participants.find(p => p.id === rawJid)?.jid || rawJid
                : rawJid;

            if (jid === m.sender || jid === naze.user.jid) continue;

            db[gid].users[jid] ??= { count: 0, kick: false };
            db[gid].users[jid].count += 1;

            const count = db[gid].users[jid].count;
            const sisa  = db[gid].limit - count;
            const num   = jid.split('@')[0];

            // INI YANG BENER-BENER PERSIS DENGAN YANG KAMU COPY DARI WA
            let text = `*⚠️WARNING MEMBER*\n\n`;
            text += `\`User   :\` @${num}\n`;
            text += `\`Limit  :\` ${count}/${db[gid].limit}\n`;
            text += `\`Tanggal:\` ${tanggal}\n`;
            text += `\`Jam    :\` ${jam}\n`;
            text += `Sisa toleransi: \`${sisa < 0 ? 0 : sisa}x lagi\`\n\n`;
            text += `*💬PESAN:*\n`;

            if (sisa > 1) {
                text += `> Jangan diulangi.`;
            } else if (sisa === 1) {
                text += `> Ini adalah warning terakhir Anda.\n> Jika melanggar lagi, Anda akan dikeluarkan dari grup.`;
            } else {
                text += `> Anda telah melanggar ${db[gid].limit} kali.\n> Anda dikeluarkan dari grup sekarang.`;
            }

            await naze.sendMessage(m.chat, { text, mentions: [jid] }, { quoted: m });

            // Langsung kick kalau sudah habis
            if (count >= db[gid].limit && !db[gid].users[jid].kick) {
                db[gid].users[jid].kick = true;
                save(db);
                try {
                    await naze.groupParticipantsUpdate(m.chat, [jid], 'remove');
                } catch (e) {}
            }
        }
        save(db);
    }
};