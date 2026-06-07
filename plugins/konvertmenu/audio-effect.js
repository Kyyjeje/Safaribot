require('../../settings');
const fs = require('fs');
const { exec } = require('child_process');

function getRandom(ext) {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
}

module.exports = {
    name: 'audio-effect',
    alias: ['bass', 'blown', 'deep', 'earrape', 'fast', 'fat', 'nightcore', 'reverse', 'robot', 'slow', 'smooth', 'tupai'],
    description: '<reply audio>',
    run: async ({ naze, m }) => {
        const body = (m.type === 'conversation') ? m.message.conversation : 
                     (m.type === 'imageMessage') ? m.message.imageMessage.caption : 
                     (m.type === 'videoMessage') ? m.message.videoMessage.caption : 
                     (m.type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (m.type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : 
                     (m.type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : 
                     (m.type === 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : 
                     (m.type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : 
                     (m.type === 'editedMessage') ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage?.text || m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
        const command = body.trim().split(/ +/).shift().toLowerCase();
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';

        try {
            if (command === 'audio-effect') {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Ubah Efek Audio:*\n` +
                               `  Efek Tersedia: \n\`bass, blown, deep, earrape, fast, fat, nightcore, reverse, robot, slow, smooth, tupai\`\n\n` +
                              `  Perintah: Reply audio lalu ketik \n\`${m.prefix}<efek>\`\n` +
                              `  Contoh: Reply audio dengan teks \n\`${m.prefix}bass\``);
            }

            let set;
            if (/bass/.test(command)) set = '-af equalizer=f=54:width_type=o:width=2:g=20';
            else if (/blown/.test(command)) set = '-af acrusher=.1:1:64:0:log';
            else if (/deep/.test(command)) set = '-af atempo=4/4,asetrate=44500*2/3';
            else if (/earrape/.test(command)) set = '-af volume=12';
            else if (/fast/.test(command)) set = '-filter:a "atempo=1.63,asetrate=44100"';
            else if (/fat/.test(command)) set = '-filter:a "atempo=1.6,asetrate=22100"';
            else if (/nightcore/.test(command)) set = '-filter:a atempo=1.06,asetrate=44100*1.25';
            else if (/reverse/.test(command)) set = '-filter_complex "areverse"';
            else if (/robot/.test(command)) set = '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"';
            else if (/slow/.test(command)) set = '-filter:a "atempo=0.7,asetrate=44100"';
            else if (/smooth/.test(command)) set = '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"';
            else if (/tupai/.test(command)) set = '-filter:a "atempo=0.5,asetrate=65100"';
            else {
                
                return m.reply(`🚨 *Efek Tidak Valid, Yang Mulia!*\n\n` +
                              `✨ *Ubah Efek Audio:*\n` +
                              `  Perintah: Reply audio lalu ketik \n\`${m.prefix}<efek>\`\n` +
                              `  Efek Tersedia: \n\`bass, blown, deep, earrape, fast, fat, nightcore, reverse, robot, slow, smooth, tupai\`\n` +
                              `  Contoh: Reply audio dengan \n\`${m.prefix}bass\` atau \n\`${m.prefix}tupai\``);
            }

            if (!/audio/.test(mime)) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Ubah Efek Audio:*\n` +
                              `  Perintah: Reply audio lalu ketik \n\`${m.prefix}${command}\`\n` +
                              `  Contoh: Reply audio/music/VN dengan \n\`${m.prefix}${command}\``);
            }

            
            await new Promise(resolve => setTimeout(resolve, 500));
            

            let media = await naze.downloadAndSaveMediaMessage(quoted);
            let ran = getRandom('.mp3');

            exec(`ffmpeg -i ${media} ${set} ${ran}`, async (err) => {
                fs.unlinkSync(media);
                if (err) {
                    
                    return m.reply(`🚨 *Terjadi Kesalahan, Yang Mulia!*\n\n` +
                                  `✨ Gagal memproses audio. Silakan coba lagi atau gunakan audio lain.\n` +
                                  `  Perintah: Reply audio lalu ketik \n\`${m.prefix}${command}\``);
                }

                let buff = fs.readFileSync(ran);
                await naze.sendMessage(m.chat, { audio: buff, mimetype: 'audio/mpeg' }, { quoted: m });
                
                fs.unlinkSync(ran);
            });
        } catch (e) {
            
            return m.reply(`🚨 *Terjadi Kesalahan, Yang Mulia!*\n\n` +
                          `✨ Gagal memproses audio. Silakan coba lagi atau gunakan audio lain.\n` +
                          `  Perintah: Reply audio lalu ketik \n\`${m.prefix}${command}\``);
        }
    }
};