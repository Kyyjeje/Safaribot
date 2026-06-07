const { updateSettingsPrefixes } = require('../../src/settingsUtils.js');
require('../../settings');

module.exports = {
    name: 'delprefix',
    alias: ['removeprefix'],
    description: '<prefix>',
    run: async ({ naze, m }) => {
        try {
            
            const body = m.type === 'conversation' ? m.message.conversation :
                         m.type === 'imageMessage' ? m.message.imageMessage.caption :
                         m.type === 'videoMessage' ? m.message.videoMessage.caption :
                         m.type === 'extendedTextMessage' ? m.message.extendedTextMessage.text :
                         m.type === 'buttonsResponseMessage' ? m.message.buttonsResponseMessage.selectedButtonId :
                         m.type === 'listResponseMessage' ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                         m.type === 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage.selectedId :
                         m.type === 'messageContextInfo' ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) :
                         m.type === 'editedMessage' ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage?.text || m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
            const args = body.trim().split(/ +/).slice(1);
            const text = args.join(' ').trim();
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <prefix>\`\n> Contoh: \`${m.prefix}${m.command} 😊\`\n> Untuk menghapus prefix` }, { quoted: m });
            }

            

            const prefixToDelete = text.trim();
            if (!global.prefixes.includes(prefixToDelete)) {
                
                return naze.sendMessage(m.chat, { text: `❌ Prefix "${prefixToDelete}" tidak ditemukan!` }, { quoted: m });
            }

            if (global.prefixes.length <= 1) {
                
                return naze.sendMessage(m.chat, { text: `❌ Tidak dapat menghapus prefix! Minimal harus ada 1 prefix yang tersisa.` }, { quoted: m });
            }

            const updatedPrefixes = global.prefixes.filter(p => p !== prefixToDelete);
            updateSettingsPrefixes(updatedPrefixes);
            
            await naze.sendMessage(m.chat, { text: `✅ Prefix "${prefixToDelete}" berhasil dihapus!` }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};