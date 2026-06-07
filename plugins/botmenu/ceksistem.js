const os = require('os');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const { globalSettings } = require('../../settings');

module.exports = {
    name: 'ceksistem',
    alias: ['checkos'],
    run: async ({ naze, m }) => {
        try {
            const platform = os.platform();
            const osType = os.type();
            const osRelease = os.release();
            const hostname = os.hostname();
            const arch = os.arch();

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

            const cpuCores = os.cpus();
            const coreInfo = cpuCores.map((core, index) => `- *Core ${index + 1}*: ${core.model} @ ${(core.speed / 1000).toFixed(2)} GHz`).join('\n');

            const systemInfo = `
📋 *Informasi Sistem Bot*

📟 *Platform*: ${platform}
📊 *Tipe OS*: ${osType}
🔢 *Versi OS*: ${osRelease}
🖥️ *Hostname*: ${hostname}
⚙️ *Arsitektur*: ${arch}

📡 *Informasi CPU*
${coreInfo}

📡 *Informasi Koneksi WhatsApp*
📞 *Nomor Bot*: ${botNumber}
👤 *Nama Bot*: ${botName}
🌐 *Status Koneksi*: ${isConnected ? 'Terhubung ✅' : 'Tidak Terhubung ❌'}
🔗 *Metode Pairing Terakhir*: ${pairingInfo.pairingMethod || 'Belum ada data'}
⏰ *Waktu Pairing Terakhir*: ${lastPairingTime}
            `.trim();

            await naze.sendMessage(m.chat, { text: systemInfo }, { quoted: m });
        } catch (err) {
            await global.handleError(naze, m, err, {
                sendRawError: true,
                useGemini: true
            });
        }
    }
};