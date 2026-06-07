const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');

const pendingBackups = [];

const isNazeReady = (naze) => {
    return naze && typeof naze.sendMessage === 'function' && naze.user && naze.user.id;
};

function formatDateTime(date) {
    const updateDateTime = date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Jakarta'
    });

    const [tanggalRaw, waktuRaw] = updateDateTime.split(', ');
    const tanggal = tanggalRaw || 'Unknown-Date';
    const waktu = waktuRaw ? waktuRaw.replace(/\./g, ':') : 'Unknown-Time';

    return {
        tanggal,
        waktu: waktu.replace(/:/g, '.'),
        full: tanggal.replace(/ /g, '-') + '_' + waktu.replace(/:/g, '_')
    };
}

const deleteSessionFiles = async (naze, ownerJid) => {
    const folderPath = './nazedev';
    const mainSessionFile = 'creds.json';
    try {
        const files = await fs.readdir(folderPath);
        const sessionFiles = files.filter(file => file !== mainSessionFile);
        for (const file of sessionFiles) {
            await fs.unlink(path.join(folderPath, file));
        }
        return true;
    } catch (err) {
        console.error(`Gagal menghapus file sesi: ${err.message}`);
        if (isNazeReady(naze) && ownerJid) {
            await naze.sendMessage(ownerJid, { text: `❌ Gagal menghapus file sesi: ${err.message}` });
            await global.handleError(naze, null, err, { sendRawError: true, useGemini: true });
        }
        return false;
    }
};

const backupPlugins = async (naze, filename, folderName, ownerJid) => {
    if (!isNazeReady(naze)) {
        console.error('Instance naze tidak valid atau sendMessage tidak tersedia.');
        return false;
    }

    const { tanggal, waktu, full } = formatDateTime(new Date());
    const outputPath = `./BangsulBotz_${full}.zip`;
    const fileName = `BangsulBotz_${full}.zip`;

    const output = require('fs').createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    const message = `
🔄 Plugin Update Detected 🔄
📦 Plugin: ${filename}
📅 Tanggal: ${tanggal}
✅ Status: Backup selesai
`.trim();


    return new Promise((resolve, reject) => {
        output.on('close', async () => {
            try {
                await naze.sendMessage(ownerJid, {
                    document: { url: outputPath },
                    mimetype: 'application/zip',
                    fileName: fileName,
                    caption: message
                });
                await fs.unlink(outputPath);
                resolve(true);
            } catch (err) {
                console.error(`Gagal mengirim file ZIP: ${err.message}`);
                await naze.sendMessage(ownerJid, {
                    text: `❌ Gagal mengirim file ZIP: ${err.message}`
                });
                await global.handleError(naze, null, err, { sendRawError: true, useGemini: true });
                reject(err);
            }
        });

        archive.on('error', async (err) => {
            console.error(`Gagal mengarsipkan: ${err.message}`);
            await naze.sendMessage(ownerJid, {
                text: `❌ Gagal mengarsipkan: ${err.message}`
            });
            await global.handleError(naze, null, err, { sendRawError: true, useGemini: true });
            reject(err);
        });

        archive.pipe(output);
        archive.directory('./data/', 'data');
        archive.directory('./database/', 'database');
        archive.directory('./lib/', 'lib');
        archive.directory('./src/', 'src');
        archive.directory('./nazedev/', 'nazedev');
        archive.directory('./plugins/', 'plugins');
        archive.file('./generics.js', { name: 'generics.js' });
        archive.file('./index.js', { name: 'index.js' });
        archive.file('./naze.js', { name: 'naze.js' });
        archive.file('./package.json', { name: 'package.json' });
        archive.file('./README.md', { name: 'README.md' });
        archive.file('./runspeed.py', { name: 'runspeed.py' });
        archive.file('./settings.js', { name: 'settings.js' });
        archive.file('./setting-panel.js', { name: 'setting-panel.js' });
        archive.file('./speed.py', { name: 'speed.py' });
        archive.file('./start.js', { name: 'start.js' });
        archive.file('./start(original).js', { name: 'start(original).js' });
        archive.file('./verify(original).js', { name: 'verify(original).js' });
        archive.file('./verify1.js', { name: 'verify1.js' });
        archive.finalize();
    });
};

const processPendingBackups = async (naze) => {
    if (!isNazeReady(naze)) return;
    while (pendingBackups.length > 0) {
        const { filename, folderName, ownerJid } = pendingBackups.shift();
        console.log(`Memproses backup tertunda untuk "${filename}" di folder "${folderName}".`);
        await deleteSessionFiles(naze, ownerJid);
        await backupPlugins(naze, filename, folderName, ownerJid);
    }
};

const triggerBackup = async (naze, filename, folderName, ownerJid) => {
    if (!isNazeReady(naze)) {
        console.log(`Instance naze belum siap, menambahkan "${filename}" ke antrean backup.`);
        pendingBackups.push({ filename, folderName, ownerJid });
        return;
    }

    await deleteSessionFiles(naze, ownerJid);
    await backupPlugins(naze, filename, folderName, ownerJid);
};

const checkNazeReady = setInterval(() => {
    if (isNazeReady(global.naze)) {
        processPendingBackups(global.naze);
        clearInterval(checkNazeReady);
    }
}, 5000);

module.exports = { triggerBackup, processPendingBackups };
