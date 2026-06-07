require('../../settings');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const speed = require('performance-now');
const prem = require('../../src/premium');
const premium = JSON.parse(fs.readFileSync(path.join(__dirname, '../../database/premium.json')));

const runtime = function(seconds) {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const dDisplay = d > 0 ? `${d} hari, ` : '';
    const hDisplay = h > 0 ? `${h} jam, ` : '';
    const mDisplay = m > 0 ? `${m} menit, ` : '';
    const sDisplay = s > 0 ? `${s} detik` : '';
    return dDisplay + hDisplay + mDisplay + sDisplay;
};

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const menuConfig = {
    menu: {
        aliases: ['menu', '.menu'],
        targetFolder: path.join(__dirname, '..'),
        teks: ({ salam, sender, botname, userCount, likeCount }) =>
            `✨ ${salam}, @${sender}! \nSelamat datang di ${botname}, bot canggih yang telah dipercaya oleh \`${userCount}\` pengguna dan mendapatkan \`${likeCount}\` Like ❤️, siap melayani Anda! 🐾😺\n`,
        judul: ({ botname }) => `\nDaftar Menu ${botname}\n\nBerikut adalah daftar lengkap menu yang tersedia:\n\n`,
        bantuan: ''
    },
    aimenu: {
        aliases: ['aimenu', '.aimenu'],
        targetFolder: path.join(__dirname, '..', 'aimenu'),
        teks: ({ salam, sender, botname }) =>
            `${salam}, @${sender}! \nJelajahi fitur AI canggih dari ${botname} untuk pengalaman berbasis kecerdasan buatan! 🤖💡`,
        judul: ({ botname }) => `\n\nBerikut adalah daftar lengkap fitur AI untuk kebutuhan cerdas Anda:\n\n`,
        bantuan: `\nJika Anda memerlukan panduan lebih lanjut, silahkan hubungin owner dengan mengetik perintah :\n\`.owner\`\n`
    },
    botmenu: {
        aliases: ['botmenu', '.botmenu'],
        targetFolder: path.join(__dirname, '..', 'botmenu'),
        teks: ({ salam, sender, botname }) =>
            `${salam}, @${sender}! \nTemukan fitur pengelolaan bot dari ${botname} untuk pengalaman optimal! 🤖⚙️`,
        judul: ({ botname }) => `\n\nBerikut adalah daftar lengkap fitur untuk mengelola bot:\n\n`,
        bantuan: `\nJika Anda memerlukan panduan lebih lanjut, silahkan hubungin owner dengan mengetik perintah :\n\`.owner\`\n`
    },
    downloadmenu: {
        aliases: ['downloadmenu', '.downloadmenu'],
        targetFolder: path.join(__dirname, '..', 'downloadmenu'),
        teks: ({ salam, sender, botname }) =>
            `${salam}, @${sender}! \nDapatkan fitur unduhan cepat dan mudah dari ${botname}! 📥🚀`,
        judul: ({ botname }) => `\n\nBerikut adalah daftar lengkap fitur untuk mengunduh konten:\n\n`,
        bantuan: `\nJika Anda memerlukan panduan lebih lanjut, silahkan hubungin owner dengan mengetik perintah :\n\`.owner\`\n`
    },
    financemenu: {
        aliases: ['financemenu', '.financemenu'],
        targetFolder: path.join(__dirname, '..', 'financemenu'),
        teks: ({ salam, sender, botname }) =>
            `${salam}, @${sender}! \nKelola keuangan Anda dengan fitur finansial dari ${botname}! 💰📊`,
        judul: ({ botname }) => `\n\nBerikut adalah daftar lengkap fitur untuk manajemen keuangan:\n\n`,
        bantuan: `\nJika Anda memerlukan panduan lebih lanjut, silahkan hubungin owner dengan mengetik perintah :\n\`.owner\`\n`
    },
    funmenu: {
        aliases: ['funmenu', '.funmenu'],
        targetFolder: path.join(__dirname, '..', 'funmenu'),
        teks: ({ salam, sender, botname }) =>
            `${salam}, @${sender}! \nSelamat datang di ${botname}, bot canggih yang siap menghibur Anda! 🐾😺`,
        judul: ({ botname }) => `\n\nBerikut adalah daftar lengkap fitur hiburan untuk menambah keseruan:\n\n`,
        bantuan: `\nJika Anda memerlukan panduan lebih lanjut, silahkan hubungin owner dengan mengetik perintah :\n\`.owner\`\n`
    },
    gamemenu: {
        aliases: ['gamemenu', '.gamemenu'],
        targetFolder: path.join(__dirname, '..', 'gamemenu'),
        teks: ({ salam, sender, botname }) =>
            `${salam}, @${sender}! \nNikmati keseruan bermain game dengan fitur dari ${botname}! 🎮🔥`,
        judul: ({ botname }) => `\n\nBerikut adalah daftar lengkap fitur game untuk hiburan Anda:\n\n`,
        bantuan: `\nJika Anda memerlukan panduan lebih lanjut, silahkan hubungin owner dengan mengetik perintah :\n\`.owner\`\n`
    },
    giveawaymenu: {
        aliases: ['giveawaymenu', '.giveawaymenu'],
        targetFolder: path.join(__dirname, '..', 'giveawaymenu'),
        teks: ({ salam, sender, botname }) =>
            `${salam}, @${sender}! \nIkuti keseruan giveaway dan dapatkan hadiah menarik dari ${botname}! 🎁✨`,
        judul: ({ botname }) => `\n\nBerikut adalah daftar lengkap fitur untuk mengikuti giveaway:\n\n`,
        bantuan: `\nJika Anda memerlukan panduan lebih lanjut, silahkan hubungin owner dengan mengetik perintah :\n\`.owner\`\n`
    },
    grupmenu: {
        aliases: ['grupmenu', '.grupmenu', 'groupmenu'],
        targetFolder: path.join(__dirname, '..', 'grupmenu'),
        teks: ({ salam, sender, botname }) =>
            `${salam}, @${sender}! \nKelola grup Anda dengan fitur grup dari ${botname}! 👥⚙️`,
        judul: ({ botname }) => `\n\nBerikut adalah daftar lengkap fitur untuk pengelolaan grup:\n\n`,
        bantuan: `\nJika Anda memerlukan panduan lebih lanjut, silahkan hubungin owner dengan mengetik perintah :\n\`.owner\`\n`
    },
    imagemenu: {
        aliases: ['imagemenu', '.imagemenu'],
        targetFolder: path.join(__dirname, '..', 'imagemenu'),
        teks: ({ salam, sender, botname }) =>
            `${salam}, @${sender}! \nEdit dan buat gambar menarik dengan fitur dari ${botname}! 🖼️✨`,
        judul: ({ botname }) => `\n\nBerikut adalah daftar lengkap fitur untuk pengolahan gambar:\n\n`,
        bantuan: `\nJika Anda memerlukan panduan lebih lanjut, silahkan hubungin owner dengan mengetik perintah :\n\`.owner\`\n`
    },
    konvertmenu: {
        aliases: ['konvertmenu', '.konvertmenu'],
        targetFolder: path.join(__dirname, '..', 'konvertmenu'),
        teks: ({ salam, sender, botname }) =>
            `${salam}, @${sender}! \nKonversi file dan data dengan mudah menggunakan ${botname}! 🔄📂`,
        judul: ({ botname }) => `\n\nBerikut adalah daftar lengkap fitur untuk konversi data:\n\n`,
        bantuan: `\nJika Anda memerlukan panduan lebih lanjut, silahkan hubungin owner dengan mengetik perintah :\n\`.owner\`\n`
    },
    ownermenu: {
        aliases: ['ownermenu', '.ownermenu'],
        targetFolder: path.join(__dirname, '..', 'ownermenu'),
        teks: ({ salam, sender, botname }) =>
            `${salam}, @${sender}! \nAkses fitur khusus pemilik bot dari ${botname}! 👑⚙️`,
        judul: ({ botname }) => `\n\nBerikut adalah daftar lengkap fitur untuk pemilik bot:\n\n`,
        bantuan: `\nJika Anda memerlukan panduan lebih lanjut, silahkan hubungin owner dengan mengetik perintah :\n\`.owner\`\n`
    },
    quotesmenu: {
        aliases: ['quotesmenu', '.quotesmenu'],
        targetFolder: path.join(__dirname, '..', 'quotesmenu'),
        teks: ({ salam, sender, botname }) =>
            `${salam}, @${sender}! \nTemukan inspirasi dan motivasi dengan kutipan menarik dari ${botname}! 📜✨`,
        judul: ({ botname }) => `\n\nBerikut adalah daftar lengkap fitur kutipan untuk inspirasi Anda:\n\n`,
        bantuan: `\nJika Anda memerlukan panduan lebih lanjut, silahkan hubungin owner dengan mengetik perintah :\n\`.owner\`\n`
    },
    randommenu: {
        aliases: ['randommenu', '.randommenu'],
        targetFolder: path.join(__dirname, '..', 'randommenu'),
        teks: ({ salam, sender, botname }) =>
            `${salam}, @${sender}! \nNikmati fitur acak seru dari ${botname}! 🎲✨`,
        judul: ({ botname }) => `\n\nBerikut adalah daftar lengkap fitur acak untuk keseruan Anda:\n\n`,
        bantuan: `\nJika Anda memerlukan panduan lebih lanjut, silahkan hubungin owner dengan mengetik perintah :\n\`.owner\`\n`
    },
    searchmenu: {
        aliases: ['searchmenu', '.searchmenu'],
        targetFolder: path.join(__dirname, '..', 'searchmenu'),
        teks: ({ salam, sender, botname }) =>
            `${salam}, @${sender}! \nCari informasi dengan cepat menggunakan fitur pencarian dari ${botname}! 🔍📚`,
        judul: ({ botname }) => `\n\nBerikut adalah daftar lengkap fitur untuk mencari informasi:\n\n`,
        bantuan: `\nJika Anda memerlukan panduan lebih lanjut, silahkan hubungin owner dengan mengetik perintah :\n\`.owner\`\n`
    },
    stickermenu: {
        aliases: ['stickermenu', '.stickermenu'],
        targetFolder: path.join(__dirname, '..', 'stickermenu'),
        teks: ({ salam, sender, botname }) =>
            `${salam}, @${sender}! \nBuat dan edit stiker keren dengan ${botname}! 😎🎨`,
        judul: ({ botname }) => `\n\nBerikut adalah daftar lengkap fitur untuk pembuatan stiker:\n\n`,
        bantuan: `\nJika Anda memerlukan panduan lebih lanjut, silahkan hubungin owner dengan mengetik perintah :\n\`.owner\`\n`
    },
    storemenu: {
        aliases: ['storemenu', '.storemenu'],
        targetFolder: path.join(__dirname, '..', 'storemenu'),
        teks: ({ salam, sender, botname }) =>
            `${salam}, @${sender}! \nTemukan berbagai produk dan layanan menarik dari ${botname} untuk kebutuhan Anda! 🛒✨`,
        judul: ({ botname }) => `\n\nBerikut adalah daftar lengkap produk dan layanan untuk pengalaman berbelanja Anda:\n\n`,
        bantuan: `\nJika Anda memerlukan panduan lebih lanjut, silahkan hubungin owner dengan mengetik perintah :\n\`.owner\`\n`
    },
    toolsmenu: {
        aliases: ['toolsmenu', '.toolsmenu'],
        targetFolder: path.join(__dirname, '..', 'toolsmenu'),
        teks: ({ salam, sender, botname }) =>
            `${salam}, @${sender}! \nGunakan alat bantu praktis dari ${botname} untuk berbagai kebutuhan! 🛠️✨`,
        judul: ({ botname }) => `\n\nBerikut adalah daftar lengkap fitur alat bantu:\n\n`,
        bantuan: `\nJika Anda memerlukan panduan lebih lanjut, silahkan hubungin owner dengan mengetik perintah :\n\`.owner\`\n`
    },
    newslettermenu: {
        aliases: ['newslettermenu', '.newslettermenu'],
        targetFolder: path.join(__dirname, '..', 'newslettermenu'),
        teks: ({ salam, sender, botname }) =>
            `${salam}, @${sender}! \nSelamat datang di ${botname}, bot canggih yang siap memberikan informasi terbaru melalui fitur newsletter! 📰📬`,
        judul: ({ botname }) => `\n\nBerikut adalah daftar lengkap fitur newsletter untuk update informasi terkini:\n\n`,
        bantuan: `\nJika Anda memerlukan panduan lebih lanjut, silahkan hubungin owner dengan mengetik perintah :\n\`.owner\`\n`
    }
};

module.exports = {
    name: 'menu',
    alias: Object.values(menuConfig).flatMap(config => config.aliases),
    run: async ({ naze, m }) => {
        try {
            await naze.sendMessage(m.chat, { react: { text: '😎', key: m.key } });
            await naze.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

            const timestamp = speed();
            const latensi = speed() - timestamp;
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
            const hour = moment().tz('Asia/Jakarta').locale('id').format('HH');
            const isVip = db.users[m.sender] ? db.users[m.sender].vip : false;
            const isPremium = isOwner || prem.checkPremiumUser(m.sender, premium) || false;

            if (!global.db) global.db = {};
            if (!global.db.set) global.db.set = {};
            if (!global.db.likeBot) global.db.likeBot = {};
            if (!global.db.set[botNumber]) global.db.set[botNumber] = {};
            if (!global.db.set[botNumber].setbutton) global.db.set[botNumber].setbutton = {};
            const useButton = global.db.set[botNumber].setbutton.menu ?? false;

            const hourNum = parseInt(hour);
            const { salam, emojiSalam } = hourNum >= 5 && hourNum < 11
                ? { salam: 'Selamat Pagi', emojiSalam: '🌞' }
                : hourNum >= 11 && hourNum < 15
                ? { salam: 'Selamat Siang', emojiSalam: '☀️' }
                : hourNum >= 15 && hourNum < 18
                ? { salam: 'Selamat Sore', emojiSalam: '🌅' }
                : { salam: 'Selamat Malam', emojiSalam: '🌙' };

            const command = m.text.split(' ')[0].toLowerCase().replace('.', '');
            let config;
            for (const key in menuConfig) {
                if (menuConfig[key].aliases.includes(command)) {
                    config = menuConfig[key];
                    break;
                }
            }
            if (!config) {
                await naze.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return naze.sendMessage(m.chat, { text: `⚠️ Perintah ${command} tidak ditemukan.`, quoted: m });
            }

            const teksData = {
                salam,
                sender: m.sender.split('@')[0],
                botname: global.botname,
                userCount: Object.keys(global.db.users || {}).length,
                likeCount: Object.keys(global.db.likeBot || {}).length
            };

            const menuFile = path.join(__dirname, '..', 'menu_list.txt');
            if (!fs.existsSync(menuFile)) {
                await naze.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return naze.sendMessage(m.chat, { text: '⚠️ Daftar menu belum tersedia.', quoted: m });
            }
            const menuList = fs.readFileSync(menuFile, 'utf-8').split('\n').filter(line => line.trim() !== '');
            let totalfitur = 0;
            const menuCounts = {};

            menuList.forEach(category => {
                const cleanCategory = category.trim();
                const categoryPath = path.join(__dirname, '..', cleanCategory);
                if (fs.existsSync(categoryPath)) {
                    const pluginFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js') && file !== 'index.js');
                    menuCounts[cleanCategory] = pluginFiles.length;
                    totalfitur += pluginFiles.length;
                } else {
                    menuCounts[cleanCategory] = 0;
                }
            });

            if (config !== menuConfig.menu && !fs.existsSync(config.targetFolder)) {
                await naze.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return naze.sendMessage(m.chat, { text: `⚠️ Folder ${command} tidak ditemukan.`, quoted: m });
            }

            const emptyBuffer = Buffer.alloc(0);

            const getFiturList = (folder) => {
                const fiturList = [];
                try {
                    const files = fs.readdirSync(folder).filter(file => file.endsWith('.js') && file !== 'index.js');
                    for (const file of files) {
                        const filePath = path.join(folder, file);
                        const fiturName = file.replace('.js', '');
                        let description = '';
                        try {
                            const module = require(filePath);
                            description = module.description || '';
                            delete require.cache[require.resolve(filePath)];
                        } catch (e) {
                            console.error(`Error loading module ${filePath}: ${e.message}`);
                        }
                        fiturList.push({ name: fiturName, description });
                    }
                } catch (e) {
                    console.error(`Error reading folder ${folder}: ${e.message}`);
                }
                return fiturList;
            };

            const formatTextMessage = () => {
                const categoryName = config === menuConfig.menu ? 'LIST MENU' : `${config.aliases[0].toUpperCase().replace('.', '')}`;
                let resultMessage = `\n${simbol.barisjudul} ${categoryName}\n${simbol.tutupjudul}\n`;
                if (config === menuConfig.menu) {
                    resultMessage += `${simbol.barisfitur} allmenu                   \`(${totalfitur} fitur)\`\n`;
                    menuList.forEach(category => {
                        const jumlahFitur = menuCounts[category.trim()] || 0;
                        resultMessage += `${simbol.barisfitur} ${category}\`(${jumlahFitur} fitur)\`\n`;
                    });
                } else {
                    const fiturList = getFiturList(config.targetFolder);
                    fiturList.forEach(fitur => {
                        const descriptionText = fitur.description ? ` \`${fitur.description}\`` : '';
                        resultMessage += `${simbol.barisfitur} ${fitur.name}${descriptionText}\n`;
                    });
                }
                resultMessage += `${simbol.penutup}\n\n`;
                return resultMessage;
            };

            const sendButtonMessage = async () => {
                const bet = {
                    title: 'LIST MENU',
                    sections: [
                        {
                            title: 'Semua Fitur',
                            highlight_label: `Total: ${totalfitur} fitur`,
                            rows: [{ title: 'All Menu', description: '📌 Menampilkan semua fitur', id: 'allmenu' }]
                        },
                        {
                            title: 'Daftar Kategori Menu',
                            highlight_label: '',
                            rows: menuList.map(category => {
                                const cleanCategory = category.trim();
                                const jumlahFitur = menuCounts[cleanCategory] || 0;
                                return {
                                    title: cleanCategory,
                                    description: `📋 ${jumlahFitur} fitur`,
                                    id: cleanCategory
                                };
                            })
                        }
                    ]
                };

                const buttonMessage = {
                    document: emptyBuffer,
                    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    fileName: `${global.botname}🥀`,
                    fileLength: 1000000000000,
                    pageCount: 0,
                    caption: config.teks(teksData) + (config === menuConfig.menu ? '' : config.judul({ botname: global.botname }) + formatTextMessage() + config.bantuan),
                    footer: 'Powered By ' + global.botname,
                    buttons: [
                        { buttonId: 'suka_bot', buttonText: { displayText: 'LIKE ❤' } },
                        {
                            buttonId: 'action',
                            buttonText: { displayText: 'List Menu' },
                            type: 4,
                            nativeFlowInfo: {
                                name: 'single_select',
                                paramsJson: JSON.stringify(bet)
                            }
                        }
                    ],
                    contextInfo: {
                        forwardingScore: 555,
                        isForwarded: true,
                        externalAdReply: {
                            title: `${emojiSalam} ${salam}, ${m.pushName || 'User'}!`,
                            body: `Menu ${global.botname}✨`,
                            previewType: 'PHOTO',
                            thumbnailUrl: global.getRandomThumbnailUrl(),
                            mediaType: 1,
                            renderLargerThumbnail: true
                        },
                        mentionedJid: [m.sender]
                    },
                    viewOnce: true,
                    headerType: 5
                };

                await naze.sendMessage(m.chat, buttonMessage, { quoted: m });
            };

            const sendTextMessage = async () => {
                const finalMessage = config === menuConfig.menu
                    ? config.teks(teksData) + config.judul({ botname: global.botname }) + formatTextMessage() + `> ${global.botname}`
                    : config.teks(teksData) + config.judul({ botname: global.botname }) + formatTextMessage() + config.bantuan + `> ${global.botname}`;
                await naze.sendMessage(m.chat, {
                    document: emptyBuffer,
                    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    fileName: `Menu_${global.botname}.docx`,
                    fileLength: 1000000000000,
                    pageCount: 9999999999999,
                    caption: finalMessage,
                    contextInfo: {
                        externalAdReply: {
                            title: `${emojiSalam} ${salam}, ${m.pushName || 'User'}!`,
                            body: `Menu ${global.botname}✨`,
                            previewType: 'PHOTO',
                            thumbnailUrl: global.getRandomThumbnailUrl(),
                            mediaType: 1,
                            renderLargerThumbnail: true
                        },
                        mentionedJid: [m.sender]
                    }
                }, { quoted: m });
            };

            if (useButton) {
                await sendButtonMessage();
            } else {
                await sendTextMessage();
            }

            await naze.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        } catch (e) {
            console.error(`Fatal error di menu: ${e.message}\nStack: ${e.stack}`);
            await naze.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};