require('../../settings');
const axios = require('axios');

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
    name: 'base64toteks',
    alias: ['base64totext'],
    run: async ({ naze, m }) => {
        try {
            

            const text = extractText(m).trim().split(/ +/).slice(1).join(' ');
            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `Masukkan teks dalam format Base64!\nContoh: ${m.prefix}${m.command} SGVsbG8gV29ybGQ=` }, { quoted: m });
            }

            const response = await axios.get(`https://api.siputzx.my.id/api/tools/base642text?base64=${encodeURIComponent(text)}`);
            const data = response.data;

            if (data.status) {
                
                return naze.sendMessage(m.chat, { text: `🔠 *Base64 Decode*\n\n📥 Input: ${text}\n📤 Output: ${data.data.text}` }, { quoted: m });
            } else {
                
                return naze.sendMessage(m.chat, { text: `Gagal mendekode Base64!\nContoh: ${m.prefix}${m.command} SGVsbG8gV29ybGQ=` }, { quoted: m });
            }
        } catch (err) {
            console.error(`Gagal mendekode Base64: ${err.message}`);
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};