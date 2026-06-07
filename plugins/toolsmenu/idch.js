require('../../settings');
const axios = require('axios');
const cheerio = require('cheerio');

function extractText(m) {
    if (!m || !m.message) return '';
    if (m.type === 'conversation') return m.message.conversation || '';
    if (m.type === 'imageMessage') return m.message.imageMessage?.caption || '';
    if (m.type === 'videoMessage') return m.message.videoMessage?.caption || '';
    if (m.type === 'extendedTextMessage') return m.message.extendedTextMessage?.text || '';
    if (m.type === 'buttonsResponseMessage') return m.message.buttonsResponseMessage?.selectedButtonId || '';
    if (m.type === 'listResponseMessage') return m.message.listResponseMessage?.singleSelectReply?.selectedRowId || '';
    if (m.type === 'templateButtonReplyMessage') return m.message.templateButtonReplyMessage?.selectedId || '';
    if (m.type === 'interactiveResponseMessage') {
        const params = m.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
        return params ? JSON.parse(params).id || '' : '';
    }
    if (m.type === 'editedMessage') {
        const edited = m.message.editedMessage?.message?.protocolMessage?.editedMessage;
        return edited?.extendedTextMessage?.text || edited?.conversation || '';
    }
    return m.text || '';
}

module.exports = {
    name: 'cekidch',
    alias: ['idch', 'getidch', 'getidchanel'],
    description: '<url chanel>',
    run: async ({ naze, m }) => {
        try {
            

            const text = extractText(m).trim().split(/ +/).slice(1).join(' ');
            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `Masukkan link channel WhatsApp!\nContoh: ${m.prefix}${m.command} https://whatsapp.com/channel/0029VaD` }, { quoted: m });
            }

            const match = text.match(/https:\/\/whatsapp\.com\/channel\/([0-9a-zA-Z]{24})/);
            if (!match) {
                
                return naze.sendMessage(m.chat, { text: `Link tidak valid!\nContoh: ${m.prefix}${m.command} https://whatsapp.com/channel/0029VaD` }, { quoted: m });
            }

            const channelId = match[1];
            if (!/[0-9a-zA-Z]{24}/.test(channelId)) {
                
                return naze.sendMessage(m.chat, { text: `ID channel tidak valid!\nContoh: ${m.prefix}${m.command} https://whatsapp.com/channel/0029VaD` }, { quoted: m });
            }

            const res = await naze.newsletterMetadata('invite', channelId);
            const response = await axios.get(`https://whatsapp.com/channel/${channelId}`);
            const $ = cheerio.load(response.data);
            const image = $('meta[property="og:image"]').attr('content') || '';

            const teks = `📌 *Nama:* ${res.name}\n` +
                         `🔹 *ID:* ${res.id}\n` +
                         `👥 *Pengikut:* ${res.subscribers.toLocaleString()}\n` +
                         `🔰 *Status:* ${res.state}\n` +
                         `✅ *Verifikasi:* ${res.verification === 'VERIFIED' ? '✅ Terverifikasi' : '❌ Tidak Terverifikasi'}\n\n` +
                         `🔗 *Link:* https://whatsapp.com/channel/${channelId}`;

            const botNumber = await naze.decodeJid(naze.user.id);
            if (!global.db) global.db = {};
            if (!global.db.set) global.db.set = {};
            if (!global.db.set[botNumber]) global.db.set[botNumber] = {};
            if (!global.db.set[botNumber].setbutton) global.db.set[botNumber].setbutton = {};
            if (!global.db.set[botNumber].setbutton.idch) global.db.set[botNumber].setbutton.idch = false;

            const useButton = global.db.set[botNumber].setbutton.idch;

            const sendTextMessage = async () => {
                
                await naze.sendMessage(m.chat, {
                    image: image ? { url: image } : undefined,
                    caption: teks,
                    footer: '🔍 Data channel berhasil diperoleh!'
                }, { quoted: m });
            };

            const sendButtonMessage = async () => {
                const interactiveButtons = [
                    {
                        name: 'cta_copy',
                        buttonParamsJson: JSON.stringify({
                            display_text: 'Salin ID',
                            id: res.id,
                            copy_code: res.id
                        })
                    },
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: 'Kunjungi Channel',
                            url: `https://whatsapp.com/channel/${channelId}`
                        })
                    }
                ];

                
                await naze.sendMessage(m.chat, {
                    image: image ? { url: image } : undefined,
                    caption: teks,
                    title: '📢 Detail Channel',
                    footer: '🔍 Data channel berhasil diperoleh!',
                    interactiveButtons
                }, { quoted: m });
            };

            if (useButton) {
                await sendButtonMessage();
            } else {
                await sendTextMessage();
            }
        } catch (err) {
            console.error(`Gagal mengambil data channel: ${err.message}`);
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};