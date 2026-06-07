require('../../settings');
const os = require('os');
const runtime = function (seconds) {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor(seconds % (3600 * 24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 60);
    const dDisplay = d > 0 ? d + " hari, " : "";
    const hDisplay = h > 0 ? h + " jam, " : "";
    const mDisplay = m > 0 ? m + " menit, " : "";
    const sDisplay = s > 0 ? s + " detik" : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
};

module.exports = {
    name: 'runtime',
    alias: ['rt', 'tes'],
    run: async ({ naze, m }) => {
        try {
            
            const userCount = Object.keys(global.db.users).length || 0;
            const modifiedBotUptime = process.uptime();
            const serverUptime = os.uptime();
            const responseMessage = `\`[${global.botname}]\`\n\n` +
                                  `⏳ *Durasi Aktif Bot:*\n> ${runtime(modifiedBotUptime)}\n\n` +
                                  `🖥️ *Durasi Aktif Server:*\n> ${runtime(serverUptime)}\n\n` +
                                  `🧑‍ *Pengguna:* \n> ${userCount} user 👥 `;
            await naze.sendMessage(m.chat, { text: responseMessage }, { quoted: m });
            
        } catch (e) {
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};