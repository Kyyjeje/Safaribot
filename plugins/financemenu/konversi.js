const fetch = require('node-fetch');

module.exports = {
    name: 'konversi',
    run: async ({ naze, m, text, prefix, command }) => {
        try {
            
            const currencySymbols = {
                USD: '$', IDR: 'Rp.', EUR: '€', GBP: '£', JPY: '¥',
                AUD: 'A$', CAD: 'C$', SGD: 'S$', MYR: 'RM'
            };
            const args = text.split(' ');
            if (args.length < 4) {
                await naze.sendMessage(m.chat, { 
                    text: `Format: ${m.prefix}${m.command} <jumlah> <mata uang asal> ke <mata uang tujuan>\nContoh: ${m.prefix}${m.command} 100 USD ke IDR`
                }, { quoted: m });
                
                return;
            }
            const amount = parseFloat(args[0]);
            if (isNaN(amount)) {
                await naze.sendMessage(m.chat, { 
                    text: `Jumlah uang harus angka valid!\nContoh: ${m.prefix}${m.command} 100 USD ke IDR`
                }, { quoted: m });
                
                return;
            }
            const fromCurrency = args[1].toUpperCase();
            const toCurrency = args[3].toUpperCase();
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
            const data = await response.json();
            if (!data.rates[toCurrency]) throw new Error(`Mata uang *${toCurrency}* tidak valid atau tidak ditemukan.`);
            const rate = data.rates[toCurrency];
            const convertedAmount = (amount * rate).toFixed(2);
            const fromSymbol = currencySymbols[fromCurrency] || fromCurrency;
            const toSymbol = currencySymbols[toCurrency] || toCurrency;
            const output = `💸 ${fromSymbol}${parseFloat(amount).toLocaleString('id-ID')} ${fromCurrency} = ${toSymbol}${parseFloat(convertedAmount).toLocaleString('id-ID')} ${toCurrency}\n` +
                           `📊 Nilai tukar: 1 ${fromCurrency} = ${rate.toLocaleString('id-ID')} ${toCurrency}`;
            await naze.sendMessage(m.chat, { text: output }, { quoted: m });
            
        } catch (e) {
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};