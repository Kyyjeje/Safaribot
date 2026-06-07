const fs = require('fs');
require('../../settings');

const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    name: 'dellsampah',
    alias: ['delsampah', 'deletesampah'],
    description: '[true]',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            

            const files = await fs.promises.readdir('./temp').catch(err => {
                throw new Error(`Gagal membaca direktori: ${err.message}`);
            });
            const filteredArray = files.filter(item => /\.(gif|png|mp3|mp4|jpg|webp|webm|opus|jpeg)$/i.test(item));
            let teks = `Terdeteksi ${filteredArray.length} file sampah\n\n`;

            if (filteredArray.length === 0) {
                
                return naze.sendMessage(m.chat, { text: teks }, { quoted: m });
            }

            filteredArray.forEach((file, i) => {
                teks += `${i + 1}. ${file}\n`;
            });

            const body = m.type === 'conversation' ? m.message.conversation :
                         m.type === 'imageMessage' ? m.message.imageMessage.caption :
                         m.type === 'videoMessage' ? m.message.videoMessage.caption :
                         m.type === 'extendedTextMessage' ? m.message.extendedTextMessage.text :
                         m.type === 'buttonsResponseMessage' ? m.message.buttonsResponseMessage.selectedButtonId :
                         m.type === 'listResponseMessage' ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                         m.type === 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId :
                         m.type === 'messageContextInfo' ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) :
                         m.type === 'editedMessage' ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage?.text || m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
            const args = body.trim().split(/ +/).slice(1);
            const text = args.join(' ').trim();

            if (text === 'true') {
                const { key } = await naze.sendMessage(m.chat, { text: 'Menghapus file sampah...' }, { quoted: m });
                for (const file of filteredArray) {
                    await fs.promises.unlink(`./temp/${file}`);
                }
                await sleep(2000);
                
                await naze.sendMessage(m.chat, { text: '✅ Berhasil menghapus semua file sampah', edit: key }, { quoted: m });
            } else {
                
                await naze.sendMessage(m.chat, { text: `${teks}\n*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} true\`\n> Untuk menghapus semua file sampah` }, { quoted: m });
            }
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};