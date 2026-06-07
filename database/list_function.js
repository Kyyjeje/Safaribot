const fs = require('fs');
const path = require('path');

const getGreeting = () => {
    const now = new Date();
    const hour = parseInt(now.toLocaleString('id-ID', { hour: 'numeric', timeZone: 'Asia/Jakarta' }));
    if (hour >= 5 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
};

const placeholderDescriptions = {
    '@list': 'Daftar perintah di grup',
    '@user': 'Tag user yang kirim perintah',
    '@ownername': 'Nama pemilik bot',
    '@ownernumber': 'Nomor pemilik bot',
    '@botname': 'Nama bot',
    '@botnumber': 'Nomor bot',
    '@grup': 'Nama grup saat ini',
    '@time': 'Waktu saat ini (HH:mm:ss)',
    '@date': 'Tanggal saat ini (DD MMMM YYYY)',
    '@day': 'Hari saat ini',
    '@greeting': 'Ucapan sesuai waktu'
};

const replacePlaceholders = async (text, m, naze, TextList = []) => {
    const sender = m.sender.split('@')[0];
    const userName = m.pushName || sender;

    const ownerNumber = global.owner[0] || 'Tidak diketahui';
    const ownerName = global.ownername || 'Tidak diketahui';

    const botName = global.botname || 'BangsulBotz';
    const botNumber = global.number_bot || 'Tidak diketahui';

    let groupName = 'Grup Tidak Diketahui';
    try {
        const groupMetadata = await naze.groupMetadata(m.chat);
        groupName = groupMetadata.subject || groupName;
    } catch (err) {
        console.error(`[ERROR] ${new Date().toISOString()} - Gagal mendapatkan nama grup: ${err.message}`);
    }

    const now = new Date();
    const time = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Jakarta'
    });
    const date = now.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta'
    });
    const day = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        timeZone: 'Asia/Jakarta'
    });
    const greeting = getGreeting();

    // Cari baris yang mengandung simbol + @list
    let listSymbol = '-'; // default
    const lines = text.split('\n');
    for (let line of lines) {
        const match = line.trim().match(/^(.+?)\s+@list$/);
        if (match) {
            listSymbol = match[1].trim();
            break;
        }
    }

    // Buat isi daftar
    let listNames = 'Tidak ada perintah yang tersimpan.';
    if (TextList.length > 0) {
        listNames = TextList.map(item => `${listSymbol} ${item.name}`).join('\n');
    }

    // Ganti semua placeholder
    let result = text
        .replace(/\(.+?\)\s*@list/g, listNames) // jika pakai simbol dalam kurung
        .replace(/.+?\s+@list/g, listNames)     // ganti baris yang pakai simbol
        .replace(/@list/g, listNames)           // fallback
        .replace(/@user/g, userName)
        .replace(/@ownername/g, ownerName)
        .replace(/@ownernumber/g, ownerNumber)
        .replace(/@botname/g, botName)
        .replace(/@botnumber/g, botNumber)
        .replace(/@grup/g, groupName)
        .replace(/@time/g, time)
        .replace(/@date/g, date)
        .replace(/@day/g, day)
        .replace(/@greeting/g, greeting);

    return result;
};

module.exports = { replacePlaceholders, placeholderDescriptions };
