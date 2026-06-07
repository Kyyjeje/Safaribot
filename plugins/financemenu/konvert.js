require('../../settings');

module.exports = {
    name: 'konvert',
    run: async ({ naze, m, text, prefix, command }) => {
        try {
            
            if (!text) {
                await naze.sendMessage(m.chat, { 
                    text: `Format: ${m.prefix}${m.command} <jumlah> cent ke idr\natau: ${m.prefix}${m.command} <jumlah> idr ke cent`
                }, { quoted: m });
                
                return;
            }
            const input = text.toLowerCase();
            const conversionRates = {
                auc: { rate: 106.4, flag: '🇦🇺', description: 'Australian Cent' },
                cac: { rate: 102.5, flag: '🇨🇦', description: 'Canadian Cent' },
                chc: { rate: 104.0, flag: '🇨🇳', description: 'Chinese Cent' },
                euc: { rate: 150.0, flag: '🇪🇺', description: 'European Cent' },
                gbc: { rate: 130.0, flag: '🇬🇧', description: 'British Cent' },
                usc: { rate: 151.7, flag: '🇺🇸', description: 'US Cent' }
            };
            let resultMessage;
            if (input.includes('cent ke idr')) {
                const amount = parseFloat(input.split(' ')[0]);
                if (isNaN(amount)) {
                    await naze.sendMessage(m.chat, { 
                        text: `Masukkan jumlah cent yang valid!\nContoh: ${m.prefix}${m.command} 100 cent ke idr`
                    }, { quoted: m });
                    
                    return;
                }
                resultMessage = `💵 *Konversi dari ${amount} Cent ke IDR:*\n\n`;
                for (const [code, { rate, flag, description }] of Object.entries(conversionRates)) {
                    const idrValue = amount * rate;
                    resultMessage += `${flag} ${code.toUpperCase()} (${description}):\n ${amount} ${code.toUpperCase()} = Rp. ${idrValue.toLocaleString('id-ID')}\n\n`;
                }
            } else if (input.includes('idr ke cent')) {
                const idrValue = parseFloat(input.split(' ')[0].replace(/\./g, ''));
                if (isNaN(idrValue)) {
                    await naze.sendMessage(m.chat, { 
                        text: `Masukkan jumlah IDR yang valid!\nContoh: ${m.prefix}${m.command} 10000 idr ke cent`
                    }, { quoted: m });
                    
                    return;
                }
                resultMessage = `💵 *Konversi dari Rp. ${idrValue.toLocaleString('id-ID')} ke Cent:*\n\n`;
                for (const [code, { rate, flag, description }] of Object.entries(conversionRates)) {
                    const centValue = idrValue / rate;
                    resultMessage += `${flag} ${code.toUpperCase()} (${description}):\n Rp. ${idrValue.toLocaleString('id-ID')} = ${centValue.toFixed(2)} ${code.toUpperCase()}\n\n`;
                }
            } else {
                await naze.sendMessage(m.chat, { 
                    text: `Format: ${m.prefix}${m.command} <jumlah> cent ke idr\natau: ${m.prefix}${m.command} <jumlah> idr ke cent`
                }, { quoted: m });
                
                return;
            }
            await naze.sendMessage(m.chat, { text: resultMessage }, { quoted: m });
            
        } catch (e) {
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};