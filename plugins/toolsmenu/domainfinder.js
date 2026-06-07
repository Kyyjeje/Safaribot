require('../../settings');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

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

class PentestFinder {
    constructor() {
        this.ua = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36';
        this.baseHeaders = {
            'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132"',
            'sec-ch-ua-mobile': '?1',
            'sec-ch-ua-platform': '"Android"',
            'user-agent': this.ua,
            'accept-language': 'ms-MY,ms;q=0.9,en-US;q=0.8,en;q=0.7',
        };
    }

    async finder(targetUrl) {
        try {
            const cookie1 = await this.#getInitialCookie();
            const cookie2 = await this.#getAuthCookie(cookie1);
            const fullCookie = `${cookie1}; ${cookie2}`;
            const scanId = await this.#startScan(fullCookie, targetUrl);
            await this.#waitForResult(scanId, fullCookie);
            return this.scanResult;
        } catch (err) {
            console.error(`Error pada proses finder: ${err.message}`);
            throw err;
        }
    }

    async #getInitialCookie() {
        try {
            const res = await axios.get('https://pentest-tools.com/information-gathering/find-subdomains-of-domain', {
                headers: {
                    ...this.baseHeaders,
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'upgrade-insecure-requests': '1',
                },
            });
            return (res.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
        } catch (err) {
            console.error(`Error saat mengambil cookie awal: ${err.message}`);
            throw err;
        }
    }

    async #getAuthCookie(cookie1) {
        try {
            const res = await axios.post('https://pentest-tools.com/api/auth/token', '', {
                headers: {
                    ...this.baseHeaders,
                    cookie: cookie1,
                    'origin': 'https://pentest-tools.com',
                    'accept': '*/*',
                    'content-length': '0',
                },
            });
            return (res.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');
        } catch (err) {
            console.error(`Error saat mengambil cookie autentikasi: ${err.message}`);
            throw err;
        }
    }

    async #startScan(cookie, target) {
        try {
            const res = await axios.post(
                'https://pentest-tools.com/api/auth/scans',
                {
                    redirect_level: 'same_domain',
                    target_name: target,
                    tool_id: 20,
                    tool_params: {
                        scan_type: 'light',
                        web_details: true,
                        whois_info: true,
                    },
                },
                {
                    headers: {
                        ...this.baseHeaders,
                        cookie,
                        'origin': 'https://pentest-tools.com',
                        'content-type': 'application/json',
                        'accept': 'application/json',
                    },
                }
            );
            const id = res.data?.data?.created_id;
            if (!id) throw new Error('Scan creation failed.');
            return id;
        } catch (err) {
            console.error(`Error saat memulai scan: ${err.message}`);
            throw err;
        }
    }

    async #waitForResult(scanId, cookie) {
        try {
            while (true) {
                const res = await axios.get(`https://pentest-tools.com/api/auth/scans_internal/${scanId}`, {
                    headers: {
                        ...this.baseHeaders,
                        cookie,
                        'accept': 'application/json',
                    },
                });
                const progress = res.data?.data?.progress;
                this.scanResult = res.data?.data;
                if (progress >= 100) break;
                await new Promise(r => setTimeout(r, 5000));
            }
        } catch (err) {
            console.error(`Error saat menunggu hasil scan: ${err.message}`);
            throw err;
        }
    }
}

module.exports = {
    name: 'domainfinder',
    alias: ['domainfind'],
    description: '<domain>',
    run: async ({ naze, m }) => {
        try {
            

            const text = extractText(m).trim().split(/ +/).slice(1).join(' ');
            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `Masukkan URL!\nContoh: ${m.prefix}${m.command} abcdefg.my.id` }, { quoted: m });
            }

            const targetUrl = text.trim();
            if (!/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(targetUrl)) {
                
                return naze.sendMessage(m.chat, { text: `URL tidak valid!\nContoh: ${m.prefix}${m.command} abcdefg.my.id` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            const pentest = new PentestFinder();
            const result = await pentest.finder(targetUrl);

            let output = `🌐 *Hasil Pencarian Subdomain*\n\n` +
                         `🔍 *Domain*: ${targetUrl}\n` +
                         `⏰ *Waktu Scan*: ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss')} WIB\n` +
                         `📊 *Jumlah Subdomain*: ${result.output?.data?.subdomains?.length || 0}\n\n`;

            const subdomains = result.output?.data?.subdomains || [];
            if (subdomains.length === 0) {
                
                output += '❌ Tidak ditemukan subdomain.';
                return naze.sendMessage(m.chat, { text: output }, { quoted: m });
            }

            if (subdomains.length <= 10) {
                subdomains.forEach(subdomain => {
                    const ipAddress = subdomain.ip_address || '-';
                    output += `> 🖥️ domain: ${subdomain.hostname}\n` +
                              `> 🌐 IP: ${ipAddress}\n\n`;
                });
                
                return naze.sendMessage(m.chat, { text: output }, { quoted: m });
            } else {
                let docOutput = `🌐 Hasil Pencarian Subdomain\n\n` +
                                `🔍 Domain: ${targetUrl}\n` +
                                `⏰ Waktu Scan: ${moment().tz('Asia/Jakarta').format('DD/MM/YYYY HH:mm:ss')} WIB\n` +
                                `📊 Jumlah Subdomain: ${subdomains.length}\n\n`;
                subdomains.forEach((subdomain, index) => {
                    const ipAddress = subdomain.ip_address || '-';
                    docOutput += `${index + 1}. 🖥️ Domain: ${subdomain.hostname}\n` +
                                 `   🌐 IP: ${ipAddress}\n\n`;
                });
                docOutput += `🔗 Search By: ${global.botname}`;

                const filePath = path.join(__dirname, `subdomains_${targetUrl}.txt`);
                fs.writeFileSync(filePath, docOutput);

                
                await naze.sendMessage(m.chat, {
                    document: { url: filePath },
                    mimetype: 'text/plain',
                    fileName: `Subdomains_${targetUrl}.txt`,
                    caption: `Hasil pencarian subdomain untuk *${targetUrl}* dikirim sebagai dokumen karena jumlahnya lebih dari 10.`
                }, { quoted: m });
                
                fs.unlinkSync(filePath);
            }
        } catch (err) {
            console.error(`Kesalahan pada fitur domainfinder: ${err.message}`);
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};