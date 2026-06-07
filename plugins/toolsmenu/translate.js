require('../../settings');
const axios = require('axios');
const translate = require('translate-google-api');

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
    name: 'translate',
    alias: ['tr'],
    description: '<reply pesan/teks>',
    run: async ({ naze, m }) => {
        try {
            

            const bahasaList = {
                af: 'Afrikaans 🇿🇦', ar: 'Arab 🇸🇦', zh: 'Chinese 🇨🇳', en: 'English 🇬🇧', 'en-us': 'English (United States) 🇺🇸',
                fr: 'French 🇫🇷', de: 'German 🇩🇪', hi: 'Hindi 🇮🇳', hu: 'Hungarian 🇭🇺', is: 'Icelandic 🇮🇸', id: 'Indonesian 🇮🇩',
                it: 'Italian 🇮🇹', ja: 'Japanese 🇯🇵', ko: 'Korean 🇰🇷', la: 'Latin 🇻🇦', no: 'Norwegian 🇳🇴', pt: 'Portuguese 🇵🇹',
                'pt-br': 'Portuguese (Brazil) 🇧🇷', ro: 'Romanian 🇷🇴', ru: 'Russian 🇷🇺', sr: 'Serbian 🇷🇸', es: 'Spanish 🇪🇸',
                sv: 'Swedish 🇸🇪', ta: 'Tamil 🇮🇳', th: 'Thai 🇹🇭', tr: 'Turkish 🇹🇷', vi: 'Vietnamese 🇻🇳'
            };

            const barisjudul = '╔═〇';
            const tutupjudul = '╠═════════〇';
            const penutup = '╚═════════════════〇';
            const barisfitur = '╠»';

            const list_tr = `${barisjudul} *🌍 Kode Bahasa*\n${tutupjudul}\n${Object.entries(bahasaList).map(([code, name]) => `${barisfitur} ${name} (${code})`).join('\n')}\n${penutup}\n\n✍️ *Cara Penggunaan*:\n${m.prefix}${m.command} <kode bahasa> <teks/reply pesan>\nContoh: ${m.prefix}${m.command} en Halo`;

            const text = extractText(m).trim().split(/ +/).slice(1).join(' ');
            if (!text) {
                
                return naze.sendMessage(m.chat, { text: list_tr }, { quoted: m });
            }

            const argsArray = text.split(' ');
            const targetLang = argsArray.shift().toLowerCase();
            let queryText = argsArray.join(' ');

            if (!bahasaList[targetLang]) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Kode bahasa tidak valid!\n\n${list_tr}` }, { quoted: m });
            }

            if (!queryText && m.quoted) queryText = extractText(m.quoted);
            if (!queryText) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Masukkan teks untuk diterjemahkan!\n\n${list_tr}` }, { quoted: m });
            }

            const result = await translate(queryText, { to: targetLang });
            const namaBahasa = bahasaList[targetLang] || targetLang.toUpperCase();
            const hasil_tr = `🌐 *Auto Translate Result*\n\n🗣️ *Bahasa Tujuan:* ${namaBahasa}\n💬 *Hasil:* ${result[0]}`;
            
            await naze.sendMessage(m.chat, { text: hasil_tr }, { quoted: m });
        } catch (err) {
            console.error(`Fatal error di translate: ${err.message}\nStack: ${err.stack}`);
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};