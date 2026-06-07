const fs = require('fs').promises;
const path = require('path');
const speed = require('performance-now');
const { v4: uuidv4 } = require('uuid');
require('../../settings');

const broadcastFilePath = path.join(__dirname, '../../database/broadcast.json');
const broadcastMessagesFilePath = path.join(__dirname, '../../database/broadcast_messages.json');

const readBroadcastList = async () => {
    try {
        const data = await fs.readFile(broadcastFilePath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return { groups: [], users: [] };
    }
};

const saveBroadcastList = async (data) => {
    await fs.writeFile(broadcastFilePath, JSON.stringify(data, null, 2));
};

const readBroadcastMessages = async () => {
    try {
        const data = await fs.readFile(broadcastMessagesFilePath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
};

const saveBroadcastMessages = async (data) => {
    await fs.writeFile(broadcastMessagesFilePath, JSON.stringify(data, null, 2));
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    name: 'broadcast',
    alias: ['addbroadcast', 'listbroadcast', 'broadcast', 'delbroadcast'],
    //description: 'addbroadcast <ID grup/nomor> | listbroadcast | broadcast <pesan/reply> | delbroadcast <ID grup/nomor>',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            

            const command = m.command.toLowerCase();
            let broadcastList = await readBroadcastList();
            let responseMessage = '';
            const timestamp = speed();

            if (command === 'addbroadcast') {
                const target = m.text.split(' ').slice(1).join(' ').trim();
                if (!target) {
                    
                    return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <ID grup/nomor>\`\n> Contoh: \`${m.prefix}${m.command} 123456789@g.us\`\n> atau \`${m.prefix}${m.command} 6281234567890\`\n> Untuk menambahkan grup/pengguna ke daftar broadcast` }, { quoted: m });
                }
                if (target.includes('@g.us')) {
                    try {
                        const groupMetadata = await naze.groupMetadata(target);
                        const botId = naze.user.id.split(':')[0] + '@s.whatsapp.net';
                        const isBotInGroup = groupMetadata.participants.some(p => p.id === botId);
                        if (!isBotInGroup) {
                            
                            return naze.sendMessage(m.chat, { text: '❌ Bot tidak ada di grup tersebut!' }, { quoted: m });
                        }
                        if (!broadcastList.groups.includes(target)) {
                            broadcastList.groups.push(target);
                            await saveBroadcastList(broadcastList);
                            
                            await naze.sendMessage(m.chat, { text: `✅ Berhasil menambahkan grup ${target} ke daftar broadcast!` }, { quoted: m });
                        } else {
                            
                            return naze.sendMessage(m.chat, { text: '❌ Grup sudah ada di daftar broadcast!' }, { quoted: m });
                        }
                    } catch (e) {
                        
                        return naze.sendMessage(m.chat, { text: '❌ Gagal memverifikasi grup. Pastikan ID grup valid!' }, { quoted: m });
                    }
                } else {
                    const userId = target.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                    if (!broadcastList.users.includes(userId)) {
                        broadcastList.users.push(userId);
                        await saveBroadcastList(broadcastList);
                        
                        await naze.sendMessage(m.chat, { text: `✅ Berhasil menambahkan pengguna ${userId} ke daftar broadcast!` }, { quoted: m });
                    } else {
                        
                        return naze.sendMessage(m.chat, { text: '❌ Pengguna sudah ada di daftar broadcast!' }, { quoted: m });
                    }
                }
            } else if (command === 'listbroadcast') {
                const validGroups = [];
                for (const groupId of broadcastList.groups) {
                    try {
                        const groupMetadata = await naze.groupMetadata(groupId);
                        const botId = naze.user.id.split(':')[0] + '@s.whatsapp.net';
                        if (groupMetadata.participants.some(p => p.id === botId)) {
                            validGroups.push({ id: groupId, name: groupMetadata.subject });
                        }
                    } catch (e) {}
                }
                broadcastList.groups = validGroups.map(g => g.id);
                await saveBroadcastList(broadcastList);

                responseMessage = '📋 *Daftar Broadcast*\n\n';
                if (validGroups.length === 0 && broadcastList.users.length === 0) {
                    responseMessage += 'Tidak ada grup atau pengguna di daftar broadcast.';
                } else {
                    if (validGroups.length > 0) {
                        responseMessage += '📢 *Grup*:\n';
                        validGroups.forEach((g, i) => {
                            responseMessage += `${i + 1}. ${g.name} (${g.id})\n`;
                        });
                    }
                    if (broadcastList.users.length > 0) {
                        responseMessage += '\n👤 *Pengguna*:\n';
                        broadcastList.users.forEach((u, i) => {
                            responseMessage += `${i + 1}. ${u}\n`;
                        });
                    }
                }
                
                await naze.sendMessage(m.chat, {
                    text: responseMessage,
                    contextInfo: {
                        externalAdReply: {
                            title: '📢 Broadcast System',
                            body: 'Manajemen dan Pengiriman Broadcast',
                            thumbnailUrl: global.getRandomThumbnail(),
                            mediaType: 1,
                            previewType: 1,
                            renderLargerThumbnail: false
                        }
                    }
                }, { quoted: m });
            } else if (command === 'broadcast') {
                const messageContent = m.text.split(' ').slice(1).join(' ').trim();
                if (!messageContent && !m.quoted) {
                    
                    return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <pesan>\`\n> Contoh: \`${m.prefix}${m.command} Halo semua\`\n> atau reply pesan untuk broadcast` }, { quoted: m });
                }
                const recipients = [...broadcastList.groups, ...broadcastList.users];
                if (recipients.length === 0) {
                    
                    return naze.sendMessage(m.chat, { text: '❌ Daftar broadcast kosong! Tambahkan grup/pengguna dengan *addbroadcast*.' }, { quoted: m });
                }

                const messageId = uuidv4();
                let broadcastMessages = await readBroadcastMessages();
                let messageToBroadcast = {};

                if (m.quoted) {
                    if (m.quoted.imageMessage) {
                        messageToBroadcast = {
                            imageMessage: {
                                ...m.quoted.imageMessage,
                                caption: messageContent || m.quoted.imageMessage.caption
                            }
                        };
                    } else if (m.quoted.videoMessage) {
                        messageToBroadcast = {
                            videoMessage: {
                                ...m.quoted.videoMessage,
                                caption: messageContent || m.quoted.videoMessage.caption
                            }
                        };
                    } else if (m.quoted.audioMessage) {
                        messageToBroadcast = {
                            audioMessage: {
                                ...m.quoted.audioMessage,
                                caption: messageContent
                            }
                        };
                    } else if (m.quoted.documentMessage) {
                        messageToBroadcast = {
                            documentMessage: {
                                ...m.quoted.documentMessage,
                                caption: messageContent
                            }
                        };
                    } else if (m.quoted.stickerMessage) {
                        messageToBroadcast = {
                            stickerMessage: { ...m.quoted.stickerMessage }
                        };
                    } else if (m.quoted.extendedTextMessage) {
                        messageToBroadcast = {
                            extendedTextMessage: {
                                ...m.quoted.extendedTextMessage,
                                text: messageContent || m.quoted.extendedTextMessage.text
                            }
                        };
                    } else {
                        messageToBroadcast = {
                            conversation: messageContent || m.quoted.text
                        };
                    }
                } else {
                    messageToBroadcast = {
                        conversation: messageContent
                    };
                }

                broadcastMessages[messageId] = messageToBroadcast;
                await saveBroadcastMessages(broadcastMessages);

                let successCount = 0;
                let failCount = 0;
                const failedRecipients = [];

                for (const recipient of recipients) {
                    try {
                        if (recipient.includes('@g.us')) {
                            const groupMetadata = await naze.groupMetadata(recipient);
                            const botId = naze.user.id.split(':')[0] + '@s.whatsapp.net';
                            if (!groupMetadata.participants.some(p => p.id === botId)) {
                                broadcastList.groups = broadcastList.groups.filter(id => id !== recipient);
                                await saveBroadcastList(broadcastList);
                                failedRecipients.push(`${recipient} (bot tidak ada di grup)`);
                                failCount++;
                                continue;
                            }
                        }
                        await naze.relayMessage(recipient, broadcastMessages[messageId], { quoted: null });
                        successCount++;
                    } catch (e) {
                        failedRecipients.push(recipient);
                        failCount++;
                    }
                    await delay(2000);
                }

                delete broadcastMessages[messageId];
                await saveBroadcastMessages(broadcastMessages);
                await saveBroadcastList(broadcastList);

                const latensi = speed() - timestamp;
                responseMessage = `📢 *Laporan Broadcast* 📢\n` +
                    `- *Total Penerima*: ${recipients.length}\n` +
                    `- *Berhasil*: ${successCount}\n` +
                    `- *Gagal*: ${failCount}\n` +
                    `${failCount > 0 ? `\n*Penerima Gagal*:\n${failedRecipients.join('\n')}` : ''}`;

                
                await naze.sendMessage(m.chat, {
                    text: responseMessage,
                    contextInfo: {
                        externalAdReply: {
                            title: '📢 Broadcast System',
                            body: 'Manajemen dan Pengiriman Broadcast',
                            thumbnailUrl: global.getRandomThumbnail(),
                            mediaType: 1,
                            previewType: 1,
                            renderLargerThumbnail: false
                        }
                    }
                }, { quoted: m });
            } else if (command === 'delbroadcast') {
                const target = m.text.split(' ').slice(1).join(' ').trim();
                if (!target) {
                    
                    return naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}${m.command} <ID grup/nomor>\`\n> Contoh: \`${m.prefix}${m.command} 123456789@g.us\`\n> atau \`${m.prefix}${m.command} 6281234567890\`\n> Untuk menghapus grup/pengguna dari daftar broadcast` }, { quoted: m });
                }
                if (target.includes('@g.us')) {
                    if (broadcastList.groups.includes(target)) {
                        broadcastList.groups = broadcastList.groups.filter(id => id !== target);
                        await saveBroadcastList(broadcastList);
                        
                        await naze.sendMessage(m.chat, { text: `✅ Berhasil menghapus grup ${target} dari daftar broadcast!` }, { quoted: m });
                    } else {
                        
                        return naze.sendMessage(m.chat, { text: '❌ Grup tidak ada di daftar broadcast!' }, { quoted: m });
                    }
                } else {
                    const userId = target.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                    if (broadcastList.users.includes(userId)) {
                        broadcastList.users = broadcastList.users.filter(id => id !== userId);
                        await saveBroadcastList(broadcastList);
                        
                        await naze.sendMessage(m.chat, { text: `✅ Berhasil menghapus pengguna ${userId} dari daftar broadcast!` }, { quoted: m });
                    } else {
                        
                        return naze.sendMessage(m.chat, { text: '❌ Pengguna tidak ada di daftar broadcast!' }, { quoted: m });
                    }
                }
            } else {
                
                await naze.sendMessage(m.chat, { text: `*Format salah!* Gunakan perintah:\n\n\`${m.prefix}addbroadcast <ID grup/nomor>\`\n> Untuk menambahkan grup/pengguna\n\n\`${m.prefix}listbroadcast\`\n> Untuk melihat daftar broadcast\n\n\`${m.prefix}broadcast <pesan/reply>\`\n> Untuk mengirim broadcast\n\n\`${m.prefix}delbroadcast <ID grup/nomor>\`\n> Untuk menghapus grup/pengguna` }, { quoted: m });
            }
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};