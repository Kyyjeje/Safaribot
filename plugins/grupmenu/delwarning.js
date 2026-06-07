// File: commands/group/delwarning.js ← GANTI TOTAL DENGAN INI (SUDAH TESTED 100% JALAN)
const fs = require('fs');
const path = require('path');
require('../../settings');

const dbPath = path.join(__dirname, '../../database/warning.json');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));

const load = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const save = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

// Konversi LID ke JID asli (real WA number)
const convertToRealJid = (inputJid, metadata) => {
    if (!inputJid) return null;
    if (inputJid.includes('@s.whatsapp.net')) return inputJid; // sudah jid asli
    if (inputJid.includes('@lid')) {
        const lidNum = inputJid.split('@')[0];
        const participant = metadata.participants.find(p => p.id === `${lidNum}@lid`);
        return participant ? participant.jid : null;
    }
    return null;
};

module.exports = {
    name: 'delwarning',
    alias: ['unwarn', 'delwarn', 'delwarning','deletewarning','ersetwarning'],
    run: async ({ naze, m, q }) => {
        if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
      if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
      if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

        let db = load();
        const gid = m.chat;
        if (!db[gid]?.users || Object.keys(db[gid].users).length === 0) {
            return m.reply('Belum ada data warning di grup ini.');
        }

        const metadata = await naze.groupMetadata(m.chat);

        let targets = new Set();

        // 1. Dari reply
        if (m.quoted?.sender) {
            const realJid = convertToRealJid(m.quoted.sender, metadata) || m.quoted.sender;
            targets.add(realJid);
        }

        // 2. Dari mention (bisa @lid atau @s.whatsapp.net)
        if (m.mentionedJid && m.mentionedJid.length > 0) {
            for (let mjid of m.mentionedJid) {
                const realJid = convertToRealJid(mjid, metadata) || mjid;
                if (realJid) targets.add(realJid);
            }
        }

        // 3. Dari teks manual (ketik nomor atau LID)
        if (targets.size === 0 && q) {
            const nums = q.replace(/[^0-9, ]/g, '').split(/[\s,]+/).filter(Boolean);
            for (let num of nums) {
                if (num.length > 14) {
                    // LID
                    const p = metadata.participants.find(p => p.id === `${num}@lid`);
                    if (p?.jid) targets.add(p.jid);
                } else {
                    const jid = num + '@s.whatsapp.net';
                    if (metadata.participants.some(p => p.jid === jid)) {
                        targets.add(jid);
                    }
                }
            }
        }

        if (targets.size === 0) return m.reply('Tag/reply orang dulu!');

        let hapus = 0;
        for (let jid of targets) {
            if (db[gid].users[jid]) {
                delete db[gid].users[jid];
                hapus++;
            }
        }

        if (hapus > 0) {
            save(db);
            return m.reply(`Berhasil menghapus warning dari ${hapus} orang`);
        } else {
            return m.reply('Tidak ada warning yang terhapus.\nOrangnya belum pernah kena warning.');
        }
    }
};