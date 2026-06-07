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

// Fungsi format durasi (dari mute.js)
function formatDuration(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    let result = [];
    if (days > 0) result.push(`${days} hari`);
    if (hours > 0) result.push(`${hours} jam`);
    if (minutes > 0) result.push(`${minutes} menit`);
    if (seconds > 0 && days === 0 && hours === 0 && minutes === 0) result.push(`${seconds} detik`);

    return result.length > 0 ? result.join(', ') : 'sebentar';
}

// Fungsi menghitung mundur ke ulang tahun berikutnya (jam 00:00)
function calculateCountdown(tanggalLahir) {
    const today = new Date();
    const [day, month] = tanggalLahir.split('-').map(Number);
    let year = today.getFullYear();
    
    // Tentukan tanggal ulang tahun berikutnya pada jam 00:00
    let nextBirthday = new Date(year, month - 1, day, 0, 0, 0);
    if (nextBirthday <= today) {
        nextBirthday = new Date(year + 1, month - 1, day, 0, 0, 0);
    }
    
    const diffMs = nextBirthday - today;
    return formatDuration(diffMs);
}

// Fungsi untuk mengurutkan berdasarkan tanggal dan bulan
function sortByDate(list) {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // Bulan saat ini (1-12)
    const currentDay = today.getDate(); // Tanggal saat ini

    return list.sort((a, b) => {
        const [aDay, aMonth] = a.tanggal_lahir.split('-').map(Number);
        const [bDay, bMonth] = b.tanggal_lahir.split('-').map(Number);

        // Hitung jarak dari bulan saat ini
        const aMonthDistance = (aMonth - currentMonth + 12) % 12 || (aMonth === currentMonth ? aDay - currentDay : 0);
        const bMonthDistance = (bMonth - currentMonth + 12) % 12 || (bMonth === currentMonth ? bDay - currentDay : 0);

        // Bandingkan berdasarkan bulan, lalu tanggal
        if (aMonthDistance !== bMonthDistance) {
            return aMonthDistance - bMonthDistance;
        }
        return aDay - bDay;
    });
}

// Fungsi format tanggal lengkap (WIB)
function formatCurrentDate() {
    const date = new Date();
    const options = {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta'
    };
    const formattedDate = date.toLocaleString('id-ID', options);
    return `${formattedDate} WIB`;
}

module.exports = {
    name: 'listultah',
    alias: [],
    
    run: async ({ naze, m }) => {
        try {
            if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
            if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

            // Load DB
            const ultahDb = loadUltahDb();
            if (!ultahDb[m.chat] || ultahDb[m.chat].length === 0) {
                return naze.sendMessage(m.chat, { text: `📝 Belum ada data ultah di grup ini.` }, { quoted: m });
            }

            // Urutkan data
            const sortedList = sortByDate([...ultahDb[m.chat]]);

            // Buat output dengan tanggal saat ini
            const currentDate = formatCurrentDate();
            let listText = `📋 *Daftar Ultah Grup (Diurutkan)*\n🕒 Tanggal Saat Ini: ${currentDate}\n\n`;
            sortedList.forEach((u, idx) => {
                const countdown = calculateCountdown(u.tanggal_lahir);
                listText += `> -------------------------\n`;
                listText += `- Nama: ${u.nama}\n`;
                listText += `- Tanggal Lahir: ${u.tanggal_lahir}\n`;
                listText += `- Nomor: ${u.nomor.split('@')[0]}\n`;
                listText += `- Hitung Mundur: \n${countdown}\n`;
                listText += `> -------------------------\n\n`;
            });
            await naze.sendMessage(m.chat, { text: listText }, { quoted: m });

        } catch (err) {
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};