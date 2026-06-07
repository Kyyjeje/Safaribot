const { createCanvas, loadImage, registerFont } = require('canvas');
const axios = require('axios');
const FormData = require('form-data');
const { fromBuffer } = require('file-type');
const fs = require('fs');
const path = require('path');

async function CatboxUpload(buffer) {
    return new Promise(async (resolve, reject) => {
        try {
            const form = new FormData();
            const fileTypeResult = await fromBuffer(buffer);
            const ext = fileTypeResult ? fileTypeResult.ext : 'bin';
            form.append('fileToUpload', buffer, { filename: `upload.${ext}` });
            form.append('reqtype', 'fileupload');

            const { data } = await axios.post('https://catbox.moe/user/api.php', form, {
                headers: {
                    ...form.getHeaders()
                }
            });

            if (!data || typeof data !== 'string' || !data.startsWith('https://files.catbox.moe/')) {
                throw new Error('Struktur respons tidak sesuai atau upload gagal.');
            }
            resolve(data.trim());
        } catch (e) {
            console.error('[ERROR] Gagal upload ke Catbox.moe:', e.response?.data || e.message);
            reject(e);
        }
    });
}

function splitGroupName(groupName) {
    const maxLength = 23;
    if (groupName.length <= maxLength) return [groupName];

    const words = groupName.split(' ');
    let lines = [];
    let currentLine = '';

    for (let word of words) {
        if ((currentLine + word).length <= maxLength) {
            currentLine += (currentLine ? ' ' : '') + word;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    }
    if (currentLine) lines.push(currentLine);

    return lines;
}

async function editJoinImage(userName, groupName, profileImageUrl) {
    try {
        // Unduh font dari URL
        const fontUrl = 'https://github.com/BANGSULSTAR/font/raw/refs/heads/main/Now-Regular.otf';
        const fontPath = path.join(__dirname, 'temp', 'Now-Regular.otf');
        if (!fs.existsSync(fontPath)) {
            const fontResponse = await axios.get(fontUrl, { responseType: 'arraybuffer' });
            fs.mkdirSync(path.dirname(fontPath), { recursive: true });
            fs.writeFileSync(fontPath, fontResponse.data);
        }
        registerFont(fontPath, { family: 'Now-Regular' });

        // Unduh template gambar dari URL
        const templateUrl = 'https://github.com/BANGSULSTAR/thumbnail/raw/main/thumbnailjoin.png';
        const templateResponse = await axios.get(templateUrl, { responseType: 'arraybuffer' });
        const template = await loadImage(templateResponse.data);

        // Buat canvas sesuai ukuran template
        const canvas = createCanvas(template.width, template.height);
        const ctx = canvas.getContext('2d');

        // Gambar template ke canvas
        ctx.drawImage(template, 0, 0);

        // Muat gambar profil
        let profileImage;
        try {
            profileImage = await loadImage(profileImageUrl);
        } catch {
            profileImage = await loadImage('https://telegra.ph/file/95670d63378f7f4210f03.png');
        }

        // Crop gambar menjadi lingkaran
        const circleSize = 365;
        const circleX = 752;
        const circleY = 314;
        ctx.save();
        ctx.beginPath();
        ctx.arc(circleX, circleY, circleSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(profileImage, circleX - circleSize / 2, circleY - circleSize / 2, circleSize, circleSize);
        ctx.restore();

        
        // Split nama grup menjadi baris fleksibel
        const groupLines = splitGroupName(groupName);
        const baseTextY = 160; // Posisi awal teks grup
        const lineHeight = 40; // Tinggi antar baris

        // Tambahkan teks nama user
        ctx.font = '40px "Now-Regular"';
        ctx.fillStyle = '#FFFFF4';
        ctx.fillText(userName, 185, 300);

        // Tambahkan teks nama grup dengan posisi dinamis
        ctx.font = '30px "Now-Regular"';
        ctx.fillStyle = '#FFFFF4';
        const totalLines = groupLines.length;
        groupLines.forEach((line, index) => {
            const yOffset = (totalLines - 1 - index) * lineHeight; // Baris pertama naik, baris berikutnya turun
            ctx.fillText(line, 130, baseTextY - yOffset);
        });

        // Konversi canvas ke buffer
        const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });

        // Upload ke Catbox
        const imageUrlResult = await CatboxUpload(buffer);

        // Hapus file font sementara
        if (fs.existsSync(fontPath)) {
            fs.unlinkSync(fontPath);
        }

        // Kembalikan JSON dengan URL gambar
        return {
            status: 'success',
            imageUrl: imageUrlResult
        };
    } catch (error) {
        console.error('Terjadi kesalahan:', error.message);
        return {
            status: 'error',
            message: error.message
        };
    }
}

module.exports = editJoinImage;