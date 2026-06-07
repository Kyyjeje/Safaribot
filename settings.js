const fs = require('fs');
const chalk = require('chalk');
const axios = require('axios');

//~~~~~~~~~~~~< GLOBAL SETTINGS >~~~~~~~~~~~~\\

global.owner        = ['6283119847840'] //nomor owner
global.nomorSewaBot = '6283119847840' //ini nomor owner untuk tampilan sewa. (hanya 1 owner aja)
global.packname     = 'Safari' //nama pack sticker
global.author       = '\n\nsewa bot?\npm:\n+6283119847840 (Risky)' //nama pembuat sticker
global.botname      = 'Safari V1.5'    //nama bot
global.ownername    = 'Risky Dwi Nugroho'  //nama owner
global.panggilBot   = ['safari', 'bot', 'Safari bot'] //panggilan bot mu
global.listv        = ['•','●','■','✿','▲','➩','➢','➣','➤','✦','✧','△','❀','○','□','♤','♡','◇','♧','々','〆']
global.tempatDB     = 'database.json'
global.pairing_code = true
global.customPairing = 'SAFARIID'
global.number_bot   = '6285708558412' //nomor bot
global.token        = "44ff6b11-f841-46ba-95a9-7926da84c610" //token database telegram lu.
global.apikeyrch    = '1cf5a045590c77409de6fdc33441c675a05d84b8e3d0f99961b3a78bb969d8b1'//apikey di web https://asitha.top/channel-manager
global.rapid_api    = ['3acd58602amsh124292f1aa40177p1b4e8ejsnf363d93bb13f','8ae5f60b7emsh476821858eb38a0p1790edjsn4795974528e2','d1f6d5622dmsh5657112132349a7p18904ejsn41c1d0b2d0f3','cc18053aa2msh6c350874c05b4b1p113f10jsnaca510962d0c','f5aa2bfec0msh513bd504a05dc7fp176da5jsn9db071685d6f','bbe3ac2bfemsh061c1eaac942971p1463eajsna85870a74943','3651fbdf34msh9ace6453c050e51p178b4djsn8d769ef7101d','8eff80cf9emsh0acf84caedcf413p13b25cjsn30b0d2a20366','2565f33314msh61e9df7e3ed0e2fp10b5d3jsn815d0d8988ab','6cbf47e8f3msh886bf158cf27a74p1aa483jsn46db429a061f']
global.blockedChats = new Set();
global.prefixes     = [".","!","#","🗿","/","😎"]
global.chanel       = '120363402593469181@newsletter' //ID chanel lu. (di dapat dengan menggunakan fitur 'idch <url chanel>')
global.chanelMusic  = '120363402593469181@newsletter' //ID chanel music lu. 
global.gc           = 'https://chat.whatsapp.com/CYE1Pxatym169QUC8PjC3k' //link grup.
global.key_gemini = ['AIzaSyDpTCh81kl_NTTsffowiwauG9A0Sg1QpyA','AIzaSyBufihFdAl41hzbKuvR6CBfMQtCjeJc0kM','AIzaSyCA0wQwT8T7vLNUw6hAP1xPORqsVnTIf-I','AIzaSyAy7w3_9RWl-oKQoUjWKJSL5Sum6hv13LU','AIzaSyAp9r_iFHTunwcp45mbz1aNkd_pHV8dVmo','AIzaSyDRtCkyfi5fl56NbgTHNuLTtp2DytQsYm0','AIzaSyD2RRK4xxs5xzfhsAXL3MNcBj9ZqdsHFNs'];

global.features = {
    newsletterCreate: {
        enabled: true
    }
};
global.my = {
    yt: 'https://github.com/KyyEveryday',
    gh: 'https://github.com/Kyyjeje',
    gc: '',
    thumb: 'https://raw.githubusercontent.com/Kyyjeje/foto/main/IMG_20251012_183925.jpg',
    linkwa: 'https://wa.me/+6283119847840',
}
global.simbol = {
   barisjudul : '╔〇',
   tutupjudul : '╠═══════〇',
   barisfitur : '-',
   penutup    : '╚═════════════〇'
}

//~~~~~~~~~~~~~~~< THUMBNAIL >~~~~~~~~~~~~~~~\\
// URL thumbnail disimpan di sini, ubah di sini untuk memperbarui semua thumbnail
global.thumbnailUrls = [
    'https://raw.githubusercontent.com/Kyyjeje/foto/main/IMG_20251012_183925.jpg',
    'https://raw.githubusercontent.com/Kyyjeje/foto/main/IMG_20251012_183925.jpg',
    'https://raw.githubusercontent.com/Kyyjeje/foto/main/IMG_20251012_183925.jpg',
    'https://raw.githubusercontent.com/Kyyjeje/foto/main/IMG_20251012_183925.jpg',
    'https://raw.githubusercontent.com/Kyyjeje/foto/main/IMG_20251012_183925.jpg',
    'https://raw.githubusercontent.com/Kyyjeje/foto/main/IMG_20251012_183925.jpg',
    'https://raw.githubusercontent.com/Kyyjeje/foto/main/IMG_20251012_183925.jpg',
    'https://raw.githubusercontent.com/Kyyjeje/foto/main/IMG_20251012_183925.jpg',
    'https://raw.githubusercontent.com/Kyyjeje/foto/main/IMG_20251012_183925.jpg',
    'https://raw.githubusercontent.com/Kyyjeje/foto/main/IMG_20251012_183925.jpg',
    'https://raw.githubusercontent.com/Kyyjeje/foto/main/IMG_20251012_183925.jpg',
    'https://raw.githubusercontent.com/Kyyjeje/foto/main/IMG_20251012_183925.jpg',
    'https://raw.githubusercontent.com/Kyyjeje/foto/main/IMG_20251012_183925.jpg',
    'https://raw.githubusercontent.com/Kyyjeje/foto/main/IMG_20251012_183925.jpg',
    'https://raw.githubusercontent.com/Kyyjeje/foto/main/IMG_20251012_183925.jpg',
    'https://raw.githubusercontent.com/Kyyjeje/foto/main/IMG_20251012_183925.jpg'
    
];

//thumbnail ini JANGAN di ubah.
global.thumbnailabsen       = 'https://raw.githubusercontent.com/BANGSULSTAR/thumbnail/main/thumbnailabsen.png'
global.thumbnailsewa        = 'https://raw.githubusercontent.com/BANGSULSTAR/thumbnail/main/thumbnailsewa.jpg'
global.thumbnaillastsewa    = 'https://raw.githubusercontent.com/BANGSULSTAR/thumbnail/main/thumbnaillastsewa.jpg'
global.thumbnailisbot       = 'https://raw.githubusercontent.com/BANGSULSTAR/thumbnail/main/thumbnailisbot.jpg'
global.thumbnailmasjid      = 'https://raw.githubusercontent.com/BANGSULSTAR/thumbnail/main/thumbnailmasjid.jpg'
global.thumbnailgrok        = 'https://raw.githubusercontent.com/BANGSULSTAR/thumbnail/main/thumbnailgrok.png'
global.thumbnailblackbox    = 'https://raw.githubusercontent.com/BANGSULSTAR/thumbnail/main/thumbnailblackbox.webp'
global.thumbnailktp         = 'https://raw.githubusercontent.com/BANGSULSTAR/thumbnail/main/thumbnailktp.jpg'
global.thumbnailgrupsetting = 'https://raw.githubusercontent.com/BANGSULSTAR/thumbnail/main/thumbnailgrupsetting.jpg'
global.thumbnailshazam      = 'https://raw.githubusercontent.com/BANGSULSTAR/thumbnail/main/thumbnailshazam.jpg'
global.thumbnailyoutube     = 'https://raw.githubusercontent.com/BANGSULSTAR/thumbnail/main/thumbnailyoutube.jpg'
global.thumbnailspotify     = 'https://raw.githubusercontent.com/BANGSULSTAR/thumbnail/main/thumbnailspotify.jpg'
global.thumbnailgiveaway    = 'https://raw.githubusercontent.com/BANGSULSTAR/thumbnail/main/thumbnailgiveaway.jpg'
function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Fungsi untuk random thumbnail URL
global.getRandomThumbnailUrl = () => {
    return pickRandom(global.thumbnailUrls);
};

// Fungsi untuk random thumbnail image (bisa digunakan untuk image lain jika diperlukan)
global.getRandomThumbnail = () => {
    return pickRandom(global.thumbnailUrls); // Mengembalikan URL acak untuk kompatibilitas
};

global.mess = {
    owner: '👑 *Hanya Yang Mulia sang Penguasa yang berhak menggunakan fitur ini!*',
    admin: '⚠️ *Fitur spesial buat Admin aja nih, gak bisa sembarangan!*',
    botAdmin: '🚫 *BangsulBotz belum jadi admin nih, angkat jadi admin dulu dong!*',
    group: '_wahai yang mulia...fitur ini hanya tersedia di dalam grup..._',
    private: '📩 *Ini fitur rahasia, cuma bisa dipake di chat pribadi yang mulia!*',
    prem: '💎 *Paduka belum tergolong sebagai Pengguna Istimewa (Premium). Silakan naikkan derajat dahulu untuk menikmati fitur ini!*',
    wait: '⏳ *Sabar yang mulia permintaan anda sedang diproses!*',
    error: '❌ *Ampun, Yang Mulia. Terjadi kesalahan dalam sistem. Hamba akan memperbaikinya secepat mungkin.*',
    eror: '❌ *Ampun, Yang Mulia. Terjadi kesalahan dalam sistem. Hamba akan memperbaikinya secepat mungkin.*',
    done: '*Perintah Sudah dilaksanakan yang Mulia*'
}
global.sendMessageWithThumbnail = async (naze, chatId, messageKey, m) => {
    const sender = m.sender.split('@')[0]; // Ambil nomor pengirim tanpa @s.whatsapp.net
    const messages = {
        owner: { 
            text: `👑 *Hanya Yang Mulia sang Penguasa yang berhak menggunakan fitur ini, @${sender}!*`, 
            title: '👑 Fitur Khusus Penguasa', 
            body: 'Akses Ditolak' 
        },
        admin: { 
            text: `⚠️ *Fitur ini cuma buat Admin, @${sender}. Bukan sembarang orang bisa pakai!*`, 
            title: '⚠️ Admin Only', 
            body: 'Akses Ditolak' 
        },
        botAdmin: { 
            text: `🚫 *Aku belum jadi admin nih, @${sender}. Angkat aku jadi admin dulu ya!*`, 
            title: '🚫 Bot Bukan Admin', 
            body: 'Fitur Tidak Tersedia' 
        },
        group: { 
            text: `_Wahai @${sender}, fitur ini hanya tersedia di grup ya..._*`, 
            title: '🏠 Grup Only', 
            body: 'Fitur Tidak Tersedia' 
        },
        private: { 
            text: `📩 *Fitur rahasia ini cuma bisa dipake di chat pribadi, @${sender}!*`, 
            title: '📩 Private Only', 
            body: 'Fitur Tidak Tersedia' 
        },
        prem: { 
            text: `💎 *Maaf @${sender}, kamu belum Premium. Tingkatkan statusmu dulu ya!*`, 
            title: '💎 Premium Only', 
            body: 'Akses Ditolak' 
        },
        wait: { 
            text: `⏳ *Sabar ya @${sender}, perintah kamu lagi diproses nih!*`, 
            title: '⏳ Sedang Diproses', 
            body: 'Mohon Tunggu Sebentar' 
        },
        error: { 
            text: `❌ *Maaf @${sender}, ada error di sistem. Aku perbaiki secepatnya ya!*`, 
            title: '❌ Sistem Error', 
            body: 'Mohon Coba Lagi' 
        },
         eror: { 
            text: `❌ *Maaf @${sender}, ada error di sistem. Aku perbaiki secepatnya ya!*`, 
            title: '❌ Sistem Error', 
            body: 'Mohon Coba Lagi' 
        },
        done: { 
            text: `*Selesai @${sender}, perintah kamu sudah dilaksanakan!*`, 
            title: '✅ Selesai', 
            body: 'Perintah Berhasil' 
        }
    };

    const msg = messages[messageKey] || { 
        text: `Pesan tidak ditemukan untuk @${sender}`, 
        title: 'Pesan Bot', 
        body: `${global.botname}🤖` 
    };
    
    return naze.sendMessage(chatId, {
        text: msg.text,
        contextInfo: {
            mentionedJid: [m.sender], // Tag sender
            externalAdReply: {
                title: msg.title,
                body: msg.body,
                thumbnailUrl: global.getRandomThumbnailUrl(), // Gunakan fungsi baru untuk thumbnail URL
                mediaType: 1,
                previewType: 1,
                renderLargerThumbnail: false,
            }
        }
    }, { quoted: m });
}

global.analyzeErrorWithGemini = async function(errorMessage, stackTrace) {
    for (let i = 0; i < global.key_gemini.length; i++) {
        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${global.key_gemini[i]}`,
                {
                    contents: [{
                        parts: [{
                            text: `Kamu adalah AI yang ahli dalam bahasa pemrograman dan mampu menganalisa log error. Jawab dengan bahasa Indonesia yang natural dan boleh kasih emoji untuk kesan lebih hidup. Jangan panjang-panjang ya! Analisa log error ini:\n\nError: ${errorMessage}\n\nStack Trace: ${stackTrace}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0
                    },
                    systemInstruction: {
                        parts: [{
                            text: "Kamu adalah AI yang ahli dalam bahasa pemrograman, dan mampu menganalisa log error. Jawab dengan bahasa Indonesia yang natural dan boleh kasih emoji seperti reaksi kamu supaya kesan lebih hidup, jangan panjang-panjang ya untuk menjawabnya."
                        }]
                    }
                }
            );
            return response.data.candidates[0].content.parts[0].text;
        } catch (err) {
            if (i === global.key_gemini.length - 1) {
                throw new Error(`Gagal menganalisis dengan Gemini: ${err.message}`);
            }
            // Lanjut ke key berikutnya jika masih ada
        }
    }
};

global.handleError = async function(naze, m, err, options = { sendRawError: false, useGemini: false }) {
    await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);

    // Kirim pesan error mentah jika sendRawError aktif
    if (options.sendRawError) {
        await naze.sendFromOwner(
            global.owner,
            `Halo \`${global.ownername}\`, error di fitur \`${m.command}\`:\n\nPesan Error:\n${err.message}\n\nStack Trace:\n${err.stack}`,
            m,
            { contextInfo: { isForwarded: true } }
        );
    }

    // Kirim analisis Gemini jika useGemini aktif
    if (options.useGemini) {
        try {
            const geminiAnalysis = await global.analyzeErrorWithGemini(err.message, err.stack);
            await naze.sendFromOwner(
                global.owner,
                `Halo \`${global.ownername}\`, analisis error di fitur \`${m.command}\` dari Gemini:\n\n${geminiAnalysis}`,
                m,
                { contextInfo: { isForwarded: true } }
            );
        } catch (geminiErr) {
            // Hanya kirim error mentah jika sendRawError tidak aktif
            if (!options.sendRawError) {
                await naze.sendFromOwner(
                    global.owner,
                    `Halo \`${global.ownername}\`, gagal analisis Gemini untuk fitur \`${m.command}\`:\n\nPesan Error:\n${err.message}\n\nStack Trace:\n${err.stack}`,
                    m,
                    { contextInfo: { isForwarded: true } }
                );
            }
        }
    }
};
//~~~~~~~~~~~~~~~< PROCESS >~~~~~~~~~~~~~~~\\

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
});