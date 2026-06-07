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
    name: 'tohex',
    alias: [],
    run: async ({ naze, m }) => {
        try {
            

            const text = extractText(m).trim().split(/ +/).slice(1).join(' ');
            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `🌟 Konversi ASCII ke Hex\n\n⚠️ Input tidak boleh kosong!\nGunakan: ${m.prefix}${m.command} <teks>\nContoh: ${m.prefix}${m.command} halo` }, { quoted: m });
            }

            const characters = text.split('');
            let hexResult = '';
            let explanation = '';

            characters.forEach((char, index) => {
                const asciiCode = char.charCodeAt(0);
                const hexCode = asciiCode.toString(16).padStart(2, '0').toUpperCase();
                hexResult += hexCode + (index < characters.length - 1 ? ' ' : '');
                explanation += `✧ *Karakter ${index + 1}:* ${char}\n   • Kode ASCII (Base 10): ${asciiCode}\n   • Konversi ke Hex (Base 16): ${hexCode}\n`;
            });

            const output = `🌟 Konversi ASCII ke Hex\n━━━━━━━━━━━━━━━━━━━━━━━\n📝 *Input Teks:* ${text}\n📜 *Hasil Hexadecimal:* ${hexResult}\n\n💡 *Langkah-langkah Konversi:*\n${explanation}━━━━━━━━━━━━━━━━━━━━━━━`;

            
            await naze.sendMessage(m.chat, { text: output }, { quoted: m });
        } catch (err) {
            console.error(`Fatal error di tohex: ${err.message}\nStack: ${err.stack}`);
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};