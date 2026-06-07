const { globalSettings } = require('../../settings');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
    name: 'listgalau',
    alias: ['lagugalau'],
    run: async ({ naze, m }) => {
        try {
            

            const botNumber = await naze.decodeJid(naze.user.id);
            if (!global.db) global.db = {};
            if (!global.db.set) global.db.set = {};
            if (!global.db.set[botNumber]) global.db.set[botNumber] = {};
            if (!global.db.set[botNumber].setbutton) global.db.set[botNumber].setbutton = {};
            const useButton = global.db.set[botNumber].setbutton.listgalau ?? false;

            const dirPath = path.join(__dirname, '../../data/assets/galau/');
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
                
                return m.reply('⚠️ Tidak ada lagu galau tersedia di direktori lokal maupun repository GitHub.');
            }

            const songList = allFiles.map((file, index) => ({
                number: index + 1,
                file: file.name,
                name: file.name.replace('.mp3', ''),
                source: file.source,
                path: file.path
            }));
            global.galauListCache = songList;

            const sendTextMessage = async () => {
                let listMessage = `🎶 Daftar Lagu Galau 🎶 \n\n`;
                listMessage += `${global.simbol.barisjudul}🎵 *Total:* \`${songList.length} Lagu\`\n${global.simbol?.tutupjudul}\n`;
                songList.forEach(song => {
                    listMessage += `${song.number}. ${song.name}\n`;
                });
                listMessage += `${global.simbol.penutup}\n\n`;
                listMessage += `📌 *Catatan:* Untuk mengambil lagu, gunakan perintah:\n\`.getgalau <nomor/nama lagu>\`\n\n- nomor = sesuai dengan nomor urut list\n- nama lagu = sesuai dengan nama lagu di list`;

                await naze.sendMessage(m.chat, {
                    text: listMessage,
                    contextInfo: {
                        externalAdReply: {
                            title: `${global.botname} 🎵`,
                            body: 'Daftar Lagu Galau',
                            previewType: 'PHOTO',
                            thumbnailUrl: global.getRandomThumbnailUrl(),
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: m });
                
            };

            const sendButtonMessage = async () => {
                const randomMessages = [
                    'Jangan terlalu larut dalam kesedihan, suatu saat semua akan membaik. 🎶',
                    'Musik adalah cara terbaik untuk merangkul rasa sakit tanpa harus berkata-kata. 🎵',
                    'Galau itu wajar, tapi jangan sampai menghentikan langkahmu! ✨',
                    'Setiap luka akan sembuh pada waktunya, biarkan lagu-lagu ini menemanimu. 💙',
                    'Hidup terus berjalan, tapi tak ada salahnya berhenti sejenak dan meresapi lagu ini. 🎼',
                    'Bukan kamu saja yang terluka, ada banyak yang merasa sama. Mari berbagi rasa lewat musik. 🎧'
                ];
                const randomMessage = pickRandom(randomMessages);

                const sections = [{
                    title: '🎵 DAFTAR LAGU GALAU',
                    highlight_label: `Total: ${songList.length} Lagu`,
                    rows: songList.map(song => ({
                        title: `${song.number}. ${song.name}`,
                        description: `Pilih untuk mengunduh lagu`,
                        id: `getgalau ${song.number}`
                    }))
                }];

                const bet = { title: '🎵 DAFTAR LAGU GALAU', sections };

                await naze.sendMessage(m.chat, {
                    image: { url: global.getRandomThumbnail() },
                    mimetype: 'image/jpeg',
                    caption: `🎶 LIST LAGU GALAU\n` +
                            `🎵 *Total:* \`${songList.length} Lagu\`\n\n` +
                            `💬 *Pesan:*\n_"${randomMessage}"_\n\n` +
                            `🔹 *Klik lagu di bawah ini untuk mengunduh.*\n`,
                    footer: `Powered By ${global.botname}`,
                    buttons: [
                        {
                            buttonId: 'action',
                            buttonText: { displayText: 'Pilih Lagu' },
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
                            title: `🎶 Daftar Lagu Galau`,
                            body: `${global.botname}✨`,
                            previewType: 'PHOTO',
                            thumbnailUrl: global.getRandomThumbnailUrl(),
                            mediaType: 1,
                            renderLargerThumbnail: false
                        }
                    },
                    viewOnce: true,
                    headerType: 4
                }, { quoted: m });
                
            };

            if (useButton) await sendButtonMessage();
            else await sendTextMessage();
        } catch (err) {
            
            await global.handleError(naze, m, err, {
                sendRawError: true,
                useGemini: true
            });
        }
    }
};