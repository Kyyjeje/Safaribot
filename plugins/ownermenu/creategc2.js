require('../../settings');

module.exports = {
    name: 'creategc2',
    alias: ['creategc2'],
    description: '<jumlah>,<nama>',
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
            const text = args.join(' ');
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            if (!text) {
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <jumlah>,<nama>\`\n> Contoh: \`${m.prefix}${m.command} 5,MyGroup\`\n> Untuk membuat grup baru sebanyak jumlah yang ditentukan` }, { quoted: m });
            }

            const parts = text.split(',');
            const jumlah = parseInt(parts[0]?.trim());
            const nama = parts.slice(1).join(',').trim();

            if (isNaN(jumlah) || jumlah <= 0 || !nama) {
                return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan: \`${m.prefix}${m.command} <jumlah>,<nama>\`\n> Jumlah harus angka positif, nama tidak boleh kosong.` }, { quoted: m });
            }

            const links = [];
            let errorOccurred = false;
            let errorMessage = '';

            for (let i = 1; i <= jumlah; i++) {
                try {
                    const group = await naze.groupCreate(nama, []);
                    const res = await naze.groupInviteCode(group.id);
                    links.push(`- Grup ${i}: https://chat.whatsapp.com/${res}`);
                    if (i < jumlah) {
                        await new Promise(resolve => setTimeout(resolve, 3000)); // Delay 3 detik
                    }
                } catch (err) {
                    errorOccurred = true;
                    errorMessage = `Terhenti di grup ke-${i}: ${err.message || 'Error tidak diketahui'}`;
                    break;
                }
            }

            if (errorOccurred) {
                return naze.sendMessage(m.chat, { text: `*Gagal membuat semua grup!*\n${errorMessage}\n\nGrup yang berhasil dibuat (${links.length}):\n${links.join('\n') || 'Tidak ada'}` }, { quoted: m });
            }

            await naze.sendMessage(m.chat, {
                text: `*Berhasil membuat ${jumlah} grup!*\n\n${links.join('\n')}`
            }, { quoted: m });

        } catch (err) {
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};