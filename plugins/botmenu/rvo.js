require('../../settings');
const { downloadContentFromMessage } = require('baileys');

module.exports = {
    name: 'read',
    alias: ['readviewonce', 'readviewone', 'rvo'],
    description: '<reply view once>',
    run: async ({ naze, m, args }) => {
        try {
            
            if (!m.quoted) throw new Error(`Anda salah memasukkan format!Silahkan reply View Once lalu gunakan perintah:\n\n${m.prefix}${m.command}`);
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
            let msg = m.quoted;
            let type = Object.keys(msg.message)[0];
            if (type.endsWith('Message') && msg.message[type].viewOnce) {
                let stream = await downloadContentFromMessage(msg.message[type], type.replace('Message', ''));
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                let mimetype = msg.message[type].mimetype;
                let caption = msg.message[type].caption || '';
                await naze.sendMessage(m.chat, {
                    [mimetype.startsWith('image') ? 'image' : 'video']: buffer,
                    mimetype,
                    caption
                }, { quoted: m });
            } else {
                throw new Error(`Anda salah memasukkan format!Silahkan reply View Once lalu gunakan perintah:\n\n${m.prefix}${m.command}`);
            }
            
        } catch (e) {
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};