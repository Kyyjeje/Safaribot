require('../../settings');

function formatFeatureName(key) {
    return key.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    return `${seconds} detik`;
}

module.exports = {
    name: 'botsetting',
    alias: ['botsettings', 'setbot', 'botset'],
    run: async ({ naze, m }) => {
        const botNumber = await naze.decodeJid(naze.user.id);
        const botSettings = global.db.set[botNumber] || {};

        if (!botSettings) {
            return naze.sendMessage(m.chat, { text: '⚠️ Data pengaturan bot tidak ditemukan.' }, { quoted: m });
        }

        const hiddenFeatures = ['lang', 'track'];

        let statusBot = `🤖 *Pengaturan Bot:*\n\n`;

        for (const [key, value] of Object.entries(botSettings)) {
            if (hiddenFeatures.includes(key)) continue;

            const formattedKey = formatFeatureName(key);

            if (typeof value === 'boolean') {
                statusBot += `- 📵 ${formattedKey} : ${value ? '✅ Aktif' : '❌ Nonaktif'}\n`;
            } else if (typeof value === 'number') {
                statusBot += `- 📅 ${formattedKey} : ${formatTimestamp(value)}\n`;
            } else if (typeof value === 'object' && value !== null) {
                statusBot += `🔧 *${formattedKey}:*\n`;
                for (const [subKey, subValue] of Object.entries(value)) {
                    const formattedSubKey = formatFeatureName(subKey);
                    if (subKey === 'durasi') {
                        statusBot += `  - 🔘 ${formattedSubKey} : ${formatDuration(subValue)}\n`;
                    } else if (typeof subValue === 'boolean') {
                        statusBot += `  - 🔘 ${formattedSubKey} : ${subValue ? '✅ Aktif' : '❌ Nonaktif'}\n`;
                    }
                }
            }
        }

        const usageInfo = `📋 *Cara Mengatur Fitur Button:*\n` +
            `Gunakan perintah berikut untuk mengaktifkan atau menonaktifkan fitur button:\n` +
            `- \`${m.prefix}setbutton <nama fitur> true/false\`\n` +
            `> Contoh:\n` +
            `> \`${m.prefix}setbutton menu true\` (aktif)\n` +
            `> \`${m.prefix}setbutton menu false\` (non-aktif)\n` +
            `> \`${m.prefix}setbutton all true\` (semua aktif)\n` +
            `> \`${m.prefix}setbutton all false\` (semua non-aktif)\n`;

        statusBot += `\n${usageInfo}`;

        await naze.sendMessage(m.chat, { text: statusBot }, { quoted: m });
    }
};