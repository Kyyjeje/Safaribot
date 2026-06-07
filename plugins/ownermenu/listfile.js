const fs = require('fs');
const path = require('path');
require('../../settings');

module.exports = {
    name: 'listfile',
    alias: ['listfile'],
    description: '<path direktori>',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            const from = m.chat || m.sender;
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
            const directoryPath = args.join(' ').trim() || './';

            await naze.sendMessage(from, { text: '*Memproses permintaan, harap tunggu...*' }, { quoted: m });

            function formatSize(bytes) {
                if (bytes < 1024) return `${bytes} B`;
                let kb = bytes / 1024;
                if (kb < 1024) return `${kb.toFixed(1)} KB`;
                let mb = kb / 1024;
                if (mb < 1024) return `${mb.toFixed(1)} MB`;
                let gb = mb / 1024;
                return `${gb.toFixed(1)} GB`;
            }

            function getFolderSize(folderPath) {
                let totalSize = 0;
                try {
                    const items = fs.readdirSync(folderPath);
                    items.forEach(item => {
                        const itemPath = path.join(folderPath, item);
                        const stats = fs.statSync(itemPath);
                        if (stats.isDirectory()) {
                            totalSize += getFolderSize(itemPath);
                        } else {
                            totalSize += stats.size;
                        }
                    });
                } catch (err) {
                    throw new Error(`Gagal menghitung ukuran folder: ${err.message}`);
                }
                return totalSize;
            }

            const items = await fs.promises.readdir(directoryPath).catch(err => {
                throw new Error(`Gagal membaca direktori: ${err.message}`);
            });

            let folders = [];
            let filesList = [];

            items.forEach(item => {
                const itemPath = path.join(directoryPath, item);
                const stats = fs.statSync(itemPath);
                if (stats.isDirectory()) {
                    const folderSize = getFolderSize(itemPath);
                    folders.push({ name: item, size: formatSize(folderSize) });
                } else {
                    filesList.push({ name: item, size: formatSize(stats.size) });
                }
            });

            let listMessage = `*Periksa direktori dari:*\n${directoryPath}:\n\n`;
            listMessage += '*Folder:*\n';
            if (folders.length === 0) listMessage += 'Tidak ada folder.\n';
            folders.forEach(folder => {
                listMessage += `📁 ${folder.name}    (${folder.size})\n`;
            });

            listMessage += '\n*File:*\n';
            if (filesList.length === 0) listMessage += 'Tidak ada file.\n';
            filesList.forEach(file => {
                listMessage += `📄 ${file.name}    (${file.size})\n`;
            });

            
            await naze.sendMessage(from, { text: listMessage }, { quoted: m });
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};