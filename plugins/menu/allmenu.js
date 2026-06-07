require('../../settings');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const speed = require('performance-now');
const prem = require('../../src/premium');
const premium = JSON.parse(fs.readFileSync(path.join(__dirname, '../../database/premium.json')));

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
    name: 'allmenu',
    alias: ['allmenu', '.allmenu'],
    run: async ({ naze, m }) => {
        try {
            await naze.sendMessage(m.chat, { react: { text: '😎', key: m.key } });
            await naze.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
            const hour = moment().tz('Asia/Jakarta').locale('id').format('HH');
            const isVip = db.users[m.sender] ? db.users[m.sender].vip : false;
            const isPremium = isOwner || prem.checkPremiumUser(m.sender, premium) || false;

            if (!global.db) global.db = {};
            if (!global.db.set) global.db.set = {};
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

            const menuFile = path.join(__dirname, '..', 'menu_list.txt');
            if (!fs.existsSync(menuFile)) {
                await naze.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
                return naze.sendMessage(m.chat, { text: '⚠️ Daftar menu belum tersedia.', quoted: m });
            }

            const menuList = fs.readFileSync(menuFile, 'utf-8').split('\n').filter(line => line.trim() !== '');
            let totalfitur = 0;
            const pluginList = {};

            menuList.forEach(category => {
                const cleanCategory = category.trim();
                const categoryPath = path.join(__dirname, '..', cleanCategory);
                if (fs.existsSync(categoryPath)) {
                    const pluginFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js') && file !== 'index.js');
                    if (pluginFiles.length > 0) {
                        const plugins = pluginFiles.map(file => {
                            const filePath = path.join(categoryPath, file);
                            const fiturName = file.replace('.js', '');
                            let description = '';
                            try {
                                const module = require(filePath);
                                description = module.description || '';
                                delete require.cache[require.resolve(filePath)];
                            } catch (e) {
                                console.error(`Error loading module ${filePath}: ${e.message}`);
                            }
                            return { name: fiturName, description };
                        });
                        pluginList[cleanCategory] = plugins;
                        totalfitur += plugins.length;
                    }
                }
            });

            const emptyBuffer = Buffer.alloc(0);

            const formatTextMessage = () => {
                let resultMessage = `${salam}, @${m.sender.split('@')[0]}! \nJelajahi semua fitur canggih dari ${global.botname} dalam satu daftar lengkap! 🌟🚀\n\n`;
                Object.keys(pluginList).forEach(category => {
                    const total = pluginList[category].length;
                    resultMessage += `${simbol.barisjudul} ${category.toUpperCase()}\n${simbol.tutupjudul}\n`;
                    pluginList[category].forEach(plugin => {
                        const descriptionText = plugin.description ? ` \`${plugin.description}\`` : '';
                        resultMessage += `${simbol.barisfitur} ${plugin.name}${descriptionText}\n`;
                    });
                    resultMessage += `${simbol.penutup}\n\n`;
                });
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
                            rows: Object.keys(pluginList).map(category => {
                                const jumlahFitur = pluginList[category].length;
                                return {
                                    title: category,
                                    description: `📋 ${jumlahFitur} fitur`,
                                    id: category
                                };
                            })
                        }
                    ]
                };

                const buttonMessage = {
                    document: emptyBuffer,
                    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    fileName: `Menu_${global.botname}.docx`,
                    fileLength: 1000000000000,
                    pageCount: 0,
                    caption: formatTextMessage() + `\nJika Anda memerlukan panduan lebih lanjut, silakan hubungi owner dengan mengetik perintah:\n${m.prefix}owner`,
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
                const finalMessage = formatTextMessage() + `\nJika Anda memerlukan panduan lebih lanjut, silakan hubungi owner dengan mengetik perintah:\n${m.prefix}${m.command} owner\n\n> ${global.botname}`;
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
        } catch (err) {
            console.error(`Gagal membaca file menu atau folder plugin: ${err.message}`);
            await naze.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await naze.sendMessage(m.chat, { text: `⚠️ Terjadi kesalahan: ${err.message}`, quoted: m });
        }
    }
};