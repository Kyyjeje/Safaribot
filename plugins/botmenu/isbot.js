const { globalSettings } = require('../../settings');

module.exports = {
    name: 'isbot',
    alias: ['cekbot'],
    description: '<reply/no reply>',
    run: async ({ naze, m }) => {
        try {
            

            const botNumber = await naze.decodeJid(naze.user.id);

            const normalizeJid = (jid) => jid?.replace(/:.*$/, '').toLowerCase() || '';

            const getDevice = (id) => {
                if (/^[A-Z0-9]{18}$/.test(id)) return 'ios';
                if (/^[A-Z0-9]{20}$/.test(id)) return 'web';
                if (/^[A-Z0-9]{21,32}$/.test(id)) return 'android';
                return 'unknown';
            };

            const calculateSwitchRate = (id) => {
                if (!id || id.length < 2) return { switchCount: 0, switchRate: 0 };
                let switchCount = 0;
                for (let i = 0; i < id.length - 1; i++) {
                    const currentChar = id[i];
                    const nextChar = id[i + 1];
                    const isCurrentLetter = /[A-Z]/.test(currentChar);
                    const isNextLetter = /[A-Z]/.test(nextChar);
                    const isCurrentDigit = /[0-9]/.test(currentChar);
                    const isNextDigit = /[0-9]/.test(nextChar);
                    if ((isCurrentLetter && isNextDigit) || (isCurrentDigit && isNextLetter)) {
                        switchCount++;
                    }
                }
                const switchRate = (switchCount / (id.length - 1)) * 100;
                return { switchCount, switchRate };
            };

            const checkIsBot = (id, sender, msg, isQuoted = false) => {
                if (!id || !sender) return { isBot: false, reasons: ['ID atau sender tidak valid'] };

                const cleanedId = id.includes('-') ? id.split('-').pop() : id;
                const normalizedSender = normalizeJid(sender);
                const normalizedBotNumber = normalizeJid(botNumber);
                const targetMsg = isQuoted ? m.quoted : m;
                let reasons = [];

                const isSelf = isQuoted
                    ? (m.quoted.key?.fromMe || m.quoted.fromMe) ||
                      (normalizedSender && normalizedSender === normalizedBotNumber) ||
                      (m.quoted.isGroup && (m.msg.contextInfo?.participant === normalizedBotNumber || normalizedSender === normalizedBotNumber))
                    : m.fromMe || normalizedSender === normalizedBotNumber || (m.isGroup && m.key.participant === normalizedBotNumber);
                if (isSelf) reasons.push('Pesan dari bot sendiri');

                const hasLowercase = /[a-z]/.test(cleanedId);
                const hasSymbol = /[^A-Za-z0-9]/.test(cleanedId);
                if (hasLowercase || hasSymbol) reasons.push(`ID mengandung ${hasLowercase ? 'huruf kecil' : ''}${hasLowercase && hasSymbol ? ' dan ' : ''}${hasSymbol ? 'simbol' : ''}, khas bot`);

                const hasBotContext = targetMsg?.contextInfo?.isBotMessage === true ||
                                     targetMsg?.contextInfo?.quotedMessage?.fromBot === true ||
                                     targetMsg?.contextInfo?.expiration === 0;
                if (hasBotContext) reasons.push('ContextInfo menunjukkan tanda bot (isBotMessage atau expiration 0)');

                const hasBotStructure = targetMsg?.protocolMessage || targetMsg?.messageStubType || targetMsg?.senderKeyDistributionMessage;
                if (hasBotStructure) reasons.push('Struktur pesan khas bot (protocolMessage, stub, atau senderKey)');

                if (isQuoted && m.quoted) {
                    const quotedText = m.quoted.msg?.conversation || m.quoted.msg?.extendedTextMessage?.text || '';
                    const isCommandResponse = quotedText.startsWith('.') && targetMsg.msg?.conversation !== quotedText;
                    if (isCommandResponse) {
                        const timestamp = targetMsg.msg?.messageTimestamp ? targetMsg.msg.messageTimestamp * 1000 : Date.now();
                        const responseTime = (timestamp - (m.quoted.msg?.messageTimestamp * 1000 || 0)) / 1000;
                        reasons.push(`Respons command (${quotedText.slice(0, 10)}...), waktu respons: ${responseTime.toFixed(2)} detik`);
                        if (responseTime < 0.3) reasons.push('Respons terlalu cepat (<0.3 detik), khas bot');
                    }
                }

                const deviceMismatch = targetMsg?.contextInfo?.appVersion && id.length !== (targetMsg.contextInfo.appVersion.includes('Android') ? 32 : 20);
                if (deviceMismatch) reasons.push(`Ketidaksesuaian device: appVersion (${targetMsg.contextInfo.appVersion}) tidak cocok dengan panjang ID (${id.length})`);

                const device = getDevice(cleanedId);
                const isUnknownDevice = device === 'unknown';
                if (isUnknownDevice) reasons.push(`Panjang ID (${cleanedId.length} karakter) tidak sesuai dengan perangkat yang dikenal (iOS: 18, Web/Desktop: 20, Android: 21-32), mencurigakan untuk bot`);

                const invalidHexChars = cleanedId.match(/[G-Z]/g);
                const isInvalidHex = !!invalidHexChars;
                if (isInvalidHex) reasons.push(`ID mengandung karakter di luar format heksadesimal (${invalidHexChars.join(', ')}), 90-100% bukan ID user asli`);

                const { switchCount, switchRate } = calculateSwitchRate(cleanedId);
                reasons.push(`Rate keacakan: ${switchRate.toFixed(2)}% (${switchCount} pergantian huruf/angka)`);
                const isLowSwitchRate = switchRate < 20;
                if (isLowSwitchRate) reasons.push(`Rate keacakan terlalu rendah (${switchRate.toFixed(2)}%), pola terlalu monoton, khas bot`);

                const letters = (cleanedId.match(/[A-Z]/g) || []).length;
                const digits = (cleanedId.match(/[0-9]/g) || []).length;
                const totalChars = letters + digits;
                const letterRatio = totalChars > 0 ? (letters / totalChars) * 100 : 0;
                const digitRatio = totalChars > 0 ? (digits / totalChars) * 100 : 0;
                const isDistributionImbalanced = letterRatio >= 95 || digitRatio >= 95;
                if (totalChars > 0) {
                    reasons.push(`Distribusi karakter: ${letters} huruf (${letterRatio.toFixed(2)}%), ${digits} angka (${digitRatio.toFixed(2)}%)`);
                    if (isDistributionImbalanced) reasons.push(`Distribusi terlalu timpang (${letterRatio >= 95 ? 'terlalu banyak huruf' : 'terlalu banyak angka'}), khas bot`);
                }

                const botPrefixes = ['BAE5', 'WOLE', 'B1EY', '3EB0', 'HSK', 'FMSG', 'MSG'];
                const startsWithBotPrefix = botPrefixes.some(prefix => cleanedId.startsWith(prefix));
                if (startsWithBotPrefix) reasons.push(`Prefix Bot: ID diawali prefix bot: ${cleanedId.slice(0, 4)}`);
                else reasons.push('Prefix Bot: ID tidak diawali prefix bot');

                const hasButtonMessage = (isQuoted ? m.quoted?.interactiveMessage?.nativeFlowMessage?.buttons?.length > 0 || m.quoted?.buttonsMessage?.buttons?.length > 0 : m.interactiveMessage?.nativeFlowMessage?.buttons?.length > 0 || m.buttonsMessage?.buttons?.length > 0);
                if (hasButtonMessage) reasons.push('Button Message: Pesan berisi tombol interaktif (buttonsMessage atau nativeFlowMessage)');

                const isBot = hasBotContext ||
                              hasBotStructure ||
                              deviceMismatch ||
                              isUnknownDevice ||
                              isInvalidHex ||
                              isDistributionImbalanced ||
                              isLowSwitchRate ||
                              startsWithBotPrefix ||
                              hasButtonMessage ||
                              (reasons.some(r => r.includes('Waktu kirim') || r.includes('Frekuensi') || r.includes('Respons')));

                if (!isBot && id.length >= 21 && id.length <= 32 && /^[0-9A-F]+$/.test(id) && !isDistributionImbalanced) {
                    reasons = [`Panjang ID (${id.length} karakter) sesuai Android (21-32), format heksadesimal valid, distribusi seimbang, tidak ada jejak bot`];
                    return { isBot: false, reasons };
                }

                return { isBot, reasons };
            };

            let targetUser, targetId, isBotResult, reasons, displayText;

            if (m.quoted) {
                targetUser = m.quoted.sender;
                targetId = m.quoted.id;
                const result = checkIsBot(m.quoted.id, targetUser, m.quoted.msg, true);
                isBotResult = result.isBot;
                reasons = result.reasons;
                displayText = `📨 *Pesan yang di-reply*:\n🔑 *Key ID*: ${targetId}\n👤 *Pengirim*: ${targetUser.split('@')[0]}\n`;
            } else {
                targetUser = m.sender;
                targetId = m.id;
                const result = checkIsBot(m.id, targetUser, m.msg);
                isBotResult = result.isBot;
                reasons = result.reasons;
                displayText = `👤 *Pengirim perintah*: ${targetUser.split('@')[0]}\n🔑 *Key ID*: ${targetId}\n`;
            }

            const resultText = isBotResult
                ? `🤖 *Hasil*: *BOT DETECTED!*\n⚠️ *Alasan Terdeteksi*:\n${reasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
                : `✅ *Hasil*: *Bukan Bot*\n😊 *Alasan*:\n${reasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;

            const finalMessage = `
╔═════[ *DETEKSI BOT* ]═════╗
${displayText}---
${resultText}
            `.trim();

            await naze.sendMessage(m.chat, {
                text: finalMessage,
                contextInfo: {
                    externalAdReply: {
                        title: '🤖 Bot Detector',
                        body: isBotResult ? '⚠️ Bot Terdeteksi!' : '✅ User Asli Terverifikasi',
                        thumbnailUrl: global.thumbnailisbot,
                        mediaType: 1,
                        previewType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });
            
        } catch (err) {
            
            await global.handleError(naze, m, err, {
                sendRawError: true,
                useGemini: true
            });
        }
    }
};