const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

const dataFilePath = path.join(__dirname, '../../database/topcmd.js');

module.exports = {
    name: 'topcommand',
    alias: ['topcmd'],
    run: async ({ naze, m }) => {
        try {
            
            let featureUsage = {};
            if (fs.existsSync(dataFilePath)) {
                const fileContent = fs.readFileSync(dataFilePath, 'utf8');
                const match = fileContent.match(/module\.exports\s*=\s*({[\s\S]*?});/);
                if (match && match[1]) {
                    featureUsage = JSON.parse(match[1]);
                }
            }
            const usageArray = Object.entries(featureUsage)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10); 
            let result = `📊 *TOP 10 COMMAND STATISTICS* 📊\n\n`;
            if (usageArray.length === 0) {
                result += `Belum ada fitur yang digunakan.`;
                await naze.sendMessage(m.chat, { text: result }, { quoted: m });
                return;
            } else {
                usageArray.forEach((item, index) => {
                    result += `${index + 1}. *${item.name}*: ${item.count} kali\n`;
                });
            }
            const labels = usageArray.map(item => `${item.name} (${item.count}) = `);
            const data = usageArray.map(item => item.count);
            const backgroundColor = [
                '#FF3784', '#36A2EB', '#4BC0C0', '#F77825', '#9966FF', 
                '#00A36C', '#FF8C00', '#8A2BE2', '#DC143C', '#20B2AA'
            ]; 
            const chartConfig = {
                type: "outlabeledPie",
                data: {
                    labels,
                    datasets: [{
                        backgroundColor: backgroundColor.slice(0, labels.length),
                        data
                    }]
                },
                options: {
                    plugins: {
                        legend: false,
                        outlabels: {
                            text: "%l %p",
                            color: "white",
                            stretch: 35,
                            font: {
                                resizable: true,
                                minSize: 12,
                                maxSize: 18
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: '\n\n\n\nTop 10 Commands'
                    }
                }
            };
            const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig));
            const chartUrl = `https://quickchart.io/chart?c=${encodedConfig}&w=700&h=500`;
            await naze.sendMessage(m.chat, {
                text: result,
                contextInfo: {
                    
                    isForwarded: true,
                    externalAdReply: {
                        title: '📊 Top 10 Commands',
                        body: 'Statistik penggunaan perintah',
                        thumbnailUrl: chartUrl,
                        sourceUrl: chartUrl,
                        mediaType: 1,
                        previewType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });
        } catch (err) {
            console.error('Error in topcommand:', err.stack);
            await global.sendMessageWithThumbnail(naze, m.chat, 'error', m);
        }
    },
    incrementFeatureUsage: function (featureFileName) {
        const name = featureFileName ? featureFileName.toLowerCase() : 'unknown';
        if (name === 'topcommand' || name === 'resettopcommand') {
            return; 
        }
        try {
            let featureUsage = {};
            if (fs.existsSync(dataFilePath)) {
                const fileContent = fs.readFileSync(dataFilePath, 'utf8');
                const match = fileContent.match(/module\.exports\s*=\s*({[\s\S]*?});/);
                if (match && match[1]) {
                    featureUsage = JSON.parse(match[1]);
                }
            }

            const previousCount = featureUsage[name] || 0;
            featureUsage[name] = previousCount + 1;

            const fileContent = `module.exports = ${JSON.stringify(featureUsage, null, 2)};`;
            fs.writeFileSync(dataFilePath, fileContent);

            console.log(`[LOG] Incremented usage for feature file: ${name}, new count: ${featureUsage[name]}`);
        } catch (err) {
            console.error('Error updating feature usage:', err.message, err.stack);
        }
    }.bind(module.exports)
};