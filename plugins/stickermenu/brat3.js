require('../../settings');
const { createCanvas, registerFont } = require('canvas');
const Jimp = require('jimp');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = {
    name: 'brat3',
    alias: ['bratsticker3', 'bratstiker3', 'bratstick3'],
    description: '<teks>',
    run: async ({ naze, m }) => {
        try {
            
            
            const text = m.text?.split(' ').slice(1).join(' ');
            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Masukkan teks untuk stiker!\nContoh: ${m.prefix}${m.command} Admin Ganteng` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            const FONT_CONFIG = {
                url: 'https://raw.githubusercontent.com/BANGSULSTAR/font/main/PlaypenSans-SemiBold.ttf',
                family: 'PlaypenSans-SemiBold',
                size: 550
            };

            const tempFontPath = path.join(os.tmpdir(), `PlaypenSans-SemiBold-${Date.now()}.ttf`);
            const response = await fetch(FONT_CONFIG.url);
            if (!response.ok) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Font tidak dapat diunduh!` }, { quoted: m });
            }
            const fontBuffer = await response.buffer();
            fs.writeFileSync(tempFontPath, fontBuffer);
            registerFont(tempFontPath, { family: FONT_CONFIG.family });

            let width = 2048, height = 2048, margin = 20, defaultWordSpacing = 50;
            let canvas = createCanvas(width, height);
            let ctx = canvas.getContext('2d');

            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, width, height);

            let fontSize = FONT_CONFIG.size;
            let lineHeightMultiplier = 1.4;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillStyle = 'white';
            ctx.font = `${fontSize}px ${FONT_CONFIG.family}`;

            let words = text.split(' ');
            let lines = [];

            let rebuildLines = () => {
                lines = [];
                let currentLine = '';
                for (let word of words) {
                    let testLine = currentLine ? `${currentLine} ${word}` : word;
                    let lineWidth = ctx.measureText(testLine).width + (currentLine.split(' ').length - 1) * defaultWordSpacing;
                    if (lineWidth < width - 2 * margin) {
                        currentLine = testLine;
                    } else {
                        lines.push(currentLine);
                        currentLine = word;
                    }
                }
                if (currentLine) lines.push(currentLine);
            };

            rebuildLines();

            while (lines.length * fontSize * lineHeightMultiplier > height - 2 * margin) {
                fontSize -= 2;
                ctx.font = `${fontSize}px ${FONT_CONFIG.family}`;
                rebuildLines();
            }

            let lineHeight = fontSize * lineHeightMultiplier, y = margin;
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];
                let wordsInLine = line.split(' ');
                let isLastLine = i === lines.length - 1;
                if (wordsInLine.length === 1 || isLastLine) {
                    let x = margin;
                    for (let word of wordsInLine) {
                        ctx.fillText(word, x, y);
                        x += ctx.measureText(word).width + defaultWordSpacing;
                    }
                } else {
                    let totalTextWidth = wordsInLine.reduce((sum, word) => sum + ctx.measureText(word).width, 0);
                    let availableWidth = width - 2 * margin - totalTextWidth;
                    let wordSpacing = availableWidth / (wordsInLine.length - 1);
                    let x = margin;
                    for (let j = 0; j < wordsInLine.length; j++) {
                        let word = wordsInLine[j];
                        ctx.fillText(word, x, y);
                        x += ctx.measureText(word).width + (j < wordsInLine.length - 1 ? wordSpacing : 0);
                    }
                }
                y += lineHeight;
            }

            let buffer = canvas.toBuffer('image/png');
            let image = await Jimp.read(buffer);
            image.blur(3);
            let blurredBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

            try {
                fs.unlinkSync(tempFontPath);
            } catch (e) {}

            await naze.sendAsSticker(m.chat, blurredBuffer, m, { packname: packname, author: author });
            
        } catch (e) {
            console.error(`Fatal error di brat3: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};