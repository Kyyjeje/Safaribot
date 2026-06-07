require('../../settings');
const fetch = require('node-fetch');

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
    name: 'tekstobase64',
    alias: ['texttobase64'],
    run: async ({ naze, m }) => {
        try {
            

            const text = extractText(m).trim().split(/ +/).slice(1).join(' ');
            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `Masukkan teks yang ingin dikonversi ke Base64!\nContoh: ${m.prefix}${m.command} Hello World` }, { quoted: m });
            }

            const res = await fetch(`https://api.siputzx.my.id/api/tools/text2base64?text=${encodeURIComponent(text)}`);
            const json = await res.json();

            if (!json?.status || !json.data?.base64) {
                
                return naze.sendMessage(m.chat, { text: `Gagal mengonversi teks ke Base64!\nContoh: ${m.prefix}${m.command} Hello World` }, { quoted: m });
            }

            
            await naze.sendMessage(m.chat, { text: `🔠 *Base64 Encode*\n📥 *Input*: ${text}\n📤 *Output*: ${json.data.base64}` }, { quoted: m });
        } catch (err) {
            console.error(`Gagal mengonversi ke Base64: ${err.message}`);
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};