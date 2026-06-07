require('../../settings');
const axios = require('axios');

function extractText(m) {
    if (!m || !m.message) return '';
    if (m.type === 'conversation') return m.message.conversation || '';
    if (m.type === 'imageMessage') return m.message.imageMessage?.caption || '';
    if (m.type === 'videoMessage') return m.message.videoMessage?.caption || '';
    if (m.type === 'extendedTextMessage') return m.message.extendedTextMessage?.text || '';
    if (m.type === 'buttonsResponseMessage') return m.message.buttonsResponseMessage?.selectedButtonId || '';
    if (m.type === 'listResponseMessage') return m.message.listResponseMessage?.singleSelectReply?.selectedRowId || '';
    if (m.type === 'templateButtonReplyMessage') return m.message.templateButtonReplyMessage?.selectedId || '';
    if (m.type === 'interactiveResponseMessage') {
        const params = m.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
        return params ? JSON.parse(params).id || '' : '';
    }
    if (m.type === 'editedMessage') {
        const edited = m.message.editedMessage?.message?.protocolMessage?.editedMessage;
        return edited?.extendedTextMessage?.text || edited?.conversation || '';
    }
    return m.text || '';
}

module.exports = {
    name: 'inspect',
    alias: ['cekgrup'],
    description: '<url grup>',
    run: async ({ naze, m }) => {
        try {
            

            const text = extractText(m).trim().split(/ +/).slice(1).join(' ');
            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `Masukkan link grup WhatsApp!\nContoh: ${m.prefix}${m.command} https://chat.whatsapp.com/abc123` }, { quoted: m });
            }

            const code = text.match(/chat.whatsapp.com\/([\w\d]*)/);
            if (!code) {
                
                return naze.sendMessage(m.chat, { text: `Link tidak valid!\nContoh: ${m.prefix}${m.command} https://chat.whatsapp.com/abc123` }, { quoted: m });
            }

            const inviteCode = code[1];
            const anu = await naze.groupGetInviteInfo(inviteCode);
            const { id, subject, owner, subjectOwner, creation, desc, descId, participants, size, descOwner } = anu;
            const ownerTag = owner ? `@${owner.split('@')[0]}` : '-';
            const subOwnerTag = subjectOwner ? `@${subjectOwner.split('@')[0]}` : '-';
            const adminCount = participants.filter(p => p.admin).length;
            const memberCount = size - adminCount;
            const privacyStatus = anu.announce ? '🔒 Pribadi (Hanya Admin)' : '🌍 Publik (Bebas Kirim Pesan)';

            let ppUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60';
            try {
                ppUrl = await naze.profilePictureUrl(id, 'image');
            } catch {}

            const caption = `📌 *Informasi Grup WhatsApp*\n\n` +
                           `📛 *Nama Grup*: ${subject}\n` +
                           `🆔 *ID Grup*: ${id}\n` +
                           `👤 *Creator*: ${ownerTag}\n` +
                           `👥 *Jumlah Member*: ${size}\n` +
                           `👑 *Jumlah Admin*: ${adminCount}\n` +
                           `👨‍👩‍👧 *Jumlah Member Biasa*: ${memberCount}\n` +
                           `📅 *Dibuat Pada*: ${new Date(creation * 1000).toLocaleString()}\n` +
                           `🔑 *Privasi Grup*: ${privacyStatus}\n` +
                           `📜 *Deskripsi ID*: ${descId ? descId : '-'}\n` +
                           `✏️ *Nama Grup Diubah Oleh*: ${subOwnerTag}\n` +
                           `📌 ${descOwner ? `*Deskripsi diubah oleh*: @${descOwner.split('@')[0]}` : '*Deskripsi diubah oleh*: -'}\n\n` +
                           `📝 *Deskripsi Grup*:\n${desc ? desc : '-'}\n\n` +
                           `🔗 *Link Undangan*: https://chat.whatsapp.com/${inviteCode}\n\n` +
                           `💬 *Gunakan dengan bijak dan patuhi aturan grup!*`;

            
            await naze.sendMessage(m.chat, {
                image: { url: ppUrl },
                caption,
                mentions: [owner, subjectOwner, descOwner].filter(Boolean)
            }, { quoted: m });
        } catch (err) {
            console.error(`Gagal mengambil data grup: ${err.message}`);
            
            if (err?.data == 406) {
                return naze.sendMessage(m.chat, { text: 'Grup tidak ditemukan!' }, { quoted: m });
            }
            if (err?.data == 410) {
                return naze.sendMessage(m.chat, { text: 'Link grup telah direset!' }, { quoted: m });
            }
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};