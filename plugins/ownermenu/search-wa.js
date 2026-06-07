require('../../settings');

module.exports = {
    name: 'search-wa',
    alias: ['searchwa', 'wa-search', 'findwa'],
    description: 'Mencari nomor WhatsApp aktif berdasarkan provider Indonesia. Format: search-wa <provider>, <jumlah>',
    run: async ({ naze, m }) => {
        try {
            const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
            if (!isOwner) {
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

            const text = m.text?.split(' ').slice(1).join(' ') || (m.quoted?.text || '');
            if (!text) {
                return naze.sendMessage(m.chat, {
                    text: `🔍 *Cari Nomor WhatsApp Aktif*\n\n` +
                          `📋 *Format:* ${m.prefix}${m.command} <provider>, <jumlah>\n\n` +
                          `📱 *Provider Tersedia:*\n` +
                          `• Telkomsel (0812, 0813, 0821, 0822, 0823, 0851, 0852, 0853)\n` +
                          `• XL (0812, 0813, 0814, 0815, 0816, 0856, 0857, 0858, 0859, 0878, 0879)\n` +
                          `• Axis (0838, 0831, 0837, 0832, 0859)\n` +
                          `• Smartfren (0881, 0882, 0883, 0884, 0885, 0886, 0887, 0888, 0896, 0897, 0898, 0899)\n` +
                          `• Indosat (0855, 0856, 0857, 0858, 0885, 0886, 0887, 0888, 0889, 0896, 0897, 0898, 0899)\n` +
                          `• Tri (0855, 0856, 0857, 0858, 0859, 0895, 0896, 0897, 0898, 0899)\n\n` +
                          `💡 *Contoh:*\n${m.prefix}${m.command} telkomsel, 50\n${m.prefix}${m.command} xl, 100\n\n` +
                          `⚠️ *Hanya owner* yang dapat menggunakan fitur ini.\n` +
                          `⏱️ *Batasan:* Maksimal 500 nomor per pencarian.`,
                    contextInfo: {
                        externalAdReply: {
                            title: '🔍 Cari Nomor WA Aktif',
                            body: 'Pencarian Nomor WhatsApp Indonesia',
                            thumbnailUrl: global.getRandomThumbnailUrl(),
                            mediaType: 1,
                            previewType: 1,
                            renderLargerThumbnail: false
                        }
                    }
                }, { quoted: m });
            }

            const [provider, jumlahStr] = text.split(',').map(item => item.trim().toLowerCase());
            if (!provider || !jumlahStr) {
                return naze.sendMessage(m.chat, {
                    text: `❌ *Format Salah!*\n\nGunakan format: ${m.prefix}${m.command} <provider>, <jumlah>\nContoh: ${m.prefix}${m.command} telkomsel, 50`,
                    quoted: m
                });
            }

            const jumlah = parseInt(jumlahStr);
            if (isNaN(jumlah) || jumlah < 1 || jumlah > 500) {
                return naze.sendMessage(m.chat, {
                    text: `❌ *Jumlah Tidak Valid!*\n\nGunakan angka 1-500\nContoh: ${m.prefix}${m.command} telkomsel, 50`,
                    quoted: m
                });
            }

            const providerCodes = {
                telkomsel: ['0812', '0813', '0821', '0822', '0823', '0851', '0852', '0853'],
                xl: ['0812', '0813', '0814', '0815', '0816', '0856', '0857', '0858', '0859', '0878', '0879'],
                axis: ['0838', '0831', '0837', '0832', '0859'],
                smartfren: ['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888', '0896', '0897', '0898', '0899'],
                indosat: ['0855', '0856', '0857', '0858', '0885', '0886', '0887', '0888', '0889', '0896', '0897', '0898', '0899'],
                tri: ['0855', '0856', '0857', '0858', '0859', '0895', '0896', '0897', '0898', '0899']
            };

            if (!providerCodes[provider]) {
                return naze.sendMessage(m.chat, {
                    text: `❌ *Provider Tidak Ditemukan!*\n\nProvider tersedia:\n${Object.keys(providerCodes).map(p => `• ${p.charAt(0).toUpperCase() + p.slice(1)}`).join('\n')}\n\nContoh: ${m.prefix}${m.command} telkomsel, 50`,
                    quoted: m
                });
            }

            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            const registeredNumbers = [];
            const maxAttempts = Math.min(jumlah * 5, 2500);
            let attempts = 0; // Deklarasi attempts di sini
            const codes = providerCodes[provider];
            const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);

            while (registeredNumbers.length < jumlah && attempts < maxAttempts) {
                const randomCode = codes[Math.floor(Math.random() * codes.length)];
                const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
                const number = `62${randomCode.slice(1)}${randomDigits}`;

                try {
                    const result = await naze.onWhatsApp(number + '@s.whatsapp.net');
                    if (result.length > 0 && result[0].exists) {
                        registeredNumbers.push({
                            number: `+${number}`,
                            jid: result[0].jid,
                            lid: result[0].lid || 'N/A'
                        });

                        if (registeredNumbers.length % 10 === 0) {
                            await naze.sendMessage(m.chat, {
                                text: `🔍 *Progres Pencarian*\n\n📱 Provider: *${providerName}*\n✅ Ditemukan: *${registeredNumbers.length}/${jumlah}*\n⏳ Percobaan: *${attempts}/${maxAttempts}*`,
                                quoted: m
                            });
                        }
                    }
                } catch (error) {
                    // Lanjutkan ke nomor berikutnya jika ada error
                }
                attempts++;

                if (attempts % 10 === 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

            const currentDate = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
            let replyMessage = `📱 *Hasil Pencarian Nomor ${providerName} Aktif* 📱\n\n` +
                              `🔍 *Provider:* ${providerName}\n` +
                              `⏰ *Waktu:* ${currentDate}\n` +
                              `🔢 *Ditemukan:* ${registeredNumbers.length}/${jumlah}\n` +
                              `📊 *Percobaan:* ${attempts}\n` +
                              `─────────────────────\n\n`;

            if (registeredNumbers.length === 0) {
                replyMessage += `❌ *Tidak ada nomor aktif ditemukan* setelah ${maxAttempts} percobaan.\n` +
                                `💡 *Saran:* Coba provider lain atau kurangi jumlah target.`;
            } else {
                registeredNumbers.forEach((entry, index) => {
                    replyMessage += `${index + 1}. *${entry.number}*\n` +
                                    `   JID: \`${entry.jid}\`\n` +
                                    `   LID: \`${entry.lid}\`\n` +
                                    `   ───────────────────\n`;
                });
                replyMessage += `\n✅ *Selesai!* Ditemukan ${registeredNumbers.length} nomor aktif ${providerName}.`;
            }

            // Kirim pesan hasil
            await naze.sendMessage(m.chat, {
                text: replyMessage,
                contextInfo: {
                    externalAdReply: {
                        title: `🔍 Hasil Pencarian ${providerName}`,
                        body: `${registeredNumbers.length} Nomor Aktif Ditemukan`,
                        thumbnailUrl: global.getRandomThumbnailUrl(),
                        mediaType: 1,
                        previewType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });

            // Kirim file JSON
            if (registeredNumbers.length > 0) {
                const jsonData = Buffer.from(JSON.stringify(registeredNumbers, null, 2));
                const fileName = `wa_numbers_${provider}_${Date.now()}.json`;
                await naze.sendMessage(m.chat, {
                    document: jsonData,
                    mimetype: 'application/json',
                    fileName: fileName
                }, { quoted: m });
                await naze.sendMessage(m.chat, {
                    text: `📁 *File JSON Terkirim:*\n${fileName}\n\nBerisi ${registeredNumbers.length} nomor aktif ${providerName}.`,
                    quoted: m
                });
            }

        } catch (error) {
            await naze.sendMessage(m.chat, {
                text: `⚠️ *Error Pencarian*\n\nPesan: ${error.message}\n\n💡 Coba lagi atau hubungi developer.`,
                quoted: m
            });
            await global.handleError(naze, m, error, { sendRawError: true, useGemini: true });
        }
    }
};