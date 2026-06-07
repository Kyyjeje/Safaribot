require('../../settings');
const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const fetch = require('node-fetch');
const os = require('os');

module.exports = {
    name: 'ttp',
    alias: ['ttphd', 'ttpjernih'],
    description: '<teks>',
    run: async ({ naze, m }) => {
        try {
            

            const fontUrl = 'https://raw.githubusercontent.com/BANGSULSTAR/font/main/AppleColorEmoji.ttf';
            const tempFontPath = path.join(os.tmpdir(), `AppleColorEmoji-${Date.now()}.ttf`);

            const response = await fetch(fontUrl);
            if (!response.ok) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Font tidak dapat diunduh!` }, { quoted: m });
            }
            const fontBuffer = await response.buffer();
            fs.writeFileSync(tempFontPath, fontBuffer);
            registerFont(tempFontPath, { family: 'AppleFont' });

            let body = (m.type === 'conversation') ? m.message.conversation :
                       (m.type === 'imageMessage') ? m.message.imageMessage.caption :
                       (m.type === 'videoMessage') ? m.message.videoMessage.caption :
                       (m.type === 'extendedTextMessage') ? m.message.extendedTextMessage.text :
                       (m.type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId :
                       (m.type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                       (m.type === 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId :
                       (m.type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) :
                       (m.type === 'editedMessage') ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage ? m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage.text : m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
            const args = body.trim().split(/ +/).slice(1);
            const text = args.join(' ').trim();

            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Format salah! Gunakan:\n${m.prefix}${m.command} <teks>\nContoh: ${m.prefix}${m.command} aku keren ga` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            const canvasWidth = 2048;
            const canvasHeight = 2048;
            const canvas = createCanvas(canvasWidth, canvasHeight);
            const ctx = canvas.getContext('2d');

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.textBaseline = 'middle';
            ctx.textDrawingMode = 'glyph';

            const words = text.split(' ');
            const datas = words.map(word => /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(word) ? 'black' : 'white');

            function wrapText(text, maxWidth, fontSize) {
                ctx.font = `bold ${fontSize}px AppleFont`;
                const words = text.split(' ');
                const lines = [];
                let currentLine = [words[0] || ''];
                for (let i = 1; i < words.length; i++) {
                    const word = words[i];
                    const testLine = currentLine.join(' ') + ' ' + word;
                    const width = ctx.measureText(testLine).width;
                    if (width < maxWidth && testLine.trim().length > 0) {
                        currentLine.push(word);
                    } else {
                        if (currentLine.join(' ').trim().length > 0) lines.push(currentLine);
                        currentLine = [word];
                    }
                }
                if (currentLine.join(' ').trim().length > 0) lines.push(currentLine);
                return lines;
            }

            function drawExtraBoldText(lines, fontSize, maxWidth, startY) {
                const lineHeight = fontSize * 1.2;
                let wordIndex = 0;
                lines.forEach((lineWords, index) => {
                    const line = lineWords.join(' ');
                    const textWidth = ctx.measureText(line).width;
                    const wordCount = lineWords.length;
                    if (wordCount > 1 && textWidth < maxWidth) {
                        const spacesNeeded = wordCount - 1;
                        const extraSpace = (maxWidth - textWidth) / spacesNeeded;
                        let x = margin;
                        for (let i = 0; i < wordCount; i++) {
                            const word = lineWords[i];
                            ctx.fillStyle = datas[wordIndex];
                            ctx.font = `bold ${fontSize}px AppleFont`;
                            for (let dx = -1; dx <= 1; dx++) {
                                for (let dy = -1; dy <= 1; dy++) {
                                    if (dx !== 0 || dy !== 0) {
                                        ctx.fillText(word, x + dx, startY + index * lineHeight + dy);
                                    }
                                }
                            }
                            ctx.fillText(word, x, startY + index * lineHeight);
                            x += ctx.measureText(word).width + extraSpace;
                            wordIndex++;
                        }
                    } else {
                        ctx.textAlign = 'left';
                        for (let i = 0; i < wordCount; i++) {
                            const word = lineWords[i];
                            ctx.fillStyle = datas[wordIndex];
                            ctx.font = `bold ${fontSize}px AppleFont`;
                            for (let dx = -1; dx <= 1; dx++) {
                                for (let dy = -1; dy <= 1; dy++) {
                                    if (dx !== 0 || dy !== 0) {
                                        ctx.fillText(word, margin + dx, startY + index * lineHeight + dy);
                                    }
                                }
                            }
                            ctx.fillText(word, margin, startY + index * lineHeight);
                            wordIndex++;
                        }
                    }
                });
            }

            const margin = 160;
            const maxWidth = canvasWidth - 2 * margin;
            const wordCount = text.trim().split(/\s+/).length;

            if (wordCount === 1) {
                let fontSize = 800;
                ctx.font = `bold ${fontSize}px AppleFont`;
                let textWidth = ctx.measureText(text).width;
                while (textWidth > maxWidth && fontSize > 80) {
                    fontSize -= 1;
                    ctx.font = `bold ${fontSize}px AppleFont`;
                    textWidth = ctx.measureText(text).width;
                }
                ctx.textAlign = 'center';
                ctx.fillStyle = datas[0];
                ctx.font = `bold ${fontSize}px AppleFont`;
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        if (dx !== 0 || dy !== 0) {
                            ctx.fillText(text, canvasWidth / 2 + dx, canvasHeight / 2 + dy);
                        }
                    }
                }
                ctx.fillText(text, canvasWidth / 2, canvasHeight / 2);
            } else {
                let fontSize = 320;
                let lines = wrapText(text, maxWidth, fontSize);
                let lineHeight = fontSize * 1.2;
                let totalHeight = lines.length * lineHeight;
                while ((totalHeight > canvasHeight - 2 * margin || lines.some(line => line.join(' ').split(' ').length === 1 && ctx.measureText(line.join(' ')).width > maxWidth)) && fontSize > 80) {
                    fontSize -= 1;
                    lines = wrapText(text, maxWidth, fontSize);
                    lineHeight = fontSize * 1.2;
                    totalHeight = lines.length * lineHeight;
                }
                const startY = (canvasHeight - totalHeight) / 2 + fontSize / 2;
                drawExtraBoldText(lines, fontSize, maxWidth, startY);
            }

            let buffer = canvas.toBuffer('image/png');
            buffer = await sharp(buffer)
                .resize(512, 512)
                .webp({ quality: 100, lossless: true })
                .toBuffer();

            if (fs.existsSync(tempFontPath)) {
                try {
                    fs.unlinkSync(tempFontPath);
                } catch (e) {
                    console.error(`Gagal menghapus temporary font file: ${e.message}`);
                }
            }

            await naze.sendAsSticker(m.chat, buffer, m, { packname: packname, author: author });
            
        } catch (e) {
            console.error(`Fatal error di ttp: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};