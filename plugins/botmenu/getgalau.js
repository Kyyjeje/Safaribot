const { globalSettings } = require('../../settings');
const axios = require('axios');
const fs = require('fs');

module.exports = {
    name: 'getgalau',
    alias: ['ambillagu'],
    description: '<nomor/nama>',
    run: async ({ naze, m }) => {
        try {
            let body = '';
            if (m.type === 'conversation') body = m.message.conversation || '';
            else if (m.type === 'imageMessage') body = m.message.imageMessage.caption || '';
            else if (m.type === 'videoMessage') body = m.message.videoMessage.caption || '';
            else if (m.type === 'extendedTextMessage') body = m.message.extendedTextMessage.text || '';
            else if (m.type === 'buttonsResponseMessage') body = m.message.buttonsResponseMessage.selectedButtonId || '';
            else if (m.type === 'listResponseMessage') body = m.message.listResponseMessage.singleSelectReply.selectedRowId || '';
            else if (m.type === 'templateButtonReplyMessage') body = m.message.templateButtonReplyMessage.selectedId || '';
            else if (m.type === 'interactiveResponseMessage') {
                const nativeFlow = m.message.interactiveResponseMessage?.nativeFlowResponseMessage;
                if (nativeFlow && nativeFlow.paramsJson) {
                    const params = JSON.parse(nativeFlow.paramsJson);
                    body = params.id || '';
                }
            } else if (m.type === 'messageContextInfo') {
                body = (m.message.buttonsResponseMessage?.selectedButtonId ||
                        m.message.listResponseMessage?.singleSelectReply.selectedRowId ||
                        m.text) || '';
            } else if (m.type === 'editedMessage') {
                body = (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage?.text ||
                        m.message.editedMessage.message.protocolMessage.editedMessage.conversation) || '';
            }

            if (!body) {
                return m.reply('⚠️ Tidak ada input yang diterima. Gunakan `.getgalau <nomor>` atau pilih dari daftar.');
            }

            const args = body.trim().split(/ +/);
            let laguIndex;

            if (args[0].toLowerCase() === 'getgalau' && args.length > 1) {
                laguIndex = parseInt(args[1]) - 1;
            } else {
                laguIndex = parseInt(args[0]) - 1;
            }

            const songList = global.galauListCache || [];
            if (songList.length === 0) {
                return m.reply('⚠️ Tidak ada lagu galau tersedia. Coba jalankan `.listgalau` terlebih dahulu.');
            }

            if (isNaN(laguIndex) || laguIndex < 0 || laguIndex >= songList.length) {
                let listMessage = '*Nomor lagu tidak valid. Pilih nomor yang sesuai:*\n\n';
                songList.forEach(song => {
                    listMessage += `${song.number}. ${song.name}\n`;
                });
                listMessage += '\nGunakan `.getgalau <nomor>` atau pilih dari daftar.';
                return m.reply(listMessage);
            }

            const selectedSong = songList[laguIndex];
            const judul = selectedSong.name;
            m.reply(`Mengirimkan file *${judul}*...\n\nJangan galau terus yaaa🥹🥺\n_kalau ada masalah cerita aja gak papa kok_`);

            let audioBuffer;
            if (selectedSong.source === 'local') {
                if (!fs.existsSync(selectedSong.path)) {
                    return m.reply(`⚠️ File *${judul}* tidak ditemukan di direktori lokal.`);
                }
                audioBuffer = fs.readFileSync(selectedSong.path);
            } else {
                const response = await axios.get(selectedSong.path, { responseType: 'arraybuffer' });
                audioBuffer = Buffer.from(response.data);
            }

            await naze.sendMessage(m.chat, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg'
            }, { quoted: m });
        } catch (err) {
            await global.handleError(naze, m, err, {
                sendRawError: true,
                useGemini: true
            });
        }
    }
};