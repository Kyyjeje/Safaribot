require('../../settings');
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
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
    name: 'addlist',
    alias: ['addtolist', 'newlist'],
    description: '(reply) <nama>',
    run: async ({ naze, m }) => {
        try {
            

            if (!m.isGroup) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
            }
            if (!m.isAdmin) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
            }
            if (!m.isBotAdmin) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);
            }

            //const body = extractText(m);
            let body = extractText(m);
            const args = body.trim().split(/ +/).slice(1).map(s => s.trim());
            if (args.length < 1) {
                
                return naze.sendMessage(m.chat, { text: `Format salah! Contoh: \n${m.prefix}${m.command} makan\nReply pesan yang ingin disimpan` }, { quoted: m });
            }

            const name = args.join(' ').toLowerCase();
            if (!m.quoted) {
                
                return naze.sendMessage(m.chat, { text: `Reply pesan yang ingin disimpan!\nContoh: \`${m.prefix}${m.command}\` makan` }, { quoted: m });
            }

            const chatId = m.chat;
            const textListPath = path.join(__dirname, '../../data/media/database/textlist.json');
            const mediaFolder = path.join(__dirname, `../../data/media/imagelist/${chatId}`);
            let TextList = {};

            if (fs.existsSync(textListPath)) {
                try {
                    TextList = JSON.parse(fs.readFileSync(textListPath, 'utf-8'));
                } catch (err) {
                    console.error(`Gagal parsing textlist.json: ${err.message}`);
                    
                    return naze.sendMessage(m.chat, { text: `Gagal membaca database: ${err.message}` }, { quoted: m });
                }
            }
            if (!TextList[chatId]) TextList[chatId] = [];

            if (TextList[chatId].some(item => item.name.toLowerCase() === name)) {
                
                return naze.sendMessage(m.chat, { text: `Nama "${name}" sudah digunakan!\nContoh: ${m.prefix}${m.command} ayuk mau makan` }, { quoted: m });
            }

            let text = extractText(m.quoted);
            let mediaPath = null;
            if (m.quoted && m.quoted.message && m.quoted.message.imageMessage) {
                try {
                    const tempFile = await naze.downloadAndSaveMediaMessage(m.quoted);
                    await fse.ensureDir(mediaFolder);
                    mediaPath = path.join(mediaFolder, `${name}.jpg`);
                    await fse.copy(tempFile, mediaPath);
                    fs.unlinkSync(tempFile);
                } catch (err) {
                    console.error(`Gagal menyimpan gambar: ${err.message}`);
                    
                    return naze.sendMessage(m.chat, { text: `Gagal menyimpan gambar: ${err.message}` }, { quoted: m });
                }
            }

            const newEntry = { name, text, media: mediaPath ? `${chatId}/${name}.jpg` : null };
            TextList[chatId].push(newEntry);
            await fse.ensureDir(path.dirname(textListPath));
            try {
                fs.writeFileSync(textListPath, JSON.stringify(TextList, null, 2));
            } catch (err) {
                console.error(`Gagal menyimpan textlist.json: ${err.message}`);
                
                return naze.sendMessage(m.chat, { text: `Gagal menyimpan data: ${err.message}` }, { quoted: m });
            }

            
            return naze.sendMessage(m.chat, { text: `Sukses menambah "${name}" ke database grup!` }, { quoted: m });
        } catch (err) {
            console.error(`Kesalahan saat memproses addlist: ${err.message}`);
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};