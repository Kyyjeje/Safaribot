require('../../settings');
const { updateSettingsPrefixes } = require('../../src/settingsUtils.js');

module.exports = {
    name: 'setprefix',
    alias: ['addprefix'],
    description: '<prefix>',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            

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

            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <prefix>\`\n> Contoh: \`${m.prefix}${m.command} !\`` }, { quoted: m });
            }

            const newPrefix = text.trim();
            const prefixLength = Array.from(newPrefix).length;

            if (prefixLength > 2) {
                
                return naze.sendMessage(m.chat, { text: '⚠️ Prefix tidak boleh lebih dari 2 karakter (termasuk emoji)!' }, { quoted: m });
            }

            if (global.prefixes.includes(newPrefix)) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Prefix "${newPrefix}" sudah ada!` }, { quoted: m });
            }

            const updatedPrefixes = [...global.prefixes, newPrefix];
            updateSettingsPrefixes(updatedPrefixes);

            
            await naze.sendMessage(m.chat, { text: `✅ Prefix "${newPrefix}" berhasil ditambahkan!\nSekarang kamu bisa menggunakan perintah dengan prefix ini.` }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};