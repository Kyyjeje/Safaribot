const { globalSettings } = require('../../settings');
const speed = require('performance-now');
const QuickChart = require('quickchart-js');

const runtime = function (seconds) {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    const dDisplay = d > 0 ? d + ' hari, ' : '';
    const hDisplay = h > 0 ? h + ' jam, ' : '';
    const mDisplay = m > 0 ? m + ' menit, ' : '';
    const sDisplay = s > 0 ? s + ' detik' : '';
    return dDisplay + hDisplay + mDisplay + sDisplay;
};

module.exports = {
    name: 'ping',
    alias: ['botstatus', 'statusbot'],
    run: async ({ naze, m }) => {
        try {
            

            const timestamp = speed();
            const latensi = speed() - timestamp;
            const neww = performance.now();
            const oldd = performance.now();

            const maxLatency = 2.0;
            const minX = 0.0001;
            const maxX = 1;
            const xValue = minX * (1 + (Math.min(latensi, maxLatency) * 9999));

            const chart = new QuickChart();
            chart.setConfig({
                type: 'bar',
                data: {
                    labels: [''],
                    datasets: [
                        { label: 'Part 1', data: [0.0005], backgroundColor: 'rgb(44, 186, 0)' },
                        { label: 'Part 2', data: [0.0034], backgroundColor: 'rgb(163, 255, 0)' },
                        { label: 'Part 3', data: [0.0211], backgroundColor: 'rgb(255, 244, 0)' },
                        { label: 'Part 4', data: [0.1334], backgroundColor: 'rgb(255, 167, 0)' },
                        { label: 'Part 5', data: [0.8415], backgroundColor: 'rgb(255, 0, 0)' }
                    ]
                },
                options: {
                    indexAxis: 'y',
                    layout: { padding: { top: 50, bottom: 50 } },
                    scales: {
                        x: {
                            type: 'logarithmic',
                            stacked: true,
                            min: 0.0001,
                            max: 1,
                            ticks: {
                                display: true,
                                stepSize: 0.0001,
                                callback: value => value.toFixed(4),
                                font: { size: 10 },
                                align: 'center'
                            },
                            grid: { drawBorder: true, display: false }
                        },
                        y: { display: false, stacked: true }
                    },
                    plugins: {
                        legend: { display: false },
                        annotation: {
                            clip: false,
                            annotations: {
                                arrow: {
                                    type: 'point',
                                    pointStyle: 'triangle',
                                    backgroundColor: '#000',
                                    radius: 10,
                                    xValue,
                                    yAdjust: -25.0,
                                    rotation: 180
                                },
                                label1: {
                                    type: 'label',
                                    xValue,
                                    yAdjust: -38,
                                    content: [`Respon: ${latensi.toFixed(4)}s`],
                                    font: { size: 12, weight: 'bold' }
                                },
                                verticalLine: {
                                    type: 'line',
                                    xMin: xValue,
                                    xMax: xValue,
                                    borderColor: '#000',
                                    borderWidth: 1,
                                    borderDash: [4, 4]
                                }
                            }
                        }
                    }
                }
            });

            chart.setWidth(500);
            chart.setHeight(300);
            chart.setVersion('3');
            chart.setBackgroundColor('transparent');
            chart.setFormat('png');

            const thumbnailUrl = chart.getUrl() || global.getRandomThumbnailUrl();
            const modifiedUptime = process.uptime();

            const responseMessage = `
🚀 *Respon    :* ${latensi.toFixed(4)} detik
📶 *Ping          :* ${(oldd - neww).toFixed(4)} milidetik
🌐 *Status Koneksi :* ${latensi < 1 ? 'Stabil' : 'Tidak Stabil'}\n
⏳ *Waktu Aktif :*\n         ${runtime(modifiedUptime)}`;

            await naze.sendMessage(m.chat, {
                text: responseMessage,
                contextInfo: {
                    externalAdReply: {
                        title: '🏓 Status Bot Online',
                        body: `Uptime: ${runtime(modifiedUptime)}`,
                        thumbnailUrl,
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