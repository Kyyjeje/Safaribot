require('./settings');
const fs = require('fs');
const pino = require('pino');
const chalk = require('chalk');
const readline = require('readline');
const { Boom } = require('@hapi/boom');
const NodeCache = require('node-cache');
const { exec } = require('child_process');
const { parsePhoneNumber } = require('awesome-phonenumber');
const path = require('path');
const { default: WAConnection, useMultiFileAuthState, Browsers, DisconnectReason, makeInMemoryStore, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = require('baileys');
const { default: axios } = require('axios');
const { verifySession } = require('./verify1');

require('./settings');

const pairingCode = process.argv.includes('--qr') ? false : process.argv.includes('--pairing-code') || global.pairing_code;
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));
const processedEvents = new Set();
const ultahDbPath = './database/database_ultah.json';
const teksUltahPath = './src/teks_ultah.json';
const DataBase = require('./src/database');
const database = new DataBase(global.tempatDB);
const msgRetryCounterCache = new NodeCache();
const groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false });

// Fungsi untuk delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Wrapper untuk sendMessage dengan retry pada rate-overlimit
async function sendMessageWithRetry(originalSendMessage, naze, chatId, message, options = {}, maxRetries = 3, retryDelay = 10000) {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const result = await originalSendMessage(chatId, message, options);
            return result;
        } catch (err) {
            if (err instanceof Boom && err.data === 429) {
                retries++;
                console.log(`[RATE LIMIT] sendMessage attempt ${retries}/${maxRetries} failed for ${chatId}. Waiting ${retryDelay / 1000} seconds...`);
                if (retries === maxRetries) {
                    console.error(`[RATE LIMIT] Max retries reached for sendMessage ${chatId}.`);
                    throw new Error('Max retries reached for sendMessage rate-overlimit');
                }
                await delay(retryDelay);
            } else {
                throw err;
            }
        }
    }
}

// Fungsi untuk mengambil metadata grup dengan retry
async function groupMetadataWithRetry(originalGroupMetadata, naze, jid, store, maxRetries = 3, retryDelay = 10000) {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const result = await originalGroupMetadata(jid);
            result.participants = result.participants
                ?.filter(p => p.hasOwnProperty('id') && p.hasOwnProperty('jid') && p.hasOwnProperty('admin'))
                ?.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
                || [];
            result.addressingMode = result.addressingMode || 'jid';
            store.groupMetadata[jid] = result;
            console.log(`[GROUP] Metadata grup ${jid} berhasil diambil dan disimpan ke store`);
            return result;
        } catch (err) {
            if (err instanceof Boom && (err.data === 429 || err.data === 428)) {
                retries++;
                if (retries === maxRetries) {
                    const fallback = { participants: [], addressingMode: 'jid' };
                    store.groupMetadata[jid] = fallback;
                    return fallback;
                }
                await delay(retryDelay);
            } else {
                const fallback = { participants: [], addressingMode: 'jid' };
                store.groupMetadata[jid] = fallback;
                return fallback;
            }
        }
    }
}

async function initializeGalauListCache() {
    try {
        const dirPath = path.join(__dirname, 'data/assets/galau/');
        let localFiles = [];
        if (fs.existsSync(dirPath)) {
            localFiles = fs.readdirSync(dirPath)
                .filter(file => file.endsWith('.mp3'))
                .map(file => ({ name: file, source: 'local', path: path.join(dirPath, file) }));
        }

        const repoUrl = 'https://api.github.com/repos/BANGSULSTAR/sound_galau/contents/';
        const response = await axios.get(repoUrl, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
        const githubFiles = response.data
            .filter(file => file.name.endsWith('.mp3'))
            .map(file => ({ name: file.name, source: 'github', path: `https://raw.githubusercontent.com/BANGSULSTAR/sound_galau/main/${file.name}` }));

        const allFiles = [...localFiles, ...githubFiles].sort((a, b) => a.name.localeCompare(b.name));

        if (allFiles.length === 0) {
            return;
        }

        const songList = allFiles.map((file, index) => ({
            number: index + 1,
            file: file.name,
            name: file.name.replace('.mp3', ''),
            source: file.source,
            path: file.path
        }));
        global.galauListCache = songList;
    } catch (err) {
        // Silent error
    }
}

// Fungsi untuk membungkus instance naze untuk sendMessage
function wrapNazeSendMessage(naze) {
    const originalSendMessage = naze.sendMessage;
    naze.sendMessage = async (chatId, message, options = {}) => {
        return sendMessageWithRetry(originalSendMessage, naze, chatId, message, options);
    };
    return naze;
}

// Fungsi untuk membungkus naze.groupMetadata
function wrapNazeGroupMetadata(naze, store) {
    const originalGroupMetadata = naze.groupMetadata;
    naze.groupMetadata = async (jid) => {
        if (store.groupMetadata?.[jid]) {
            return store.groupMetadata[jid];
        }
        return groupMetadataWithRetry(originalGroupMetadata.bind(naze), naze, jid, store);
    };
    return naze;
}

(async () => {
    const loadData = await database.read();
    if (loadData && Object.keys(loadData).length === 0) {
        global.db = {
            set: {},
            users: {},
            game: {},
            groups: {},
            database: {},
            ...(loadData || {}),
        };
        await database.write(global.db);
    } else {
        global.db = loadData;
    }
    
    setInterval(async () => {
        if (global.db) await database.write(global.db);
    }, 30000);
})();

const { GroupUpdate, GroupParticipantsUpdate, MessagesUpsert, Solving } = require('./src/message');

async function startNazeBot() {
    const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
    
    const credsPath = './nazedev/creds.json';
    const backupPath = './creds_backup.json';
    if (!fs.existsSync(credsPath) && fs.existsSync(backupPath)) {
        console.log('🚧 creds.json tidak ditemukan di nazedev, tetapi backup ditemukan. Mengembalikan dari creds_backup.json...');
        fs.copyFileSync(backupPath, credsPath);
        console.log('✅ creds.json berhasil dikembalikan ke nazedev/creds.json');
    }

    const { state, saveCreds } = await useMultiFileAuthState('nazedev');
    const { isLatest } = await fetchLatestBaileysVersion();
    const level = pino({ level: 'silent' });
    
    const getMessage = async (key) => {
        if (store) {
            const msg = await store.loadMessage(key.remoteJid, key.id);
            return msg?.message || '';
        }
        return {
            conversation: 'Halo Saya BangsulBot'
        };
    };
    
    let naze = WAConnection({
        isLatest,
        logger: level,
        getMessage,
        syncFullHistory: false,
        maxMsgRetryCount: 15,
        msgRetryCounterCache,
        retryRequestDelayMs: 10,
        defaultQueryTimeoutMs: 0,
        printQRInTerminal: !pairingCode,
        browser: Browsers.ubuntu('Chrome'),
        generateHighQualityLinkPreview: true,
        cachedGroupMetadata: async (jid) => groupCache.get(jid) || store.groupMetadata?.[jid],
        transactionOpts: {
            maxCommitRetries: 10,
            delayBetweenTriesMs: 10,
        },
        appStateMacVerification: {
            patch: true,
            snapshot: true,
        },
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, level),
        },
    });
    
    naze = wrapNazeSendMessage(naze);
    naze = wrapNazeGroupMetadata(naze, store);
    global.naze = naze;
    
    if (!store.groupMetadata) store.groupMetadata = {};
    
    if (pairingCode && !naze.authState.creds.registered && !fs.existsSync(credsPath)) {
        let phoneNumber;
    
        async function getPhoneNumber() {
            phoneNumber = global.number_bot ? global.number_bot : await question('Please type your WhatsApp number: ');
            phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
    
            if (!parsePhoneNumber(phoneNumber).valid && phoneNumber.length < 6) {
                console.log(chalk.bgBlack(chalk.redBright('Start with your Country WhatsApp code') + chalk.whiteBright(',') + chalk.greenBright(' Example : 62xxx')));
                await getPhoneNumber();
            }
        }
    
        setTimeout(async () => {
            await getPhoneNumber();
            await exec('rm -rf ./nazedev/*');
            let code = await naze.requestPairingCode(phoneNumber, `${global.customPairing}`);
            console.log(`🔥 Your Pairing Code: ${code}`);
        }, 3000);
    }
    
    store.bind(naze.ev);
    await Solving(naze, store);
    
    naze.ev.on('creds.update', saveCreds);
    
    naze.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, receivedPendingNotifications } = update;
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason === 429) {
                console.log('[RATE LIMIT] Rate limit exceeded, cooling down for 10 seconds...');
                await delay(10000);
                return;
            }
            if (reason === DisconnectReason.connectionLost) {
                console.log('Connection to Server Lost, Attempting to Reconnect...');
                naze.ev.removeAllListeners();
                startNazeBot();
            } else if (reason === DisconnectReason.connectionClosed) {
                console.log('Connection closed, Attempting to Reconnect...');
                naze.ev.removeAllListeners();
                startNazeBot();
            } else if (reason === DisconnectReason.restartRequired) {
                console.log('Restart Required...');
                naze.ev.removeAllListeners();
                startNazeBot();
            } else if (reason === DisconnectReason.timedOut) {
                console.log('Connection Timed Out, Attempting to Reconnect...');
                naze.ev.removeAllListeners();
                startNazeBot();
            } else if (reason === DisconnectReason.badSession) {
                console.log('Delete Session and Scan again...');
                naze.ev.removeAllListeners();
                startNazeBot();
            } else if (reason === DisconnectReason.connectionReplaced) {
                console.log('Close current Session first...');
                naze.ev.removeAllListeners();
                startNazeBot();
            } else if (reason === DisconnectReason.loggedOut) {
                console.log('Scan again and Run...');
                exec('rm -rf ./nazedev/*');
                process.exit(1);
            } else if (reason === DisconnectReason.Multidevicemismatch) {
                console.log('Scan again...');
                exec('rm -rf ./nazedev/*');
                process.exit(0);
            } else {
                naze.end(`Unknown DisconnectReason : ${reason}|${connection}`);
            }
        }
        if (connection == 'open') {
            console.log('=== 🎉 KONEKSI BERHASIL ===');
            console.log(chalk.magentaBright('Connected to :'));
            console.log(chalk.cyanBright(JSON.stringify(naze.user, null, 2) + '\n'));
            let botNumber = await naze.decodeJid(naze.user.id);
            if (naze.authState.creds.registered) {
                const phoneNumberFromSession = naze.authState.creds.me?.id.match(/^(\d+)/)?.[1] || null;
                if (phoneNumberFromSession) {
                    await verifySession(naze, global.number_bot);
                }
            }
            await initializeGalauListCache();
            if (naze.authState.creds.registered) {
                if (fs.existsSync(credsPath)) {
                    fs.copyFileSync(credsPath, backupPath);
                    console.log('✅ creds.json berhasil dibackup ke creds_backup.json');
                }
            }

            if (naze.groupMetadata) {
                naze.groupMetadata = wrapNazeGroupMetadata(naze.groupMetadata);
            }

            if (global.my.gc.length > 0 && global.my.gc.includes('whatsapp.com')) {
                console.log(chalk.yellowBright('➕ Menambahkan bot ke grup...'));
                await naze.groupAcceptInvite(global.my.gc?.split('https://chat.whatsapp.com/')[1]).then(async grupnya => {
                    await naze.chatModify({ archive: true }, grupnya, []);
                    db.set[botNumber].join = true;
                    console.log(chalk.greenBright('✅ Bot berhasil bergabung ke grup dan diarsipkan.\n'));
                    try {
                        const metadata = await naze.groupMetadata(grupnya);
                        store.groupMetadata[grupnya] = metadata;
                        groupCache.set(grupnya, metadata);
                    } catch (err) {
                        console.error(`[ERROR] Gagal mengambil metadata grup baru ${grupnya}:`, err);
                    }
                });
            }
            console.log('=== =================== ===\n');
            
            // Cek ulang tahun saat bot start
            await checkBirthdays(naze);
        }
        if (receivedPendingNotifications == 'true') {
            console.log('Please wait About 1 Minute...');
            naze.ev.flush();
        }
    });
    
    naze.ev.on('messages.upsert', async (message) => {
        const msg = message.messages[0];
        const eventId = msg.key.id;
        if (processedEvents.has(eventId)) {
            return;
        }
        processedEvents.add(eventId);
        setTimeout(() => processedEvents.delete(eventId), 60000);

        await MessagesUpsert(naze, message, store);
    });

    naze.ev.on('contacts.update', async (update) => {
        for (let contact of update) {
            let id = naze.decodeJid(contact.id);
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
        }
    });
    
    naze.ev.on('call', async (call) => {
        let botNumber = await naze.decodeJid(naze.user.id);
        if (db.set[botNumber].anticall) {
            for (let id of call) {
                if (id.status === 'offer') {
                    let msg = await naze.sendMessage(id.from, { text: `Saat Ini, Kami Tidak Dapat Menerima Panggilan ${id.isVideo ? 'Video' : 'Suara'}.\nJika @${id.from.split('@')[0]} Memerlukan Bantuan, Silakan Hubungi Owner :)`, mentions: [id.from] });
                    await naze.sendContact(id.from, global.owner, msg);
                    await naze.rejectCall(id.id, id.from);
                }
            }
        }
    });
    
    naze.ev.on('groups.update', async (update) => {
        await GroupUpdate(naze, update, store);
    });
    
    naze.ev.on('group-participants.update', async (update) => {
        await GroupParticipantsUpdate(naze, update, store);
    });
    const { startRentalCheckInterval } = require('./src/ceksewa.js');
    const stopRentalCheck = startRentalCheckInterval(naze);
    
    function loadPlugins(dir, client) {
        fs.readdirSync(dir).forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.lstatSync(fullPath).isDirectory()) {
                loadPlugins(fullPath, client);
            } else if (file.endsWith('.js')) {
                try {
                    const plugin = require(fullPath);
                    if (plugin.name) {
                        client.plugins.set(plugin.name, plugin);
                        console.log(`✅ Plugin loaded: ${plugin.name}`);
                    }
                } catch (error) {
                    console.error(`❌ Error loading plugin ${file}:`, error);
                }
            }
        });
    }
    
    module.exports = (client) => {
        client.plugins = new Map();
        loadPlugins(path.join(__dirname, 'plugins'), client);
    };
    
    return naze;
}




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

// Fungsi load teks ucapan
function loadTeksUltah() {
    if (!fs.existsSync(teksUltahPath)) {
        fs.writeFileSync(teksUltahPath, JSON.stringify([]));
        console.log('Debug: File teks ultah tidak ditemukan, membuat baru...');
        return [];
    }
    return JSON.parse(fs.readFileSync(teksUltahPath, 'utf8'));
}

// Fungsi menghitung umur
function calculateAge(tanggalLahir) {
    const today = new Date();
    const [day, month, year] = tanggalLahir.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Fungsi untuk membandingkan tanggal (dd-mm) dengan hari ini
function isDateBeforeToday(dateStr) {
    const today = new Date();
    const currentDay = String(today.getDate()).padStart(2, '0');
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayStr = `${currentDay}-${currentMonth}`;
    
    const [day, month] = dateStr.split('-').map(Number);
    const [currentDayNum, currentMonthNum] = todayStr.split('-').map(Number);
    
    if (month < currentMonthNum || (month === currentMonthNum && day < currentDayNum)) {
        return true;
    }
    return false;
}

// Fungsi deteksi dan kirim ucapan ulang tahun tanpa debug
async function checkBirthdays(naze) {
    try {
        const today = new Date();
        const currentDay = String(today.getDate()).padStart(2, '0');
        const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
        const todayStr = `${currentDay}-${currentMonth}`;

        let ultahDb = loadUltahDb();
        const teksUltah = loadTeksUltah();

        // Hapus status done untuk tanggal sebelum hari ini
        for (const groupId in ultahDb) {
            ultahDb[groupId] = ultahDb[groupId].map(person => {
                if (person.done && isDateBeforeToday(person.tanggal_lahir)) {
                    const { done, ...rest } = person; // Hapus properti done
                    return rest;
                }
                return person;
            });
        }
        saveUltahDb(ultahDb); // Simpan perubahan setelah hapus status

        // Cek ulang tahun hari ini
        for (const groupId in ultahDb) {
            const birthdays = ultahDb[groupId].filter(u => u.tanggal_lahir.startsWith(todayStr) && !u.done);
            if (birthdays.length === 0) {
                continue;
            }

            // Ambil metadata grup untuk hide tag
            const groupMetadata = await naze.groupMetadata(groupId);
            const participants = groupMetadata.participants.map(p => p.id);

            // Kirim ucapan dan tandai done
            for (const person of birthdays) {
                const age = calculateAge(person.tanggal_lahir);
                const randomUcapan = teksUltah[Math.floor(Math.random() * teksUltah.length)] || "Selamat ulang tahun, `nama`! Semoga hari ini penuh kebahagiaan!";
                const ucapan = randomUcapan.replace('nama', person.nama);
                const phoneNumber = '+' + person.nomor.split('@')[0]; // Ubah nomor ke format +62...

                const message = `🎉 *Selamat Ulang Tahun!*\n\n👤 Nama: ${person.nama}\n📞 Nomor: ${phoneNumber}\n📅 Tanggal Lahir: ${person.tanggal_lahir}\n🎂 Umur: ${age} tahun\n\n${ucapan}`;

                await naze.sendMessage(groupId, {
                    text: message,
                    mentions: participants
                });

                // Tandai entri sebagai done
                ultahDb[groupId] = ultahDb[groupId].map(p => {
                    if (p.nomor === person.nomor && p.tanggal_lahir === person.tanggal_lahir) {
                        return { ...p, done: true };
                    }
                    return p;
                });
            }
            saveUltahDb(ultahDb); // Simpan perubahan setelah pengiriman
        }
    } catch (err) {
        console.error('Error in checkBirthdays:', err);
    }
}

startNazeBot();

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.redBright(`Update ${__filename}`));
    delete require.cache[file];
    require(file);
});