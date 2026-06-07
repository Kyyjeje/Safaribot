require('../../settings');
const axios = require('axios');
const cheerio = require('cheerio');

async function styletext(teks) {
    const { data } = await axios.get(`http://qaz.wtf/u/convert.cgi?text=${encodeURIComponent(teks)}`);
    const $ = cheerio.load(data);
    const hasil = [];
    $('table > tbody > tr').each((_, b) => {
        hasil.push({ name: $(b).find('td:nth-child(1) > span').text(), result: $(b).find('td:nth-child(2)').text().trim() });
    });
    return hasil;
}

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
    name: 'style',
    alias: [],
    description: '<teks>',
    run: async ({ naze, m }) => {
        try {
            

            const text = extractText(m).trim().split(/ +/).slice(1).join(' ');
            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `Masukkan teks yang ingin diubah stylenya!\nContoh: ${m.prefix}${m.command} bangsulstart` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            const anu = await styletext(text);
            const txt = anu.map(a => `*${a.name}*\n${a.result}`).join("\n\n");

            
            await naze.sendMessage(m.chat, { text: txt }, { quoted: m });
        } catch (err) {
            console.error(`Gagal memproses style: ${err.message}`);
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};