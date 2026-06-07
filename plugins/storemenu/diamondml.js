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
    name: 'diamondml',
    alias: ['mlstalk', 'mldiamond', 'mldm', 'doublediamond'],
    description: '<id>, <server>',
    run: async ({ naze, m}) => {
        try {
            

            const body = extractText(m);
            const args = body.trim().split(/ +/).slice(1);
            let [gameId, server] = args.join(' ').trim().split(/[,|()]\s*/).filter(Boolean);

            if (!gameId || !server) {
                
                return naze.sendMessage(m.chat, { text: `Format salah!\nContoh: ${m.prefix}${m.command} 12345678,1001` }, { quoted: m });
            }

            await naze.sendMessage(m.chat, { text: `Sedang mengambil data untuk ID ${gameId}, server ${server}...` }, { quoted: m });

            const usp = {
                app_id: '100000',
                game_user_key: gameId,
                game_server_key: server,
                country: 'ID',
                language: 'id',
                network: '',
                net: '',
                coupon_id: '',
                shop_id: ''
            };

            const url = new URL('https://api.mobapay.com/api/app_shop');
            url.search = new URLSearchParams(usp).toString();

            const response = await fetch(url);
            const json = await response.json();

            if (!json.data || !json.data.user_info || !json.data.user_info.user_name) {
                
                return naze.sendMessage(m.chat, { text: `Tidak ditemukan username dengan ID ${gameId} pada server ${server}\nContoh: \n\`${m.prefix}${m.command} 12345678,1001\`` }, { quoted: m });
            }

            const username = json.data.user_info.user_name || 'Unknown';
            const doubleDiamond = json.data.shop_info.shelf_location[0].goods?.map(v => ({
                title: v.title,
                idrPrice: v.price_local_show,
                currency: v.currency,
                canBuy: v.game_can_buy
            })) || [];

            const thousandSeparator = string => string.split('').reverse().join('').match(/.{1,3}/g).join('.').split('').reverse().join('');
            const result = `*DIAMOND ML - PROMO DIAMOND*\n\n` +
                          `- *Username*: \`${username}\`\n` +
                          `- *ID Game*: ${gameId}\n` +
                          `- *Server*: ${server}\n\n` +
                          `*Daftar Promo Diamond Double*\n` +
                          (doubleDiamond.length ? doubleDiamond.map((v, i) => `  ${i + 1}. ${v.title} - ${v.currency} ${thousandSeparator(v.idrPrice)} ${v.canBuy ? '✅' : '❌'}`).join('\n') : '  Tidak ada promo tersedia');

            
            return naze.sendMessage(m.chat, { text: result }, { quoted: m });
        } catch (err) {
            console.error(`Kesalahan saat memproses diamondml: ${err.message}`);
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};