const os = require('os');
const speed = require('performance-now');
const { globalSettings } = require('../../settings');

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    else if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    else return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

module.exports = {
    name: 'cekram',
    alias: ['ram', 'keterangan|cekram', 'keterangan|ram'],
    run: async ({ naze, m }) => {
        if (m.text?.toLowerCase().startsWith('keterangan|')) {
            const cmd = m.text.split('|')[1];
            if (['cekram', 'ram'].includes(cmd)) {
                const keterangan = `
💾 *Fitur Cek RAM*

📊 *Fungsi*: Menampilkan statistik penggunaan RAM server dan memori bot (Node.js).
🚀 *Manfaat*: Memantau performa sistem dan mendeteksi beban berlebih.
🛠️ *Cara Penggunaan*: \`.cekram\`
🔁 *Alias*: \`ram\`, \`.cekram\`, \`.ram\`
⚠️ *Catatan*: Menampilkan grafik penggunaan RAM otomatis.
                `.trim();
                return await naze.sendMessage(m.chat, { text: keterangan }, { quoted: m });
            }
        }

        try {
            const used = process.memoryUsage();
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const usedMem = totalMem - freeMem;
            const usedPercent = (usedMem / totalMem * 100).toFixed(2);
            const latensi = (speed() - speed()).toFixed(4);

            const responseMessage = `
💾 *Statistik Penggunaan RAM*

📊 *RAM Sistem*
- *Total*: ${formatBytes(totalMem)}
- *Digunakan*: ${formatBytes(usedMem)} (${usedPercent}%)
- *Tersedia*: ${formatBytes(freeMem)}

🧠 *Penggunaan Memori Node.js*
${Object.keys(used).map(key => `- *${key.padEnd(8)}:* ${formatBytes(used[key])}`).join('\n')}

⏱️ *Latensi*: ${latensi} detik
            `.trim();

            const chartConfig = {
                type: 'outlabeledPie',
                data: {
                    labels: [`Digunakan (${formatBytes(usedMem)})`, `Tersedia (${formatBytes(freeMem)})`],
                    datasets: [{
                        backgroundColor: ['#FF3784', '#36A2EB'],
                        data: [usedMem, freeMem]
                    }]
                },
                options: {
                    plugins: {
                        legend: false,
                        outlabels: {
                            text: '%l %p',
                            color: 'white',
                            stretch: 35,
                            font: { resizable: true, minSize: 12, maxSize: 18 }
                        }
                    },
                    title: { display: true, text: '\n\n\n\n\n\n\n\n\n\n\n\nPenggunaan RAM' }
                }
            };

            const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig));
            const chartUrl = `https://quickchart.io/chart?c=${encodedConfig}&w=700&h=500`;

            await naze.sendMessage(m.chat, {
                text: responseMessage,
                contextInfo: {
                    externalAdReply: {
                        title: '💾 Cek RAM',
                        body: 'Statistik Penggunaan Memori Server',
                        thumbnailUrl: chartUrl,
                        sourceUrl: chartUrl,
                        mediaType: 1,
                        previewType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: m });
        } catch (err) {
            await global.handleError(naze, m, err, {
                sendRawError: true,
                useGemini: true
            });
        }
    }
};