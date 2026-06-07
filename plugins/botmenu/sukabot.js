const fs = require('fs');
const path = require('path');
require('../../settings');

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
    name: 'suka_bot',
    alias: ['sukabot'],
    run: async ({ naze, m }) => {
        try {
            
            if (!global.db) global.db = {};
            if (!global.db.likeBot) global.db.likeBot = {};
            const senderId = m.sender;
            const senderNumber = senderId.split('@')[0];
            const senderName = m.pushName || 'User Tanpa Nama';
            const thanksMessages = [
                `✨ *Wah, @${senderNumber}, terima kasih banget udah suka sama ${global.botname}!* Bot ini jadi tambah semangat berkat dukunganmu! 🚀`,
                `🌟 *Eh, @${senderNumber}, makasih ya udah jadi fans ${global.botname}!* Kamu bikin hati bot ini bergetar penuh cinta! 💖`,
                `🎉 *@${senderNumber}, terima kasih udah suka ${global.botname}!* Dukunganmu bikin bot ini pengen joget kegirangan! 🕺`,
                `🔥 *Wow, @${senderNumber}, makasih banyak udah suka sama ${global.botname}!* Kamu resmi jadi bagian dari keluarga bot terkece! 😎`,
                `💌 *@${senderNumber}, terima kasih udah kasih cinta buat ${global.botname}!* Bot ini janji bakal kasih pelayanan terbaik buatmu! 🌈`,
                `🌌 *@${senderNumber}, makasih ya udah suka ${global.botname}!* Dukunganmu bikin bot ini merasa kayak bintang di langit! ⭐`,
                `🎁 *Terima kasih, @${senderNumber}, udah suka sama ${global.botname}!* Kamu bikin bot ini pengen kasih hadiah spesial buatmu! 🎀`
            ];
            const alreadyLikedMessages = [
                `😎 *Eits, @${senderNumber}, kamu udah pernah bilang suka sama ${global.botname} nih!* Tapi tenang, cinta kamu selalu bikin bot ini senyum lebar! 💖`,
                `✨ *@${senderNumber}, kayaknya kamu emang fans berat ${global.botname}!* Udah pernah suka sebelumnya, tapi makasih ya tetep setia! 🚀`,
                `🎉 *Halo @${senderNumber}, kamu udah kasih like ke ${global.botname} sebelumnya!* Tetep jadi pendukung terbaik ya, bot ini sayang kamu! 🌟`,
                `🔥 *@${senderNumber}, ternyata kamu udah pernah suka ${global.botname}!* Dukunganmu bikin bot ini jadi makin kece, makasih banget! 😎`,
                `💌 *Eh @${senderNumber}, kamu udah pernah bilang suka nih!* Tapi gak apa-apa, cinta kamu ke ${global.botname} selalu diterima kapan aja! 🌈`
            ];
            let message = !global.db.likeBot[senderId]
                ? (global.db.likeBot[senderId] = { nama: senderName, id: senderNumber, status: 'suka' }, pickRandom(thanksMessages))
                : pickRandom(alreadyLikedMessages);
            const dbPath = path.join(__dirname, '../../database/database.json');
            fs.writeFileSync(dbPath, JSON.stringify(global.db, null, 2), 'utf-8');
            await naze.sendMessage(m.chat, {
                text: message,
                contextInfo: {
                    mentionedJid: [senderId],
                    externalAdReply: {
                        title: `${global.botname}🤖`,
                        body: 'Terima Kasih atas Dukunganmu!',
                        previewType: "PHOTO",
                        thumbnailUrl: global.getRandomThumbnailUrl(),
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });
            
        } catch (e) {
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};