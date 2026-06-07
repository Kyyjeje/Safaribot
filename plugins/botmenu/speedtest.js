require('../../settings');
const { exec } = require('child_process');
const util = require('util');

module.exports = {
    name: 'speedtest',
    alias: ['speed','tesspeed'],
    run: async ({ naze, m }) => {
         await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
        let execPromise = util.promisify(exec);
        try {
            let { stdout, stderr } = await execPromise('python3 ./speed.py');
            if (stdout.trim()) m.reply(stdout);
            if (stderr.trim()) m.reply(stderr);
        } catch (e) {
            
            if (e.message.toLowerCase().includes('forbidden')) {
                await m.reply('⚠️ Speedtest diblokir (Forbidden). Silakan coba lagi nanti atau hubungi owner.');
            }
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};
