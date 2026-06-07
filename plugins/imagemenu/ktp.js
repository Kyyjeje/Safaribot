const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const os = require('os');

module.exports = {
    name: 'ktp',
    alias: ['buatkartu', 'idcard'],
    run: async ({ naze, m }) => {
        try {
            // Font configuration
            const fonts = [
                {
                    url: 'https://raw.githubusercontent.com/BANGSULSTAR/font/main/ocr-a-extended.ttf',
                    family: 'OCR A Extended',
                    tempPath: path.join(os.tmpdir(), `ocr-a-extended-${Date.now()}.ttf`)
                },
                {
                    url: 'https://raw.githubusercontent.com/BANGSULSTAR/font/main/Manchester-Signature.ttf',
                    family: 'Manchester-Signature',
                    tempPath: path.join(os.tmpdir(), `Manchester-Signature-${Date.now()}.ttf`)
                }
            ];

            // Download and register fonts
            for (const font of fonts) {
                const response = await fetch(font.url);
                if (!response.ok) {
                    console.warn('[WARN] Gagal mengunduh font dari:', font.url);
                    throw new Error(`Font ${font.family} tidak dapat diunduh.`);
                }
                const fontBuffer = await response.buffer();
                fs.writeFileSync(font.tempPath, fontBuffer);
                registerFont(font.tempPath, { family: font.family });
            }

            // Ambil input pengguna
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
            const text = args.join(' ');

            // Periksa apakah pesan adalah reply ke foto
            let photoUrl = null;
            if (m.message && m.message.contextInfo && m.message.contextInfo.quotedMessage && m.message.contextInfo.quotedMessage.imageMessage) {
                const quotedMsg = m.message.contextInfo.quotedMessage.imageMessage;
                photoUrl = await naze.downloadAndSaveMediaMessage(quotedMsg, 'temp_photo');
            } else if (m.type === 'imageMessage') {
                photoUrl = await naze.downloadAndSaveMediaMessage(m.message.imageMessage, 'temp_photo');
            }

            // Gunakan foto default jika tidak ada foto yang dikirim
            if (!photoUrl) {
                photoUrl = `${global.thumbnailktp}`; // URL foto default
            }

            // Validasi input
            if (!text) {
                return m.reply(`⚠️ Format salah! Gunakan: \n*${m.prefix + m.command} <provinsi>,<kabupaten>,<NIK>,<nama>,<tempat/tanggal lahir>,<jenis kelamin>,<alamat>,<RT/RW>,<Kel/Desa>,<Kecamatan>,<Agama>,<Status Perkawinan>,<Pekerjaan>,<Kewarganegaraan>,<Masa Berlaku>,<Tempat Dibuat>,<Tanggal Dibuat>,<Golongan Darah>,<Tanda Tangan>*\n\nContoh: \n*${m.prefix + m.command} Riau, Pekanbaru, 1234567890123456, Muhammad Ghofar, 01-01-2000, Laki-laki, Jl. Merdeka No. 123, 001/002, Desa Sukamaju, Kec. Sukajadi, Islam, Belum Kawin, Pelajar, wni, seumur hidup, Pekanbaru, 01-01-2025, O, Muhammad Ghofar*`);
            }

            const [provinsi, kabupaten, nik, name, dob, jeniskelamin, address, rtRw, kelDesa, kecamatan, agama, perkawinan, pekerjaan, kewarganegaraan, masaBerlaku, tempatDibuat, tanggalDibuat, golDarah, tandaTangan] = text.split(',').map(s => s.trim());
            if (!provinsi || !kabupaten || !nik || !name || !dob || !jeniskelamin || !address || !rtRw || !kelDesa || !kecamatan || !agama || !perkawinan || !pekerjaan || !kewarganegaraan || !masaBerlaku || !tempatDibuat || !tanggalDibuat || !golDarah || !tandaTangan) {
                return m.reply(`⚠️ Format salah! Pastikan memasukkan semua field: provinsi, kabupaten, NIK, nama, tempat/tanggal lahir, jenis kelamin, alamat, RT/RW, Kel/Desa, Kecamatan, Agama, Status Perkawinan, Pekerjaan, Kewarganegaraan, Masa Berlaku, Tempat Dibuat, Tanggal Dibuat, Golongan Darah, dan Tanda Tangan, dipisah dengan tanda koma.\n\nContoh: \n*${m.prefix + m.command} Riau, Pekanbaru, 1234567890123456, Muhammad Ghofar, 01-01-2000, Laki-laki, Jl. Merdeka No. 123, 001/002, Desa Sukamaju, Kec. Sukajadi, Islam, Belum Kawin, Pelajar, wni, seumur hidup, Pekanbaru, 01-01-2025, O, Muhammad Ghofar*`);
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
            // Path ke gambar template
            const templatePath = path.join(__dirname, '../../data/ktp.jpeg');
            if (!fs.existsSync(templatePath)) {
                return m.reply('❌ Template kartu pengenal tidak ditemukan di ./data! Pastikan file ktp.jpeg sudah ada.');
            }
            

            // Load gambar template
            const image = await loadImage(templatePath);
            const canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');

            // Gambar template ke canvas
            ctx.drawImage(image, 0, 0);

            // Load dan proses foto
            const photo = await loadImage(photoUrl);
            const photoWidth = 166; // Resolusi target: 166px lebar
            const photoHeight = 207; // Resolusi target: 207px tinggi
            const photoX = 500; // Posisi x untuk foto
            const photoY = 127; // Posisi y untuk foto

            // Buat canvas sementara untuk memproses foto dengan efek blur
            const tempCanvas = createCanvas(photoWidth, photoHeight);
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(photo, 0, 0, photoWidth, photoHeight);

            // Terapkan efek blur ringan
            //tempCtx.filter = 'blur(1.5px)'; // Blur ringan dengan radius 1.5px
            //tempCtx.drawImage(tempCanvas, 0, 0, photoWidth, photoHeight);

            // Gambar foto yang sudah diproses ke canvas utama
            ctx.drawImage(tempCanvas, photoX, photoY, photoWidth, photoHeight);

            // Atur font dan warna teks default
            ctx.font = 'bold 13px Arial';
            ctx.fillStyle = '#1C1f21'; // Warna teks: hitam

            // Kustomisasi font dan warna untuk NIK
            ctx.font = '29px "OCR A Extended"'; // Font OCR A Extended, ukuran 29px
            ctx.fillStyle = '#000000'; // Warna teks: hitam
            const nikPos = { x: 189, y: 129 }; // Posisi untuk NIK
            ctx.fillText(`${nik.toUpperCase()}`, nikPos.x, nikPos.y); // NIK

            // Kembali ke pengaturan default untuk field lain
            ctx.font = 'bold 13px Arial';
            ctx.fillStyle = '#1C1f21';

            // Tentukan posisi teks
            const namePos = { x: 195, y: 158 }; // Nama
            const dobPos = { x: 195, y: 178 }; // Tempat/Tanggal Lahir
            const jeniskelaminPos = { x: 195, y: 198 }; // Jenis Kelamin
            const addressPos = { x: 195, y: 218 }; // Alamat
            const rtRwPos = { x: 195, y: 239 }; // RT/RW
            const kelDesaPos = { x: 195, y: 260 }; // Kel/Desa
            const kecamatanPos = { x: 195, y: 280 }; // Kecamatan
            const agamaPos = { x: 195, y: 300 }; // Agama
            const perkawinanPos = { x: 195, y: 321 }; // Status Perkawinan
            const pekerjaanPos = { x: 195, y: 342 }; // Pekerjaan
            const kewarganegaraanPos = { x: 195, y: 362 }; // Kewarganegaraan
            const masaBerlakuPos = { x: 195, y: 382 }; // Masa Berlaku
            const golDarahPos = { x: 450, y: 198 }; // Golongan Darah

            // Tambahkan teks default (kiri) dengan kapital
            ctx.fillText(`${name.toUpperCase()}`, namePos.x, namePos.y);
            ctx.fillText(`${dob.toUpperCase()}`, dobPos.x, dobPos.y);
            ctx.fillText(`${jeniskelamin.toUpperCase()}`, jeniskelaminPos.x, jeniskelaminPos.y);
            ctx.fillText(`${address.toUpperCase()}`, addressPos.x, addressPos.y);
            ctx.fillText(`${rtRw.toUpperCase()}`, rtRwPos.x, rtRwPos.y);
            ctx.fillText(`${kelDesa.toUpperCase()}`, kelDesaPos.x, kelDesaPos.y);
            ctx.fillText(`${kecamatan.toUpperCase()}`, kecamatanPos.x, kecamatanPos.y);
            ctx.fillText(`${agama.toUpperCase()}`, agamaPos.x, agamaPos.y);
            ctx.fillText(`${perkawinan.toUpperCase()}`, perkawinanPos.x, perkawinanPos.y);
            ctx.fillText(`${pekerjaan.toUpperCase()}`, pekerjaanPos.x, pekerjaanPos.y);
            ctx.fillText(`${kewarganegaraan.toUpperCase()}`, kewarganegaraanPos.x, kewarganegaraanPos.y);
            ctx.fillText(`${masaBerlaku.toUpperCase()}`, masaBerlakuPos.x, masaBerlakuPos.y);
            
            // Golongan Darah
            ctx.font = 'bold 13px Arial';
            ctx.fillText(`${golDarah.toUpperCase()}`, golDarahPos.x, golDarahPos.y);

            // Atur teks tengah untuk Provinsi, Kabupaten, Tempat Dibuat, Tanggal Dibuat, dan Tanda Tangan
            ctx.textAlign = 'center';

            // Tambahkan teks Provinsi dan Kabupaten
            const provinsiPos = { x: 355, y: 45 };
            const kabupatenPos = { x: 355, y: 78 };
            ctx.font = 'bold 29px Arial';
            ctx.fillStyle = '#1C1f21';
            ctx.fillText(`PROVINSI ${provinsi.toUpperCase()}`, provinsiPos.x, provinsiPos.y);
            ctx.fillText(`${kabupaten.toUpperCase()}`, kabupatenPos.x, kabupatenPos.y);

            // Tempat Dibuat dan Tanggal Dibuat
            const tempatDibuatPos = { x: 586, y: 358 };
            const tanggalDibuatPos = { x: 586, y: 376 };
            ctx.font = 'bold 14px Arial';
            ctx.fillText(`${tempatDibuat.toUpperCase()}`, tempatDibuatPos.x, tempatDibuatPos.y);
            ctx.font = 'bold 12px Arial';
            ctx.fillText(`${tanggalDibuat.toUpperCase()}`, tanggalDibuatPos.x, tanggalDibuatPos.y);

            // Tanda Tangan
            const tandaTanganPos = { x: 586, y: 430 };
            ctx.font = '87px "Manchester-Signature"';
            ctx.fillStyle = '#1C1f21';
            ctx.fillText(`${tandaTangan}`, tandaTanganPos.x, tandaTanganPos.y);

            // Kembali ke teks align default
            ctx.textAlign = 'left';

            // Simpan gambar yang sudah diedit dalam format JPEG
            const outputPath = path.join(__dirname, `../../temp/idcard_${Date.now()}.jpeg`);
            const out = fs.createWriteStream(outputPath);
            const stream = canvas.createJPEGStream({ quality: 0.95 });
            stream.pipe(out);

            // Tunggu sampai file selesai disimpan
            await new Promise((resolve, reject) => {
                out.on('finish', resolve);
                out.on('error', reject);
            });

            // Kirim gambar ke pengguna
            await naze.sendMessage(m.chat, {
                image: { url: outputPath },
                caption: '✅ KTP berhasil dibuat!'
            }, { quoted: m });
            

            // Cleanup
            fs.unlinkSync(outputPath);
            if (photoUrl && photoUrl.startsWith('/temp')) fs.unlinkSync(photoUrl);
            for (const font of fonts) {
                if (fs.existsSync(font.tempPath)) {
                    try {
                        fs.unlinkSync(font.tempPath);
                    } catch (e) {
                        console.warn('[WARN] Gagal menghapus temporary font file:', font.tempPath, e);
                    }
                }
            }

        } catch (e) {
            
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};
