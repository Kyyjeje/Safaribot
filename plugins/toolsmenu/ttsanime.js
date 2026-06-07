require('../../settings');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const voices = [
    { name: 'Hatsune Miku', key: 'miku' },
    { name: 'Nahida (Exclusive)', key: 'nahida' },
    { name: 'Nami', key: 'nami' },
    { name: 'Ana (Female)', key: 'ana' },
    { name: 'Optimus Prime', key: 'optimus_prime' },
    { name: 'Goku', key: 'goku' },
    { name: 'Taylor Swift', key: 'taylor_swift' },
    { name: 'Elon Musk', key: 'elon_musk' },
    { name: 'Mickey Mouse', key: 'mickey_mouse' },
    { name: 'Kendrick Lamar', key: 'kendrick_lamar' },
    { name: 'Angela Adkinsh', key: 'angela_adkinsh' },
    { name: 'Eminem', key: 'eminem' }
];

async function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
    return new Promise(async (resolve, reject) => {
        try {
            let tmp = path.join(__dirname, '../../temp', +new Date() + '.' + ext);
            let out = tmp + '.' + ext2;
            await fs.promises.writeFile(tmp, buffer);
            spawn('ffmpeg', ['-y', '-i', tmp, ...args, out])
                .on('error', reject)
                .on('close', async (code) => {
                    try {
                        await fs.promises.unlink(tmp);
                        if (code !== 0) return reject(new Error(`FFmpeg exited with code ${code}`));
                        resolve(await fs.promises.readFile(out));
                        await fs.promises.unlink(out);
                    } catch (e) {
                        reject(e);
                    }
                });
        } catch (e) {
            reject(e);
        }
    });
}

async function toAudio(buffer, ext) {
    return ffmpeg(buffer, ['-vn', '-ac', '2', '-b:a', '128k', '-ar', '44100', '-f', 'mp3'], ext, 'mp3');
}

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
    name: 'ttsanime',
    alias: ['texttospeechanime'],
    description: '<ID>,<teks>',
    run: async ({ naze, m }) => {
        try {
            
            
            const text = extractText(m).trim().split(/ +/).slice(1).join(' ');
            if (!text || !text.includes(',')) {
                const voiceList = voices.map((v, i) => `${i + 1}. ${v.name}`).join('\n');
                
                return naze.sendMessage(m.chat, { text: `⚠️ Format salah!\n\nGunakan: ${m.prefix}${m.command} <nomor_urut>,<teks>\nContoh: ${m.prefix}${m.command} 6,aku adalah BangsulBotz, bot kebanggaan ownerku Ghofar.\n\n🎤 *Daftar Suara:*\n${voiceList}` }, { quoted: m });
            }
			
            const parts = text.split(',');
            const voiceId = parts.shift().trim();
            const inputText = parts.join(',').trim();
            const voiceIndex = parseInt(voiceId) - 1;

            if (isNaN(voiceIndex) || voiceIndex < 0 || voiceIndex >= voices.length) {
                const voiceList = voices.map((v, i) => `${i + 1}. ${v.name}`).join('\n');
                
                return naze.sendMessage(m.chat, { text: `⚠️ Nomor urut tidak valid! Pilih nomor dari 1 sampai ${voices.length}.\n\nContoh: ${m.prefix}${m.command} 6,aku adalah BangsulBotz.\n\n🎤 *Daftar Suara:*\n${voiceList}` }, { quoted: m });
            }

            if (!inputText || inputText.trim() === '') {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Masukkan teks untuk diubah menjadi suara!\nContoh: ${m.prefix}${m.command} ${voiceId},aku adalah BangsulBotz, bot kebanggaan ownerku Ghofar.` }, { quoted: m });
            }

            if (inputText.length > 100) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Teks terlalu panjang (maksimum 100 karakter). Saat ini: ${inputText.length} karakter.` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            const encodedText = encodeURIComponent(inputText).replace(/%20/g, '+');
            const apiUrl = `https://api.yogik.id/tools/tts-anime/?text=${encodedText}`;

            const res = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
                },
                timeout: 15000
            });

            if (!res.ok) throw new Error(`Permintaan API gagal: ${res.status} ${res.statusText}`);

            const data = await res.json();
            if (!data.status || !data.result || !data.result[voiceIndex]) throw new Error('Struktur respons tidak sesuai atau suara tidak tersedia.');

            const voiceData = data.result[voiceIndex];
            const audioUrl = voiceData[voices[voiceIndex].key];
            if (!audioUrl || !audioUrl.endsWith('.wav')) throw new Error('URL audio tidak valid atau format tidak didukung.');

            const audioRes = await fetch(audioUrl);
            if (!audioRes.ok) throw new Error(`Gagal mengunduh audio: ${audioRes.status} ${audioRes.statusText}`);

            const contentType = audioRes.headers.get('content-type');
            if (!contentType || !contentType.includes('audio/')) throw new Error('Respons bukan audio atau format tidak didukung.');

            const buffer = await audioRes.buffer();
            const mp3Buffer = await toAudio(buffer, 'wav');

            
            await naze.sendMessage(m.chat, {
                audio: mp3Buffer,
                mimetype: 'audio/mpeg',
                ptt: false,
                caption: `*TTS Anime - ${voices[voiceIndex].name}*\nTeks: ${inputText}`
            }, { quoted: m });
        } catch (err) {
            console.error(`Fatal error di ttsanime: ${err.message}\nStack: ${err.stack}`);
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};