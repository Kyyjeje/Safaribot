const { globalSettings } = require('../../settings');
const axios = require('axios');

module.exports = {
    name: 'npmjs',
    alias: ['npm'],
    description: '<name package>',
    run: async ({ naze, m }) => {
        try {
            

            const body = m.type === 'conversation' ? m.message.conversation :
                         m.type === 'imageMessage' ? m.message.imageMessage.caption || '' :
                         m.type === 'videoMessage' ? m.message.videoMessage.caption || '' :
                         m.type === 'extendedTextMessage' ? m.message.extendedTextMessage.text || '' :
                         m.type === 'buttonsResponseMessage' ? m.message.buttonsResponseMessage.selectedButtonId || '' :
                         m.type === 'listResponseMessage' ? m.message.listResponseMessage.singleSelectReply.selectedRowId || '' :
                         m.type === 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId || '' :
                         m.type === 'messageContextInfo' ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) || '' :
                         m.type === 'editedMessage' ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage?.text || m.message.editedMessage.message.protocolMessage.editedMessage.conversation) || '' : '';

            const args = body.trim().split(/ +/).slice(1);
            const text = args.join(' ');

            if (!text) {
                
                return m.reply('Example: .npm axios');
            }

            const res = await axios.get(`http://registry.npmjs.com/-/v1/search?text=${text}`);
            const { objects } = res.data;

            if (!objects.length) {
                
                return m.reply('Pencarian Tidak Ditemukan');
            }

            const txt = objects.map(({ package: pkg }) => {
                return `*${pkg.name}* (v${pkg.version})\n_${pkg.links.npm}_\n_${pkg.description}_`;
            }).join`\n\n`;

            await m.reply(txt);
            
        } catch (err) {
            
            await global.handleError(naze, m, err, {
                sendRawError: true,
                useGemini: true
            });
        }
    }
};