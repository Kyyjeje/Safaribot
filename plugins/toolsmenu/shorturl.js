require('../../settings');
const axios = require('axios');

function isUrl(url) {
    return /^(https?:\/\/[^\s]+)$/.test(url);
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
    name: 'shorturl',
    alias: ['tinyurl', 'shortlink'],
    description: '<url>',
    run: async ({ naze, m }) => {
        try {
            

            const url = extractText(m).trim().split(/ +/).slice(1)[0];
            if (!url || !isUrl(url)) {
                
                return naze.sendMessage(m.chat, { text: `Masukkan URL yang valid!\nContoh: ${m.prefix}${m.command} https://github.com/nazedev/hitori` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
            const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
            
            await naze.sendMessage(m.chat, { text: `🔗 *Shortened URL:* ${response.data}` }, { quoted: m });
        } catch (err) {
            console.error(`Gagal memperpendek URL: ${err.message}`);
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'error', m);
        }
    }
};