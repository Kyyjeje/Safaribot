require('../../settings');
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    name: 'getchimage',
    alias: ['getchimg', 'getchanelimage', 'getchanelimg', 'chimage', 'chimg', 'chanelimage', 'chanelimg', 'imagechanel', 'imgchanel', 'imagech', 'imagechanel'],
    description: 'jid/<url chanel>',
    run: async ({ naze, m, args, text }) => {
        const botNumber = await naze.decodeJid(naze.user.id);
        const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

        try {
            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            if (!text) {
                
                return m.reply(`🚨 *Perintah Salah, Yang Mulia!*\n\n` +
                              `✨ *Ambil Gambar Channel:*\n` +
                              `  Perintah: \n- \`${m.prefix}${m.command} <jid atau URL channel>\`\n` +
                              `  Contoh: \n- \`${m.prefix}${m.command} abcd@newsletter\`\n` +
                              `  Atau: \n- \`${m.prefix}${m.command} https://whatsapp.com/channel/abcdefgh\``);
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
            

            let jid = text;
            let channelId;

            if (text.includes('https://whatsapp.com/channel/')) {
                const urlParts = text.split('https://whatsapp.com/channel/')[1].split('/');
                channelId = urlParts[0];
                if (!channelId) {
                    
                    return naze.sendMessage(m.chat, {
                        text: '🚨 Kode invite channel tidak ditemukan di URL, yang mulia.\nContoh: https://whatsapp.com/channel/0029VanhMDo42DcjiRGJOc2m',
                        quoted: m
                    });
                }
                const metadata = await naze.newsletterMetadata('invite', channelId);
                if (!metadata || !metadata.id) {
                    
                    return naze.sendMessage(m.chat, {
                        text: '🚨 Gagal mendapatkan ID channel dari URL, yang mulia. Pastikan URL valid dan channel masih ada.',
                        quoted: m
                    });
                }
                jid = metadata.id;
            } else if (!jid.endsWith('@newsletter')) {
                
                return naze.sendMessage(m.chat, {
                    text: '🚨 JID tidak valid, yang mulia. Harus berakhiran "@newsletter".\nContoh: abcd@newsletter',
                    quoted: m
                });
            }

            const metadata = await naze.newsletterMetadata('jid', jid);
            if (!metadata || !metadata.invite) {
                
                return naze.sendMessage(m.chat, {
                    text: '🚨 Gagal mendapatkan metadata channel, yang mulia. Pastikan JID valid dan channel masih ada.',
                    quoted: m
                });
            }
            const channelName = metadata.name || 'Tidak diketahui';
            channelId = metadata.invite;

            const response = await axios.get(`https://whatsapp.com/channel/${channelId}`);
            const $ = cheerio.load(response.data);
            const image = $('meta[property="og:image"]').attr('content') || '';

            if (!image) {
                
                return naze.sendMessage(m.chat, {
                    text: `⚠️ *Gambar tidak ditemukan!* Channel "${channelName}" mungkin tidak memiliki gambar.`,
                    quoted: m
                });
            }

            const teks = `🖼️ *Gambar Channel Ditemukan!*\n\n` +
                         `📢 *Channel*: ${channelName}\n` +
                         `🔗 *JID*: ${jid}\n` +
                         `🌐 *URL Gambar*: ${image}`;
            const interactiveButtons = [
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: 'Salin URL Gambar',
                        id: 'copy_image_url',
                        copy_code: image
                    })
                },
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: 'Buka Gambar',
                        url: image
                    })
                }
            ];

            await naze.sendMessage(m.chat, {
                image: { url: image },
                caption: teks,
                title: '📸 Gambar Channel',
                footer: `🔍 Gambar channel "${channelName}" berhasil diperoleh!`,
                interactiveButtons,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: jid,
                        newsletterName: channelName
                    }
                },
                quoted: m
            });
            
        } catch (e) {
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};