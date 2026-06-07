require('../../settings');
const { generateWAMessageFromContent, proto } = require('baileys');
const path = require('path');
const { generateCustomKeyId } = require(path.join(__dirname, '../../src/idcustom'));

module.exports = {
    name: 'memberrequest',
    alias: ['memberrequests', 'accmember', 'acceptmember'],
    run: async ({ naze, m }) => {
        

        if (!m.isGroup) return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        if (!m.isAdmin) return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
        if (!m.isBotAdmin) return  global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);

        try {
            let response = await naze.groupRequestParticipantsList(m.chat);

            if (!response || response.length === 0) {
                
                return naze.sendMessage(m.chat, { text: `Tidak ada permintaan bergabung saat ini.\nContoh: ${m.prefix}${m.command}` }, { quoted: m });
            }

            const requestList = {
                title: "📋 Daftar Permintaan Bergabung",
                highlight_label: `Total: ${response.length} permintaan`,
                sections: [
                    {
                        title: "⚙️ Aksi untuk Semua",
                        highlight_label: "Disarankan",
                        rows: [
                            {
                                title: '✅ Terima Semua',
                                description: 'Menerima semua permintaan bergabung',
                                id: '.accall'
                            },
                            {
                                title: '❌ Tolak Semua',
                                description: 'Menolak semua permintaan bergabung',
                                id: '.rejectall'
                            }
                        ]
                    },
                    ...response.map((req, index) => ({
                        title: `📞 ${req.jid.split('@')[0]}`,
                        highlight_label: `Permintaan ke-${index + 1}`,
                        rows: [
                            {
                                title: '✅ Terima',
                                description: `Terima ${req.jid.split('@')[0]} ke grup`,
                                id: `.accsingle ${req.jid}`
                            },
                            {
                                title: '❌ Tolak',
                                description: `Tolak ${req.jid.split('@')[0]} dari grup`,
                                id: `.rejectsingle ${req.jid}`
                            }
                        ]
                    }))
                ]
            };

            const customKeyId = generateCustomKeyId();
            let msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        interactiveMessage: proto.Message.InteractiveMessage.create({
                            contextInfo: {
                                mentionedJid: [m.sender],
                                forwardingScore: 999999,
                                isForwarded: true
                            },
                            body: proto.Message.InteractiveMessage.Body.create({
                                text: `📎 *Nama Group:* ${m.metadata.subject}\n\n📋 *Daftar Permintaan Bergabung*\nSilakan pilih aksi untuk setiap member atau lakukan aksi untuk semua!`
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.create({ text: `By bangsulstart` }),
                            header: proto.Message.InteractiveMessage.Header.create({
                                title: "",
                                subtitle: "",
                                hasMediaAttachment: false
                            }),
                            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                buttons: [{ name: "single_select", buttonParamsJson: JSON.stringify(requestList) }]
                            })
                        })
                    }
                }
            }, { quoted: m });

            msg.key.id = customKeyId;
            await naze.relayMessage(msg.key.remoteJid, msg.message, { messageId: customKeyId });
            
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};