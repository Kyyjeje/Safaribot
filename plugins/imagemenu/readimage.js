require('../../settings');
const axios = require("axios");
const FormData = require("form-data");
const { fromBuffer } = require("file-type");

async function uploadImage(buffer) {
    return new Promise(async (resolve, reject) => {
        try {
            const form = new FormData();
            const { ext } = await fromBuffer(buffer);
            form.append('files[]', buffer, { filename: 'image.' + ext });

            const { data } = await axios.post('https://uguu.se/upload.php', form, {
                headers: { ...form.getHeaders() }
            });

            resolve(data.files?.[0]?.url || null);
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = {
    name: 'readimg',
    alias: ['imageread','readimage','bacagambar','baca-gambar','bradimg','bradimage'],
    run: async ({ naze, m }) => {
        const body = (m.type === 'conversation') ? m.message.conversation : 
                     (m.type == 'imageMessage') ? m.message.imageMessage.caption : 
                     (m.type == 'videoMessage') ? m.message.videoMessage.caption : 
                     (m.type == 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.type == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
                     (m.type == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : 
                     (m.type == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : 
                     (m.type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : 
                     (m.type === 'editedMessage') ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage ? m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage.text : m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';

        const args = body.trim().split(/ +/).slice(1);
        const quoted = m.quoted ? m.quoted : m;
        const text = q = args.join(' ');

        try {
            let imageUrl;
            let query = args.join(" ") || "Jelaskan gambar ini"; 
            const mime = (quoted.msg || quoted).mimetype || '';
            if (mime && mime.startsWith("image/")) {
                 
                let media = await quoted.download();
                imageUrl = await uploadImage(media);
                
                if (!imageUrl) return m.reply("❌ Gagal mengunggah gambar!");
            } else if (args[0] && args[0].startsWith("http")) {
                imageUrl = args[0]; 
            } else {
                return m.reply("⚠️ Silakan kirim gambar atau berikan URL gambar!");
            }

            let apiUrl = `https://api.siputzx.my.id/api/ai/image2text?url=${encodeURIComponent(imageUrl)}&query=${encodeURIComponent(query)}`;
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            let { data } = await axios.get(apiUrl);
            if (!data || !data.status) return m.reply("❌ Gagal mendapatkan deskripsi gambar!");
            let hasilDeskripsi = data.data.replace(/\*\*(.*?)\*\*/g, '*$1*');
            await naze.sendMessage(m.chat, { text: `📷 *Hasil Analisis Gambar:*\n\n${hasilDeskripsi}` }, { quoted: m });
			
        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};
