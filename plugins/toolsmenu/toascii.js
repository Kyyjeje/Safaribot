require('../../settings');

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
    name: 'toascii',
    alias: [],
    run: async ({ naze, m }) => {
        try {
            

            const text = extractText(m).trim().split(/ +/).slice(1).join(' ');
            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `Masukkan kode hex!\nContoh: ${m.prefix}${m.command} 68 61 6C 6F` }, { quoted: m });
            }

            const hexCodes = text.split(/\s+/);
            const hexPattern = /^[0-9A-Fa-f]{2}$/;
            for (const hex of hexCodes) {
                if (!hexPattern.test(hex)) {
                    
                    return naze.sendMessage(m.chat, { text: `Input tidak valid! Setiap kode harus berupa hexadecimal 2 digit (0-9, A-F).\nContoh: ${m.prefix}${m.command} 68 61 6C 6F` }, { quoted: m });
                }
            }

            let asciiResult = '';
            let explanation = '';
            hexCodes.forEach((hex, index) => {
                const decimalCode = parseInt(hex, 16);
                const char = String.fromCharCode(decimalCode);
                asciiResult += char;
                explanation += `✧ *Kode ${index + 1}:* ${hex.toUpperCase()}\n` +
                              `   • Hex ke Desimal: ${decimalCode}\n` +
                              `   • Desimal ke ASCII: ${char}\n`;
            });

            const output = `🌟 *Konversi Hex ke ASCII*\n` +
                           `📝 *Input Hex:* ${hexCodes.join(' ').toUpperCase()}\n` +
                           `📜 *Hasil ASCII:* ${asciiResult}\n\n` +
                           `💡 *Langkah-langkah:*\n${explanation}`;
            
            await naze.sendMessage(m.chat, { text: output }, { quoted: m });
        } catch (err) {
            console.error(`Gagal mengonversi hex ke ASCII: ${err.message}`);
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};