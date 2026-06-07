const os = require('os');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const speed = require('performance-now');
const QuickChart = require('quickchart-js');
const { execSync } = require('child_process');

const runtime = function (seconds) {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    const dDisplay = d > 0 ? `${d} hari, ` : '';
    const hDisplay = h > 0 ? `${h} jam, ` : '';
    const mDisplay = m > 0 ? `${m} menit, ` : '';
    const sDisplay = s > 0 ? `${s} detik` : '';
    return dDisplay + hDisplay + mDisplay + sDisplay;
};

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    else if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    else return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function getSystemInfo() {
    let systemInfo = {};
    try {
        systemInfo.os = execSync('lsb_release -a 2>/dev/null || cat /etc/os-release', { encoding: 'utf-8' })
            .split('\n')
            .filter(line => line.includes('PRETTY_NAME') || line.includes('Description'))
            .map(line => line.split(':')[1]?.trim() || 'Unknown')
            .join('') || 'Unknown';
        systemInfo.hostname = os.hostname();
        systemInfo.kernel = execSync('uname -r', { encoding: 'utf-8' }).trim();
        systemInfo.uptime = runtime(os.uptime());
        systemInfo.packages = execSync('dpkg -l 2>/dev/null | wc -l', { encoding: 'utf-8' }).trim() + ' (dpkg)';
    } catch {
        systemInfo.packages = 'Unknown';
    }
    systemInfo.shell = process.env.SHELL?.split('/').pop() || 'Unknown';
    systemInfo.resolution = 'Unknown';
    systemInfo.terminal = process.env.TERM || 'Unknown';
    const cpuInfo = os.cpus();
    systemInfo.cpu = `${cpuInfo[0].model} (${cpuInfo.length} Core) @ ${(cpuInfo[0].speed / 1000).toFixed(2)}GHz`;
    systemInfo.cpuDetails = cpuInfo.map((cpu, index) => {
        const total = Object.values(cpu.times).reduce((sum, val) => sum + val, 0);
        return `Core ${index + 1}: ${cpu.model} @ ${(cpu.speed / 1000).toFixed(2)}GHz\n` +
               Object.keys(cpu.times).map(type => `  ${(type + ':').padEnd(8)} ${(100 * cpu.times[type] / total).toFixed(2)}%`).join('\n');
    }).join('\n');
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    systemInfo.memory = `${formatBytes(totalMem - freeMem)} / ${formatBytes(totalMem)}`;
    const diskInfo = execSync('df -h / | tail -1', { encoding: 'utf-8' }).trim().split(/\s+/);
    systemInfo.disk = `${diskInfo[2]} / ${diskInfo[1]} (Tersedia: ${diskInfo[3]})`;
    return systemInfo;
}

module.exports = {
    name: 'static',
    alias: ['statistik', 'botstatus', 'statusbot', 'ceksistem', 'cekos', 'os', 'checkos'],
    run: async ({ naze, m }) => {
        try {
            
            const systemInfo = getSystemInfo();
            const timestamp = speed();
            const latensi = speed() - timestamp;
            const neww = performance.now();
            const oldd = performance.now();
            const modifiedUptime = process.uptime();
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
            const used = process.memoryUsage();
            const cpus = os.cpus();
            const totalMem = os.totalmem();
            const isConnected = !!naze.user;
            const botNumber = isConnected ? naze.user.id.split(':')[0] + '@s.whatsapp.net' : 'Tidak terhubung';
            const botName = isConnected ? naze.user.name || 'Tidak diketahui' : 'Tidak terhubung';
            const pairingInfoPath = path.join(__dirname, '../database/pairing_info.json');
            let pairingInfo = { lastPairingTime: null, pairingMethod: null };
            if (fs.existsSync(pairingInfoPath)) {
                pairingInfo = JSON.parse(fs.readFileSync(pairingInfoPath, 'utf-8'));
            }
            const lastPairingTime = pairingInfo.lastPairingTime
                ? moment(pairingInfo.lastPairingTime).tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss')
                : 'Belum ada data pairing';
            const responseMessage = `
📊 *STATISTIK SERVER BOT* 📊
━━━━━━━━━━━━━━━━━━━━━━━

🌐 *INFORMASI SISTEM (VPS)*
━━━━━━━━━━━━━━━━━━━━━━━
📟 *OS*: ${systemInfo.os}
🖥️ *Hostname*: ${systemInfo.hostname}
🔢 *Kernel*: ${systemInfo.kernel}
⏳ *Uptime Sistem*: ${systemInfo.uptime}
📦 *Packages*: ${systemInfo.packages}
🐚 *Shell*: ${systemInfo.shell}
📺 *Terminal*: ${systemInfo.terminal}
🧠 *CPU*: ${systemInfo.cpu}
📈 *Detail Per Core*:\n${systemInfo.cpuDetails}
💾 *Memory*: ${systemInfo.memory}
💿 *Disk*: ${systemInfo.disk}

🚀 *PERFORMA BOT*
━━━━━━━━━━━━━━━━━━━━━━━
⚡ *Respon*: ${latensi.toFixed(4)} detik
📶 *Ping*: ${(oldd - neww).toFixed(4)} ms
🌍 *Status Koneksi*: ${latensi < 1 ? 'Stabil ✅' : 'Tidak Stabil ❌'}
⏰ *Waktu Aktif Bot*: ${runtime(modifiedUptime)}

💡 *STATISTIK MEMORI*
━━━━━━━━━━━━━━━━━━━━━━━
💾 *Penggunaan RAM*
📊 *Total*: ${formatBytes(totalMem)}
🔋 *Digunakan*: ${formatBytes(totalMem - os.freemem())} (${((totalMem - os.freemem()) / totalMem * 100).toFixed(2)}%)

🧠 *Penggunaan Memori NodeJS*
${Object.keys(used).map(key => `*${key.padEnd(8)}:* ${formatBytes(used[key])}`).join('\n')}

📡 *INFORMASI KONEKSI WHATSAPP*
━━━━━━━━━━━━━━━━━━━━━━━
📞 *Nomor Bot*: ${botNumber}
👤 *Nama Bot*: ${botName}
🌐 *Status Koneksi*: ${isConnected ? 'Terhubung ✅' : 'Tidak Terhubung ❌'}
━━━━━━━━━━━━━━━━━━━━━━━
> Bot kamu berjalan dengan spesifikasi ini! 🚀
`;
            await naze.sendMessage(m.chat, {
                text: responseMessage,
                contextInfo: {
                    forwardingScore: 10,
                    isForwarded: true,
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
            
        } catch (e) {
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};