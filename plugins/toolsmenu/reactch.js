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
    name: 'reactch',
    alias: ['react-ch', 'reactchannel', 'rch', 'reactc', 'channelreact', 'chre'],
    run: async ({ naze, m }) => {
        try {
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
            if (!isOwner) {
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            const text = extractText(m).trim().split(/ +/).slice(1).join(' ');
            if (!text) {
                return naze.sendMessage(m.chat, {
                    text: `Format salah!\n\nPenggunaan:\n${m.prefix}${m.command} <link_pesan> <emoji1> <emoji2> ...\n\nContoh:\n${m.prefix}${m.command} https://whatsapp.com/channel/0029VbBt4432f3ENa8ULoM1J/123 😂,❤️,🔥`
                }, { quoted: m });
            }

            const args = text.split(/\s+/);
            const link = args[0];
            const emojis = args.slice(1);

            if (!link.includes('whatsapp.com/channel/')) {
                return naze.sendMessage(m.chat, { text: 'Link channel tidak valid!' }, { quoted: m });
            }
            if (emojis.length === 0) {
                return naze.sendMessage(m.chat, { text: 'Masukkan minimal 1 emoji!' }, { quoted: m });
            }

         const apiKey =  global.apikeyrch
            const emojiParam = emojis.join(',');

            const url = `https://react.whyux-xec.my.id/api/rch?link=${encodeURIComponent(link)}&emoji=${encodeURIComponent(emojiParam)}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: { 'x-api-key': apiKey }
            });

            const result = await response.json();

            if (!response.ok || result.status === false) {
                throw new Error(result.message || 'API mengembalikan error');
            }

            await naze.sendMessage(m.chat, {
                text: `Reaksi berhasil dikirim!\n\nLink: ${link}\nEmoji: ${emojis.join(' ')}\n\nStatus: Success`
            }, { quoted: m });

        } catch (err) {
            console.error(`Gagal react channel: ${err.message}`);
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};