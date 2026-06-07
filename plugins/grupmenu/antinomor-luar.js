require('../../settings');

module.exports = {
    name: 'antinomor-luar',
    alias: ['.antinomor-luar'],
    run: async ({ naze, m }) => {
        try {
            let body = '';
            if (m.type === 'conversation') {
                body = m.message.conversation;
            } else if (m.type === 'imageMessage') {
                body = m.message.imageMessage.caption;
            } else if (m.type === 'videoMessage') {
                body = m.message.videoMessage.caption;
            } else if (m.type === 'extendedTextMessage') {
                body = m.message.extendedTextMessage.text;
            } else if (m.type === 'buttonsResponseMessage') {
                body = m.message.buttonsResponseMessage.selectedButtonId || '';
            } else if (m.type === 'listResponseMessage') {
                body = m.message.listResponseMessage.singleSelectReply.selectedRowId || '';
            } else if (m.type === 'templateButtonReplyMessage') {
                body = m.message.templateButtonReplyMessage.selectedId || '';
            } else if (m.type === 'interactiveResponseMessage') {
                const nativeFlowResponse = m.message.interactiveResponseMessage?.nativeFlowResponseMessage;
                if (nativeFlowResponse && nativeFlowResponse.paramsJson) {
                    const params = JSON.parse(nativeFlowResponse.paramsJson);
                    body = params.id || '';
                }
            } else if (m.type === 'messageContextInfo') {
                body = (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) || '';
            } else if (m.type === 'editedMessage') {
                body = (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage ? m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage.text : m.message.editedMessage.message.protocolMessage.editedMessage.conversation) || '';
            }

            const args = body.trim().split(/ +/).slice(1);
            const action = args[0]?.toLowerCase();
            const exceptions = args[1]
                ? args[1].split(',')
                    .map(code => code.replace(/\s+/g, '')) // Hapus semua spasi
                    .filter(code => code && code.startsWith('+') && /^\d+$/.test(code.replace(/^\+/, '')))
                    .map(code => code.replace(/^\+/, ''))
                : [];

            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
            if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
            if (!m.isBotAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

            if (!global.db) global.db = {};
            if (!global.db.groups) global.db.groups = {};
            if (!global.db.groups[m.chat]) global.db.groups[m.chat] = {};

            if (action === 'true') {
                if (!exceptions.length) {
                    return m.reply('*Format salah!*\nGunakan:\n`.antinomor-luar true <kode telepon pengecualian>`\nContoh:\n`.antinomor-luar true +62,+61`\n\nUntuk menonaktifkan:\n`.antinomor-luar false`\n\n+62 WAJIB DIMASUKKAN DALAM PENGECUALIAN!!!');
                }

                global.db.groups[m.chat].antiNomorLuar = {
                    active: true,
                    exceptions: exceptions
                };

                await m.reply(`*Fitur Anti Nomor Luar diaktifkan!*\nKode telepon yang dikecualikan: ${exceptions.map(code => `+${code}`).join(', ')}`);

                const foreignNumbers = m.metadata.participants
                    .filter(p => !exceptions.some(code => p.jid.split('@')[0].startsWith(code)))
                    .filter(p => !p.admin)
                    .map(p => p.jid);

                if (foreignNumbers.length > 0) {
                    let teks = `*Terdeteksi ${foreignNumbers.length} nomor di luar kode telepon ${exceptions.map(code => `+${code}`).join(', ')}:*\n\n
╔═〇 *Deteksi Nomor Luar* 
╠═════════〇
`;
                    for (let num of foreignNumbers) {
                        teks += `- @${num.split('@')[0]}: ${num.split('@')[0]}\n`;
                    }
                    teks += `╚═════════════════〇\n*Sedang memproses pengeluaran member...*`;

                    await naze.sendMessage(m.chat, {
                        text: teks,
                        mentions: foreignNumbers
                    });

                    for (let num of foreignNumbers) {
                        await naze.groupParticipantsUpdate(m.chat, [num], 'remove').catch(() => {});
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }

                    await naze.sendMessage(m.chat, {
                        text: `*Semua member dengan nomor luar telah dikeluarkan dari grup!*`
                    });
                } else {
                    await naze.sendMessage(m.chat, {
                        text: `*Tidak ada nomor luar yang terdeteksi di grup.*`
                    });
                }
            } else if (action === 'false') {
                if (!global.db.groups[m.chat].antiNomorLuar?.active) {
                    return m.reply('*Fitur Anti Nomor Luar sudah nonaktif sebelumnya!*');
                }

                global.db.groups[m.chat].antiNomorLuar = {
                    active: false,
                    exceptions: []
                };

                await m.reply('*Fitur Anti Nomor Luar dinonaktifkan!*');
            } else {
                return m.reply('*Format salah!*\nGunakan:\n`.antinomor-luar true <kode telepon pengecualian>`\nContoh:\n`.antinomor-luar true +62,+61`\n\nUntuk menonaktifkan:\n`.antinomor-luar false`\n\n+62 WAJIB DIMASUKKAN DALAM PENGECUALIAN!!!');
            }
        } catch (err) {
            await m.reply('Gagal memproses perintah.');
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};