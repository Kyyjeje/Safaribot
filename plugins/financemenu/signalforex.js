require('../../settings');
const axios = require('axios');

const axiosInstance = axios.create({ timeout: 90000 });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const retryRequest = async (url, options, maxRetries = 1) => {
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await axiosInstance.get(url, options);
        } catch (e) {
            if (i === maxRetries) throw e;
            await delay(2000);
        }
    }
};

module.exports = {
    name: 'signalforex',
    alias: ['forexsignal'],
    run: async ({ naze, m, text, prefix, command }) => {
        try {
            
            if (!text) {
                await naze.sendMessage(m.chat, { 
                    text: `Contoh: ${m.prefix}${m.command} usd\nMasukkan kode mata uang (misal: USD, EUR, JPY).`
                }, { quoted: m });
                
                return;
            }
            const currency = text.trim().toUpperCase();
            if (!currency.match(/^[A-Z]{3}$/)) {
                await naze.sendMessage(m.chat, { 
                    text: `Kode mata uang harus 3 huruf (contoh: USD, EUR, JPY).\nContoh: ${m.prefix}${m.command} usd`
                }, { quoted: m });
                
                return;
            }
            await naze.sendMessage(m.chat, { text: `Sedang mengambil sinyal forex untuk ${currency}...` }, { quoted: m });
            await delay(2000);
            const response = await retryRequest('https://forex-api2.p.rapidapi.com/sentiment/technical', {
                headers: {
                    'x-rapidapi-key': '3acd58602amsh124292f1aa40177p1b4e8ejsnf363d93bb13f',
                    'x-rapidapi-host': 'forex-api2.p.rapidapi.com'
                }
            });
            const data = response.data;
            if (data.hasError) throw new Error(`Gagal mengambil data: ${data.errors.join(', ')}`);
            const filteredSymbols = data.symbols.filter(symbol => symbol.symbol.toUpperCase().includes(currency) && symbol.symbol !== '$DXY');
            if (!filteredSymbols.length) throw new Error(`Tidak ada pasangan mata uang yang mengandung ${currency}!`);
            let message = `*Sinyal Forex untuk ${currency}*\nDiambil pada ${new Date().toLocaleString()}\n\n`;
            filteredSymbols.forEach(symbol => {
                message += `💱 *${symbol.symbol}*\n` +
                           `Harga Terakhir: ${symbol.lastTradePrice}\n` +
                           `Sinyal: ${symbol.todaysOpinion} (${symbol.todaysOpinionPercentage}%)\n\n`;
            });
            await delay(2000);
            await naze.sendMessage(m.chat, { text: message }, { quoted: m });
            
        } catch (e) {
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};