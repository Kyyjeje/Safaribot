const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
require('../../settings');

const dataFilePath = path.join(__dirname, '../../database/topcmd.js');

module.exports = {
    name: 'resettopcommand',
    alias: ['resettopcmd'],
    description: '',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            

            const fileContent = `module.exports = {};`;
            fs.writeFileSync(dataFilePath, fileContent);

            const resetTime = moment().tz('Asia/Jakarta').format('dddd, D MMMM YYYY HH:mm:ss');
            const result = `✅ *TOP COMMAND RESET* ✅\n\nData penggunaan fitur telah direset pada:\n${resetTime} WIB`;
            
            await naze.sendMessage(m.chat, { text: result }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};