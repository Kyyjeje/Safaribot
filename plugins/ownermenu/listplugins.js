const fs = require('fs');
const path = require('path');
require('../../settings');
const { generateWAMessageFromContent, proto } = require('baileys');

module.exports = {
    name: 'listplugin',
    alias: ['pluginlist','listplugins'],
    description: '[nama folder]',
    run: async ({ naze, m }) => {
        try {
            
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            

            const from = m.chat || m.sender;
            const pluginsDir = './plugins';
            const messageContent = m.text || m.message?.interactiveResponseMessage?.singleSelectReply?.selectedRowId || '';
            const args = messageContent.trim().split(/ +/).slice(1);
            const targetCategory = args[0] ? args[0].toLowerCase() : null;

            await naze.sendMessage(from, { text: '*⏳ Memproses daftar plugin, harap tunggu...*' }, { quoted: m });

            const categories = fs.readdirSync(pluginsDir).filter(folder => fs.statSync(path.join(pluginsDir, folder)).isDirectory());
            if (targetCategory && !categories.includes(targetCategory)) {
                
                return naze.sendMessage(from, { text: `*Format salah!* Folder *${targetCategory}* tidak ditemukan.\n\nGunakan perintah:\n\`${m.prefix}${m.command} <nama folder>\`\n> Contoh: \`${m.prefix}${m.command} admin\`` }, { quoted: m });
            }

            let sections = [];
            let pluginList = [];
            let counter = 1;

            const processCategory = targetCategory ? [targetCategory] : categories;
            processCategory.forEach(category => {
                const categoryPath = path.join(pluginsDir, category);
                const pluginFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js') && file !== 'index.js');
                let rows = [];

                if (pluginFiles.length > 0) {
                    pluginFiles.forEach(file => {
                        const pluginName = file.replace('.js', '');
                        pluginList.push({ number: counter, file: path.join(categoryPath, file) });
                        rows.push({ title: `${counter}. ${pluginName}`, id: `getplugin ${counter}` });
                        counter++;
                    });
                    sections.push({ title: `${category.toUpperCase()}`, rows });
                }
            });

            if (pluginList.length === 0) {
                
                return naze.sendMessage(from, { text: '⚠️ Tidak ada plugin yang tersedia.' }, { quoted: m });
            }

            global.pluginListCache = pluginList;

            const bet = { title: '📂 DAFTAR PLUGIN BOT', sections };
            const teks = `╔═〇 *🔧 LIST PLUGIN* 
╠═════════〇
╠» 🤖 *Bot:* BangsulBotz  
╠» 🔢 *Versi:* 1.0  
╠» ✅ *Status:* Aktif  
╠» 📂 *Total Plugin:* ${pluginList.length}  
╚═════════════════〇

🔥 *Fitur Eksklusif untuk Owner!*  
- Tombol di bawah ini hanya bisa digunakan oleh *Owner Bot* 
- Berguna untuk melihat dan mengambil file plugin tertentu.  

📌 *Cara Menggunakan:*  
1️⃣ Pilih kategori plugin yang tersedia.  
2️⃣ Klik nama plugin untuk mendapatkan file-nya.  
3️⃣ Plugin yang dipilih akan dikirimkan dalam bentuk file.  

⚠️ *Catatan:* 
"Jika kamu bukan owner, tombol ini tidak akan berfungsi!""

⬇️ *Silakan pilih kategori plugin:*`;

            const msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: proto.Message.InteractiveMessage.create({
                            contextInfo: { mentionedJid: [m.sender], forwardingScore: 999999, isForwarded: true },
                            body: proto.Message.InteractiveMessage.Body.create({ text: teks }),
                            footer: proto.Message.InteractiveMessage.Footer.create({ text: 'By BangsulStart' }),
                            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                buttons: [{ name: 'single_select', buttonParamsJson: JSON.stringify(bet) }]
                            })
                        })
                    }
                }
            }, { quoted: m });

            await naze.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
            
        } catch (err) {
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};