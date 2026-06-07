require('../../settings');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { fromBuffer } = require('file-type');

module.exports = {
    name: "img2pdf",
    alias: ["imagetopdf",'image2pdf','imgtopdf'],
    description: '<nama pdf>',
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
                         m.type === 'editedMessage' ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage ? m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage.text : m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
            const args = body.trim().split(/ +/).slice(1);
            const pdfName = args.join(' ').trim();

            if (!pdfName) return naze.sendMessage(m.chat, {
                text: `🚨 *Perintah Salah, Yang Mulia!*\n` +
                      `*Konversi Gambar ke PDF:*\n\n` +
                      `  Perintah: Reply foto dengan \n\`${m.prefix}${m.command} <nama pdf>\`\n` +
                      `  Contoh: Reply foto dengan \n\`${m.prefix}${m.command} DokumenSaya\``
            }, { quoted: m });

            const mediaMessage = m.quoted ? m.quoted : m;
            const mime = (mediaMessage.msg || mediaMessage).mimetype || '';
            if (!/image/.test(mime)) return naze.sendMessage(m.chat, {
                text: `🚨 *Perintah Salah, Yang Mulia!*\n` +
                      `*Konversi Gambar ke PDF:*\n\n` +
                      `  Perintah: Reply foto dengan \n\`${m.prefix}${m.command} <nama pdf>\`\n` +
                      `  Contoh: Reply foto dengan \n\`${m.prefix}${m.command} DokumenSaya\``
            }, { quoted: m });

            await naze.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

            const imageBuffer = await mediaMessage.download();
            if (!imageBuffer) return naze.sendMessage(m.chat, { text: "⚠️ Gagal mengunduh foto." }, { quoted: m });

            const { mime: fileMime } = await fromBuffer(imageBuffer) || { mime: '' };
            if (!['image/jpeg', 'image/png'].includes(fileMime)) return naze.sendMessage(m.chat, {
                text: `🚨 *Format Tidak Didukung!*\n\n` +
                      `✨ *Konversi Gambar ke PDF:*\n` +
                      `  Hanya mendukung format JPEG/PNG.\n` +
                      `  Perintah: Reply foto dengan \n\`${m.prefix}${m.command} <nama pdf>\`\n` +
                      `  Contoh: Reply foto dengan \n\`${m.prefix}${m.command} DokumenSaya\``
            }, { quoted: m });

            const tempDir = path.join(__dirname, '../../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            const tempPdfPath = path.join(tempDir, `${pdfName}_${Date.now()}.pdf`);

            const doc = new PDFDocument({ size: 'A4', autoFirstPage: false });
            const stream = fs.createWriteStream(tempPdfPath);
            doc.pipe(stream);

            doc.addPage();
            const img = doc.openImage(imageBuffer);
            const pageWidth = doc.page.width - 40;
            const pageHeight = doc.page.height - 40;
            const imgWidth = img.width;
            const imgHeight = img.height;
            const scale = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
            const scaledWidth = imgWidth * scale;
            const scaledHeight = imgHeight * scale;
            const x = (doc.page.width - scaledWidth) / 2;
            const y = (doc.page.height - scaledHeight) / 2;

            doc.image(imageBuffer, x, y, { width: scaledWidth, height: scaledHeight });
            doc.end();

            await new Promise((resolve, reject) => {
                stream.on('finish', resolve);
                stream.on('error', reject);
            });

            const pdfBuffer = fs.readFileSync(tempPdfPath);
            await naze.sendMessage(m.chat, {
                document: pdfBuffer,
                mimetype: 'application/pdf',
                fileName: `${pdfName}.pdf`
            }, { quoted: m });

            if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);

            await naze.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        } catch (e) {
            await naze.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};