require('../../settings');
const fetch = require('node-fetch');

module.exports = {
    name: 'nilai-matauang',
    run: async ({ naze, m, text }) => {
        try {
            
            if (!text) {
                await naze.sendMessage(m.chat, { 
                    text: `Masukkan kode mata uang!\nContoh: ${m.prefix}${m.command} IDR`
                }, { quoted: m });
                
                return;
            }
            const currency = text.toUpperCase();
            const response = await fetch(`https://v6.exchangerate-api.com/v6/6f102cad97b2ba0ad5b4cf48/latest/${currency}`);
            if (!response.ok) throw new Error(`Gagal mengambil data: ${response.status}`);
            const data = await response.json();
            if (data.result !== 'success') throw new Error('Gagal mengambil data nilai tukar.');
            const rates = data.conversion_rates;
            const sortedCurrencies = Object.keys(rates).sort();
            let message = `📌 *Nilai Tukar Mata Uang Terbaru (${currency}) 💲*\n\n`;
            for (let curr of sortedCurrencies) {
                message += `💰 *${curr}*: ${rates[curr]}\n`;
            }
            message += `\n🔄 *Data diperbarui*: ${data.time_last_update_utc}`;
            await naze.sendMessage(m.chat, { text: message }, { quoted: m });
            
        } catch (e) {
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};