require('../../settings');

module.exports = {
    name: 'analisacek',
    alias: ['cekanalisa'],
    description: '<value OB>',
    run: async ({ naze, m}) => {
        try {
            
            const body = m.type === 'conversation' ? m.message.conversation :
                         m.type === 'imageMessage' ? m.message.imageMessage.caption :
                         m.type === 'videoMessage' ? m.message.videoMessage.caption :
                         m.type === 'extendedTextMessage' ? m.message.extendedTextMessage.text :
                         m.type === 'buttonsResponseMessage' ? m.message.buttonsResponseMessage.selectedButtonId :
                         m.type === 'listResponseMessage' ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                         m.type === 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId :
                         m.type === 'messageContextInfo' ? (m.message.buttonsResponseMessage?.selectedButtonId ||
                                                           m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) :
                         m.type === 'editedMessage' ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage ?
                                                       m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage.text :
                                                       m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
            const args = body.trim().split(/ +/).slice(1);
            if (!args.length) {
                await naze.sendMessage(m.chat, { 
                    text: `Masukkan angka di Break of Structure pada Time Frame 5 Menit!\nContoh: ${m.prefix}${m.command} 3112.97`
                }, { quoted: m });
                
                return;
            }
            const number = Number(args[0]);
            if (isNaN(number)) {
                await naze.sendMessage(m.chat, { 
                    text: `Masukkan angka valid di Break of Structure pada Time Frame 5 Menit!\nContoh: ${m.prefix}${m.command} 3112.97`
                }, { quoted: m });
                
                return;
            }
            const sqrtNumber = Math.sqrt(number);
            const resultSell = Math.pow(sqrtNumber + 0.175, 2);
            const resultBuy = Math.pow(sqrtNumber - 0.125, 2);
            const takeProfit = number;
            const output = `📊 *Hasil Analisa untuk Rekomendasi Buy dan Sell* 📊\n\n` +
                           `💰 *Harga di Break of Structure*: ${number.toFixed(2)}\n` +
                           `📈 *Saran Buy*: ${resultBuy.toFixed(2)}\n` +
                           `📉 *Saran Sell*: ${resultSell.toFixed(2)}\n` +
                           `🎯 *Take Profit (TP)*: ${takeProfit.toFixed(2)}\n\n` +
                           `✨ Gunakan analisa ini untuk strategi tradingmu! 🚀`;
            await naze.sendMessage(m.chat, { text: output }, { quoted: m });
            
        } catch (e) {
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};