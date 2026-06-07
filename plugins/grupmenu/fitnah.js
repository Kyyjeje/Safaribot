require('../../settings');
const axios = require('axios');

module.exports = {
    name: 'fitnah',
    alias: ['fitnah'],
    run: async ({ naze, m, args, text }) => {
        

        try {
            const [teks1, teks2, teks3] = text.split('|');
            if (!teks1 || !teks2 || !teks3) {
                await m.reply(`
🌟 Fitur Fitnah 🌟
━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *Input tidak lengkap!*
Gunakan perintah: *${m.prefix}${m.command} <pesan target>|<pesan mu>|<nomor/tag target>*
Contoh: *${m.prefix}${m.command} Hai|Wah, beneran?|@6281234567890*
━━━━━━━━━━━━━━━━━━━━━━━
                `);
                await naze.sendMessage(m.chat, { delete: m.key });
                return;
            }

            const createMention = (input) => {
                const number = input.replace(/[^0-9]/g, '');
                return number ? { id: `${number}@s.whatsapp.net`, text: `@${number}` } : { id: null, text: input };
            };

            const processText = (inputText) => {
                const words = inputText.split(/\s+/);
                let resultText = '';
                let mentions = [];

                words.forEach((word) => {
                    const mention = createMention(word);
                    if (mention.id) {
                        resultText += mention.text + ' ';
                        mentions.push(mention.id);
                    } else {
                        resultText += word + ' ';
                    }
                });

                return { text: resultText.trim(), mentions };
            };

            const pesanTarget = processText(teks1);
            const pesanMu = processText(teks2);
            const target = createMention(teks3);

            if (!target.id) {
                await m.reply(`
🌟 Fitur Fitnah 🌟
━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *Nomor atau tag target tidak valid!*
Gunakan perintah: *${m.prefix}${m.command} <pesan target>|<pesan mu>|<nomor/tag target>*
Contoh: *${m.prefix}${m.command} Hai|Wah, beneran?|@6281234567890*
━━━━━━━━━━━━━━━━━━━━━━━
                `);
                await naze.sendMessage(m.chat, { delete: m.key });
                return;
            }

            const ftelo = {
                key: {
                    fromMe: false,
                    participant: target.id,
                    ...(m.isGroup ? { remoteJid: m.chat } : { remoteJid: target.id })
                },
                message: { conversation: pesanTarget.text }
            };

            await naze.sendMessage(m.chat, {
                text: pesanMu.text,
                mentions: [...new Set([...pesanTarget.mentions, ...pesanMu.mentions, target.id])]
            }, { quoted: ftelo });
            await naze.sendMessage(m.chat, { delete: m.key });
        } catch (err) {
            await m.reply('⚠️ Terjadi kesalahan saat menjalankan fitnah.');
            await naze.sendMessage(m.chat, { delete: m.key });
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};