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
    name: 'gitclone',
    alias: ['git'],
    description: '<url github>',
    run: async ({ naze, m }) => {
        try {
            

            const args = extractText(m).trim().split(/ +/).slice(1);
            if (args.length === 0) {
                
                return naze.sendMessage(m.chat, { text: `Masukkan URL GitHub!\nContoh: ${m.prefix}${m.command} https://github.com/nazedev/hitori` }, { quoted: m });
            }

            const regex = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)/i;
            const match = args[0].match(regex);
            if (!match) {
                
                return naze.sendMessage(m.chat, { text: `URL tidak valid!\nContoh: ${m.prefix}${m.command} https://github.com/nazedev/hitori` }, { quoted: m });
            }

            const user = match[1];
            const repo = match[2].replace(/\.git$/, '');
            if (!user || !repo) {
                
                return naze.sendMessage(m.chat, { text: `URL tidak valid!\nContoh: ${m.prefix}${m.command} https://github.com/nazedev/hitori` }, { quoted: m });
            }
            await naze.sendMessage(m.chat, {
                document: { url: `https://api.github.com/repos/${user}/${repo}/zipball` },
                fileName: `${repo}.zip`,
                mimetype: 'application/zip'
            }, { quoted: m });
            
        } catch (err) {
            console.error(`Gagal mengirim file: ${err.message}`);
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};