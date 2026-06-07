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

// Fungsi validasi tanggal lahir (dd-mm-yyyy)
function isValidDate(dateStr) {
    const regex = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = dateStr.match(regex);
    if (!match) return false;
    const [, day, month, year] = match;
    const date = new Date(year, month - 1, day);
    return date.getDate() == day && date.getMonth() == month - 1 && date.getFullYear() == year;
}

// Fungsi bersihkan nomor (hapus +, spasi, -, konversi ke 62 jika 0)
function cleanPhoneNumber(phone) {
    let cleaned = phone.replace(/[\s-+]/g, '');
    if (cleaned.startsWith('0')) cleaned = '62' + cleaned.slice(1);
    if (!cleaned.startsWith('62')) cleaned = '62' + cleaned;
    return cleaned + '@s.whatsapp.net';
}

// Format mentahan untuk disalin (hanya untuk error)
const formatMentahan = `addultah nama : 
tanggal lahir: 
nomor :`;

// Format contoh untuk pesan error
const formatContoh = `> -----------------------------------
addultah nama : ghofar
tanggal lahir: 07-10-2004
nomor : +6282268881337
> -----------------------------------`;

module.exports = {
    name: 'addultah',
    alias: [],
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

            // Parse multi-line input, pastikan 'addultah' di awal baris pertama
            const lines = body.split('\n').map(line => line.trim());
            if (!lines[0].toLowerCase().startsWith('addultah')) {
                return; // Abaikan jika 'addultah' tidak di awal
            }

            // Extract data
            let nama = '', tanggalLahir = '', nomor = '';
            for (let line of lines) {
                if (line.toLowerCase().startsWith('addultah nama :')) {
                    nama = line.replace(/addultah nama :/i, '').trim();
                } else if (line.toLowerCase().startsWith('tanggal lahir:')) {
                    tanggalLahir = line.replace(/tanggal lahir:/i, '').trim();
                } else if (line.toLowerCase().startsWith('nomor :')) {
                    nomor = line.replace(/nomor :/i, '').trim();
                }
            }

            // Validasi input
            if (!nama || !tanggalLahir || !nomor) {
                await naze.sendMessage(m.chat, { 
                    text: `Maaf format salah, silahkan isi format seperti contoh dibawah ini:\n${formatContoh}` 
                }, { quoted: m });
                await naze.sendMessage(m.chat, { 
                    text: formatMentahan 
                }, { quoted: m });
                return;
            }

            if (!isValidDate(tanggalLahir)) {
                await naze.sendMessage(m.chat, { 
                    text: `⚠️ Format tanggal lahir salah! Gunakan DD-MM-YYYY (contoh: 07-10-2004).\nSilahkan isi format seperti contoh dibawah ini:\n${formatContoh}` 
                }, { quoted: m });
                await naze.sendMessage(m.chat, { 
                    text: formatMentahan 
                }, { quoted: m });
                return;
            }

            const cleanedNomor = cleanPhoneNumber(nomor);
            if (!cleanedNomor.endsWith('@s.whatsapp.net')) {
                await naze.sendMessage(m.chat, { 
                    text: `⚠️ Format nomor salah! Contoh: +6282268881337 atau 082268881337.\nSilahkan isi format seperti contoh dibawah ini:\n${formatContoh}` 
                }, { quoted: m });
                await naze.sendMessage(m.chat, { 
                    text: formatMentahan 
                }, { quoted: m });
                return;
            }

            // Load dan cek DB
            let ultahDb = loadUltahDb();
            if (!ultahDb[m.chat]) ultahDb[m.chat] = [];
            if (ultahDb[m.chat].find(u => u.nama.toLowerCase() === nama.toLowerCase())) {
                await naze.sendMessage(m.chat, { 
                    text: `⚠️ Nama "${nama}" sudah terdaftar di grup ini!\nSilahkan isi format seperti contoh dibawah ini:\n${formatContoh}` 
                }, { quoted: m });
                await naze.sendMessage(m.chat, { 
                    text: formatMentahan 
                }, { quoted: m });
                return;
            }

            // Simpan data
            ultahDb[m.chat].push({ nama: nama.trim(), tanggal_lahir: tanggalLahir.trim(), nomor: cleanedNomor });
            saveUltahDb(ultahDb);
            global.db.ultah = ultahDb;

            // Kirim satu pesan saat sukses
            await naze.sendMessage(m.chat, { 
                text: `🎉 *Berhasil tambah ultah!*\n\n👤 Nama: ${nama}\n📅 Tanggal Lahir: ${tanggalLahir}\n📱 Nomor: ${nomor}` 
            }, { quoted: m });

        } catch (err) {
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};