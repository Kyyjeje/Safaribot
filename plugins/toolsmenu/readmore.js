require('../../settings');

const more = String.fromCharCode(8206);
const readmore = more.repeat(999);

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
    name: 'readmore',
    alias: ['rm'],
    description: '<teks> | <teks>',
    run: async ({ naze, m }) => {
        try {
            

            const text = extractText(m).trim().split(/ +/).slice(1).join(' ');
            if (!text || !text.includes('|')) {
                
                return naze.sendMessage(m.chat, { text: `Gunakan format yang benar!\nContoh: ${m.prefix}${m.command} teks atas | teks bawah` }, { quoted: m });
            }

            const [teks1, teks2] = text.split('|').map(t => t.trim());
            if (!teks1 || !teks2) {
                
                return naze.sendMessage(m.chat, { text: `Format teks tidak lengkap! Pastikan ada teks di kedua sisi |\nContoh: ${m.prefix}${m.command} teks atas | teks bawah` }, { quoted: m });
            }

            
            await naze.sendMessage(m.chat, { text: teks1 + readmore + teks2 }, { quoted: m });
        } catch (err) {
            console.error(`Gagal memproses readmore: ${err.message}`);
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};