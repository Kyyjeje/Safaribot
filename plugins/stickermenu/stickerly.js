require('../../settings');
const fetch = require('node-fetch');

module.exports = {
    name: 'stickerly',
    alias: [],
    description: '<url stickerly>',
    run: async ({ naze, m }) => {
        try {
            

            const body = (m.type === 'conversation') ? m.message.conversation :
                         (m.type === 'imageMessage') ? m.message.imageMessage.caption :
                         (m.type === 'videoMessage') ? m.message.videoMessage.caption :
                         (m.type === 'extendedTextMessage') ? m.message.extendedTextMessage.text :
                         (m.type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId :
                         (m.type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                         (m.type === 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId :
                         (m.type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) :
                         (m.type === 'editedMessage') ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage ? m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage.text : m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
            const args = body.trim().split(/ +/).slice(1);

            if (args.length < 2) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Masukkan perintah dengan format yang benar!\nContoh:\n${m.prefix}${m.command} 5 https://sticker.ly/s/YHZU23\n${m.prefix}${m.command} all https://sticker.ly/s/YHZU23` }, { quoted: m });
            }

            let [limit, stickerUrl] = args;
            if (!stickerUrl.startsWith('https://sticker.ly/')) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ URL tidak valid! Harap masukkan URL Stickerly yang benar.\nContoh: ${m.prefix}${m.command} 5 https://sticker.ly/s/YHZU23` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            let apiUrl = `https://api.siputzx.my.id/api/d/stickerly?url=${encodeURIComponent(stickerUrl)}`;

            let response = await fetch(apiUrl);
            let result = await response.json();

            if (!result.status || !result.data || !result.data.stickers) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Gagal mendapatkan stiker dari URL tersebut!` }, { quoted: m });
            }

            let stickers = result.data.stickers;
            let totalStickers = stickers.length;

            if (totalStickers === 0) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Tidak ada stiker dalam URL tersebut!` }, { quoted: m });
            }

            let stickersToSend;
            if (limit.toLowerCase() === 'all') {
                stickersToSend = stickers;
            } else {
                let jumlah = parseInt(limit);
                if (isNaN(jumlah) || jumlah <= 0) {
                    
                    return naze.sendMessage(m.chat, { text: `⚠️ Masukkan jumlah yang valid!\nContoh: ${m.prefix}${m.command} 5 ${stickerUrl}` }, { quoted: m });
                }
                if (jumlah > totalStickers) {
                    
                    return naze.sendMessage(m.chat, { text: `⚠️ Jumlah yang diminta (${jumlah}) melebihi total stiker (${totalStickers})!` }, { quoted: m });
                }
                stickersToSend = stickers.slice(0, jumlah);
            }

            await naze.sendMessage(m.chat, { text: `Mengirim ${stickersToSend.length} dari ${totalStickers} stiker...` }, { quoted: m });

            for (let stickerUrl of stickersToSend) {
                await naze.sendMessage(m.chat, { sticker: { url: stickerUrl } }, { quoted: m });
                await new Promise(resolve => setTimeout(resolve, 5000));
            }

            
        } catch (e) {
            console.error(`Fatal error di stickerly: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};