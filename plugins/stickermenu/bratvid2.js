require('../../settings');
const { createCanvas, registerFont } = require('canvas');
const Jimp = require('jimp');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const os = require('os');

module.exports = {
    name: 'bratvid2',
    alias: ['bratvideo2', 'bratstikervid2', 'bratstickervid2'],
    description: '<teks>',
    run: async ({ naze, m }) => {
        try {
            
            const text = m.text?.split(' ').slice(1).join(' ');
            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Masukkan teks untuk video stiker!\nContoh: ${m.prefix}${m.command} Admin Ganteng` }, { quoted: m });
            }
            if (text.length > 60) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Teks terlalu panjang, maksimum 60 karakter!` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            const fontUrl = 'https://raw.githubusercontent.com/BANGSULSTAR/font/main/bakso-sapi.ttf';
            const tempFontPath = path.join(os.tmpdir(), `bakso-sapi-${Date.now()}.ttf`);
            const response = await fetch(fontUrl);
            if (!response.ok) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Font tidak dapat diunduh!` }, { quoted: m });
            }
            const fontBuffer = await response.buffer();
            fs.writeFileSync(tempFontPath, fontBuffer);
            registerFont(tempFontPath, { family: 'bakso-sapi' });

            const words = text.split(' ');
            const tempDir = path.join(process.cwd(), 'lib');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
            const framePaths = [];

            for (let i = 0; i < words.length; i++) {
                let width = 2048, height = 2048, margin = 20, wordSpacing = 50;
                let canvas = createCanvas(width, height);
                let ctx = canvas.getContext('2d');

                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, width, height);

                let fontSize = 680;
                let lineHeightMultiplier = 1.3;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillStyle = 'white';
                ctx.font = `${fontSize}px bakso-sapi`;

                let currentText = words.slice(0, i + 1).join(' ');
                let lines = [];
                let rebuildLines = () => {
                    lines = [];
                    let currentLine = '';
                    for (let word of currentText.split(' ')) {
                        let testLine = currentLine ? `${currentLine} ${word}` : word;
                        let lineWidth = ctx.measureText(testLine).width + (currentLine.split(' ').length - 1) * wordSpacing;
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
                    ctx.font = `${fontSize}px bakso-sapi`;
                    rebuildLines();
                }

                let lineHeight = fontSize * lineHeightMultiplier, y = margin;
                for (let line of lines) {
                    let wordsInLine = line.split(' ');
                    let x = margin;
                    for (let word of wordsInLine) {
                        ctx.fillText(word, x, y);
                        x += ctx.measureText(word).width + wordSpacing;
                    }
                    y += lineHeight;
                }

                let buffer = canvas.toBuffer('image/png');
                let image = await Jimp.read(buffer);
                image.blur(3);
                let blurredBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
                let framePath = path.join(tempDir, `frame${i}.png`);
                fs.writeFileSync(framePath, blurredBuffer);
                framePaths.push(framePath);
            }

            const fileListPath = path.join(tempDir, 'filelist.txt');
            let fileListContent = framePaths.map(frame => `file '${frame}'\nduration 0.7`).join('\n');
            fileListContent += `\nfile '${framePaths[framePaths.length - 1]}'\nduration 2`;
            fs.writeFileSync(fileListPath, fileListContent);

            const outputVideoPath = path.join(tempDir, 'output.mp4');
            execSync(`ffmpeg -y -f concat -safe 0 -i ${fileListPath} -vf "fps=30,format=yuv420p" -c:v libx264 -preset ultrafast ${outputVideoPath}`);

            await naze.sendAsSticker(m.chat, outputVideoPath, m, { packname: global.packname, author: global.author });
            

            framePaths.forEach(frame => fs.existsSync(frame) && fs.unlinkSync(frame));
            if (fs.existsSync(fileListPath)) fs.unlinkSync(fileListPath);
            if (fs.existsSync(outputVideoPath)) fs.unlinkSync(outputVideoPath);
            if (fs.existsSync(tempFontPath)) fs.unlinkSync(tempFontPath);
        } catch (e) {
            console.error(`Fatal error di bratvid2: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};