require('../../settings');
const axios = require('axios');

const axiosInstance = axios.create({ timeout: 90000 });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const retryRequest = async (url, maxRetries = 1) => {
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await axiosInstance.head(url);
        } catch (e) {
            if (i === maxRetries) throw e;
            await delay(2000);
        }
    }
};

module.exports = {
    name: 'marketcek',
    alias: ['cekmarket'],
    run: async ({ naze, m, text }) => {
        try {
            
            if (!text) {
                await naze.sendMessage(m.chat, { 
                    text: `Contoh: ${m.prefix}${m.command} xauusd [timeframe]\nTimeframe: M1, M5, M15, H1, H4, D1, W1, MN`
                }, { quoted: m });
                
                return;
            }
            const args = text.split(' ');
            const symbol = args[0].toUpperCase();
            const timeframe = args[1] ? args[1].toUpperCase() : 'H1';
            if (!symbol) {
                await naze.sendMessage(m.chat, { 
                    text: `Simbol pasar tidak valid! Contoh: ${m.prefix}${m.command} xauusd`
                }, { quoted: m });
                
                return;
            }
            const timeframeMap = { M1: '1', M5: '5', M15: '15', H1: '60', H4: '240', D1: 'D', W1: 'W', MN: 'M' };
            const validTimeframes = Object.keys(timeframeMap);
            if (!validTimeframes.includes(timeframe)) {
                await naze.sendMessage(m.chat, { 
                    text: `Timeframe tidak valid! Pilih dari: ${validTimeframes.join(', ')}`
                }, { quoted: m });
                
                return;
            }
            const selectedTimeframe = timeframeMap[timeframe];
            await naze.sendMessage(m.chat, { text: `Sedang memproses chart ${symbol} (${timeframe})...` }, { quoted: m });
            await delay(2000);
            const tradingViewUrl = `https://www.tradingview.com/chart/?symbol=${symbol}&interval=${selectedTimeframe}&theme=light&style=1&hide_side_toolbar=true&hide_top_toolbar=true&hide_left_toolbar=true&hide_watchlist=true&hide_legend=true&hide_volume=true&hide_bottom_toolbar=true`;
            const apiUrl = `https://api.siputzx.my.id/api/tools/ssweb?url=${encodeURIComponent(tradingViewUrl)}&theme=light&device=desktop&full=true`;
            await delay(3000);
            await retryRequest(apiUrl);
            await delay(2000);
            await naze.sendMessage(m.chat, {
                text: `*Chart ${symbol} (${timeframe})*\nDiambil pada ${new Date().toLocaleString()}`,
                contextInfo: {
                    externalAdReply: {
                        title: `Chart ${symbol} - ${timeframe}`,
                        body: 'TradingView',
                        previewType: 'PHOTO',
                        thumbnailUrl: apiUrl,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        sourceUrl: tradingViewUrl
                    }
                }
            }, { quoted: m });
            
        } catch (e) {
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};