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

async function editImage(userName, groupName, profileImageUrl) {
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
        const templateUrl = 'https://github.com/BANGSULSTAR/thumbnail/raw/main/thumbnailout.png';
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
        const circleSize = 500;
        const circleX = 545;
        const circleY = 600;
        ctx.save();
        ctx.beginPath();
        ctx.arc(circleX, circleY, circleSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(profileImage, circleX - circleSize / 2, circleY - circleSize / 2, circleSize, circleSize);
        ctx.restore();

        // Tambahkan garis pinggir lingkaran
        ctx.beginPath();
        ctx.arc(circleX, circleY, circleSize / 2, 0, Math.PI * 2);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#b1bfbf';
        ctx.stroke();

        // Pengaturan posisi dan teks
        const userTextX = 385;
        const userTextY = 300;
        const groupTextX = 1115;
        const groupTextY = 940;

        // Tambahkan teks nama user
        ctx.font = '40px "Now-Regular"';
        ctx.fillStyle = '#161616ff';
        ctx.fillText(userName, userTextX, userTextY);

        // Tambahkan teks nama grup
        ctx.font = '40px "Now-Regular"';
        ctx.fillStyle = '#0c0c0cff';
        ctx.fillText(groupName, groupTextX, groupTextY);

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

module.exports = editImage;