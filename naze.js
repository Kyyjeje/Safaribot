//waktu daily nya ada di baris 1531.

// Modul bawaan Node.js
const fs = require('fs');
const path = require('path');
const util = require('util');
const { exec } = require('child_process');
const { performance } = require('perf_hooks');

// Modul pihak ketiga
const axios = require('axios');
const chalk = require('chalk');
const fse = require('fs-extra');
const ffmpeg = require('fluent-ffmpeg');
const moment = require('moment-timezone');
const speed = require('performance-now');
//const ffmpegPath = require('ffmpeg-static');
const { generateWAMessage,generateMessageID  } = require('baileys');

// Impor lokal (file proyek)
const prem = require('./src/premium');
const { run } = require('./plugins/downloadmenu/tiktok.js');
const { generateCustomKeyId } = require('./src/idcustom');
const { runtime, formatDate } = require('./lib/function.js');
const { LoadDataBase, GroupUpdate } = require('./src/message.js');
const { jadwalPuasa, pesansahur, pesanimsak, pesanmaghrib, haditsSahur, haditsImsak, haditsMaghrib } = require('./src/puasaconfig');

// Database dan konfigurasi
require('./settings');
const kataKotor = require('./database/kataKotor');
const premium = JSON.parse(fs.readFileSync('./database/premium.json'));
const Video = JSON.parse(fs.readFileSync('./data/media/database/video.json'));
const Image = JSON.parse(fs.readFileSync('./data/media/database/image.json'));
const VoiceNote = JSON.parse(fs.readFileSync('./data/media/database/vn.json'));
const Sticker = JSON.parse(fs.readFileSync('./data/media/database/sticker.json'));
const textListPath = path.join(__dirname, './data/media/database/textlist.json');

// Path file
const gameFile = './database/games.json';
const blockUserPath = './database/block_user.json';

let menfes = db.game.menfes = []

//ffmpeg.setFfmpegPath(ffmpegPath); //vps/idx.dev
chalk.level = 3;

module.exports = naze = async (naze, m, chatUpdate,message, store) => {
try {
	global.blockedChats = new Set(loadBlockedUsers());
	
	
	//const msg = message.messages[0];
	await LoadDataBase(naze, m);
	await GroupUpdate(naze, m, store);
	const body = (m.type === 'conversation') ? m.message?.conversation || '' : 
             (m.type === 'imageMessage') ? m.message?.imageMessage?.caption || '' : 
             (m.type === 'videoMessage') ? m.message?.videoMessage?.caption || '' : 
             (m.type === 'extendedTextMessage') ? m.message?.extendedTextMessage?.text || '' : 
             (m.type === 'buttonsResponseMessage') ? m.message?.buttonsResponseMessage?.selectedButtonId || '' : 
             (m.type === 'listResponseMessage') ? m.message?.listResponseMessage?.singleSelectReply?.selectedRowId || '' : 
             (m.type === 'templateButtonReplyMessage') ? m.message?.templateButtonReplyMessage?.selectedId || '' : 
             (m.type === 'messageContextInfo') ? (m.message?.buttonsResponseMessage?.selectedButtonId || m.message?.listResponseMessage?.singleSelectReply?.selectedRowId || m.text || '') : 
             (m.type === 'editedMessage') ? (m.message?.editedMessage?.message?.protocolMessage?.editedMessage?.extendedTextMessage?.text || m.message?.editedMessage?.message?.protocolMessage?.editedMessage?.conversation || '') : 
             (m.type === 'protocolMessage') ? (m.message?.protocolMessage?.type === 0 ? 'deleteMessage' : m.message?.protocolMessage?.type === 14 ? 'editMessage' : `protocolMessage (type: ${m.message?.protocolMessage?.type})`) : 
             '';
	const budy = (typeof m.text === 'string' ? m.text : '');
	const botNumber = await naze.decodeJid(naze.user.id);
	const prefix = db.set[botNumber].multiprefix ? '' : /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@()#,'"*+÷/\%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@()#,'"*+÷/\%^&.©^]/gi)[0] : '';
	const isCmd = (body && body.startsWith(prefix)) ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : (body ? body.trim().split(/ +/).shift().toLowerCase() : '');
	const isCreator = isOwner = [botNumber, ...owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
	const args = body ? body.trim().split(/ +/).slice(1) : [];
	const quoted = m.quoted ? m.quoted : m;
	const command = isCreator ? (body ? body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase() : '') : (isCmd ? body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase() : '');
	const text = q = args.join(' ');
	const setv = pickRandom(listv);
	const time_now = new Date();
	const time_end = 60000 - (time_now.getSeconds() * 1000 + time_now.getMilliseconds());
	const sender = m.key.remoteJid;
	const isGroup = sender.endsWith('@g.us');
	const isStatus = sender === 'status@broadcast';
	const tiktokRegex = /(?:https?:\/\/(?:www\.)?(?:tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com)\/[^\s]+)/i;
	const instagramRegex = /(?:https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv|[^\/]+)\/[^\s]+)/i;
	const processedMessages = new Set();
	const tiktokPluginAliases = ['download','dl','downloader','ttmp3', '.ttmp3', 'tiktokdown', 'ttdown', 'ttdl', 'tt', 'ttmp4', 'ttvideo', 'tiktokmp4', 'tiktokvideo','.tiktok','tiktok', '.tiktokdown', '.ttdown', '.ttdl', '.tt', '.ttmp4', '.ttvideo', '.tiktokmp4', '.tiktokvideo'];
	const instagramPluginAliases = ['getmedia','ig-test','ig2','ig3','dl', '.getmedia', 'ig','downloader','download','.downloader','.download', '.ig', 'instagram', '.instagram', 'igdl', '.igdl', 'igdownloader', '.igdownloader'];
	const tanggalIdulFitri = moment.tz('2025-03-29 00:00:00', 'Asia/Jakarta'); 
	const activeTimers = {};
	let incomingMessage = (m.text || '').toLowerCase();

	if (!m || !m.key || !m.key.remoteJid) {return;}
	if (!store.messages[m.key.remoteJid]?.array?.some(a => a.key.id === m.key.id)) 
	if (!global.db) throw new Error('Global database (global.db) is not defined.');
	
	
	function pickRandom(list) {
		return list[Math.floor(Math.random() * list.length)];
	}
	function deteksiKataKotor(body) {
		return kataKotor.find(kata => new RegExp(`\\b${kata}\\b`, 'i').test(body)) || null;
	}
	function loadGames() {
		if (fs.existsSync(gameFile)) {
			const data = fs.readFileSync(gameFile, 'utf8');
			return JSON.parse(data);
		}
		return {};
	}
	function saveGames(games) {
		const data = JSON.stringify(games, null, 2);
		fs.writeFileSync(gameFile, data, 'utf8');
	}
	function loadBlockedUsers() {
		if (!fs.existsSync(blockUserPath)) {
			fs.writeFileSync(blockUserPath, JSON.stringify([])); // Buat file jika belum ada
			return [];
		}
		return JSON.parse(fs.readFileSync(blockUserPath, 'utf8'));
	}
	function deteksiPanggilanBot(body) {
		return global.panggilBot.some(nama => body.toLowerCase().includes(nama));
	}
	let games = loadGames();
	//auto-download
	async function processSocialMediaUrl(naze, m, budy, botNumber) {
    if (!m || !m.key || !m.key.id) {
        console.log('[DEBUG] Pesan tidak valid atau tidak memiliki key:', m);
        return;
    }

    const messageId = m.key.id;

    // Cek duplikat pesan
    if (processedMessages.has(messageId)) {
        console.log(`[DEBUG] Skipping duplicate message ID: ${messageId}`);
        return;
    }
    processedMessages.add(messageId);
    setTimeout(() => processedMessages.delete(messageId), 60000); // Hapus dari Set setelah 1 menit

    const budyLower = budy.toLowerCase().trim();

    // Deteksi URL TikTok hanya jika autoDownload diaktifkan di db
    if (db.set[botNumber].autoDownload) {
        // Deteksi URL TikTok
        if (tiktokRegex.test(budy)) {
            const startsWithTiktokAlias = tiktokPluginAliases.some(alias => 
                budyLower.startsWith(alias + ' ') || budyLower === alias
            );

            if (startsWithTiktokAlias) {
                console.log(`[DEBUG] Detected TikTok alias ${budyLower.split(' ')[0]}, skipping URL detection`);
                return;
            }

            const tiktokUrl = budy.match(tiktokRegex)[0];
            await naze.sendMessage(m.chat, { text: `⏳ *Mendeteksi URL TikTok!*` }, { quoted: m });

            try {
                const tiktokPlugin = require('./plugins/downloadmenu/tiktok.js');
                const argsToSend = [tiktokUrl];
                const textToSend = tiktokUrl;
                console.log(`[DEBUG] Sending to tt.js - args: ${JSON.stringify(argsToSend)}, text: ${textToSend}`);

                await new Promise(resolve => setTimeout(resolve, 2000));
                await tiktokPlugin.run({ naze, m, args: argsToSend, text: textToSend });
            } catch (err) {
                console.error('Error auto-download TikTok:', err);
                await naze.sendMessage(m.chat, { text: '⚠️ *Gagal mendownload TikTok!* Coba lagi nanti.' }, { quoted: m });
            }
        }

        // Deteksi URL Instagram hanya jika autoDownload diaktifkan di db
        if (instagramRegex.test(budy)) {
            const startsWithInstagramAlias = instagramPluginAliases.some(alias => 
                budyLower.startsWith(alias + ' ') || budyLower === alias
            );

            if (startsWithInstagramAlias) {
                console.log(`[DEBUG] Detected Instagram alias ${budyLower.split(' ')[0]}, skipping URL detection`);
                return;
            }

            const instagramUrl = budy.match(instagramRegex)[0];
            await naze.sendMessage(m.chat, { text: `⏳ *Mendeteksi URL Instagram!*` }, { quoted: m });

            try {
                const instagramPlugin = require('./plugins/downloadmenu/instagram.js'); // Gunakan downloadvideo.js
                const argsToSend = [instagramUrl];
                const textToSend = instagramUrl;
                console.log(`[DEBUG] Sending to downloadvideo.js - args: ${JSON.stringify(argsToSend)}, text: ${textToSend}`);

                await new Promise(resolve => setTimeout(resolve, 2000));
                await instagramPlugin.run({ naze, m, args: argsToSend, text: textToSend });
            } catch (err) {
                console.error('Error auto-download Instagram:', err);
                await naze.sendMessage(m.chat, { text: '⚠️ *Gagal mendownload Instagram!* Coba lagi nanti.' }, { quoted: m });
            }
        }
    } else {
        //console.log(`[DEBUG] Auto-download tidak diaktifkan untuk botNumber: ${botNumber}`);
    }
}

await processSocialMediaUrl(naze, m, budy, botNumber);

	const sendRestoredMessage = async (naze, chatId, chats, label) => {
		chats.msg.contextInfo = { 
			mentionedJid: [chats.key.participant], 
			isForwarded: true, 
			forwardingScore: 1, 
			quotedMessage: { conversation: label }, 
			...chats.key 
		};

		const pesan = chats.type === 'conversation' 
			? { 
				extendedTextMessage: { 
					text: chats.msg, 
					contextInfo: { 
						mentionedJid: [chats.key.participant], 
						isForwarded: true, 
						forwardingScore: 1, 
						quotedMessage: { conversation: label }, 
						...chats.key 
					}
				}
			} 
			: { [chats.type]: chats.msg };

		await naze.relayMessage(chatId, pesan, {});
	};

	// Auto Set Bio
	if (db.set[botNumber].autobio) {
		let setbio = db.set[botNumber]
		if (new Date() * 1 - setbio.status > 60000) {
			await naze.updateProfileStatus(`${naze.user.name} | 🎯 Runtime : ${runtime(process.uptime())}`)
			setbio.status = new Date() * 1
		}
	}
	// Auto Read
	if (m.message) {
		const isStatus = m.key.remoteJid === 'status@broadcast';
		const isChannel = m.key.remoteJid.endsWith('@newsletter'); // Cek apakah dari channel
		const pesan = JSON.stringify(m.message, null, 2); // Untuk melihat isi lengkap pesan
	
		console.log(
			`-----------------------------------------------------`,
			`\n⏳ ${chalk.whiteBright(`[ TIME ] :`)} ${chalk.cyanBright(new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }))}`, // Waktu dalam WIB
			`\n👤 ${chalk.yellowBright('[ DARI ] :')} ${chalk.magenta(m.pushName || (isCreator ? `${global.botname}` : 'Anonim'))} (${chalk.blueBright(m.sender)}) ${m.isBot.isBot ? chalk.gray('(bot)') : chalk.gray('(user)')}`, // Sesuaikan dengan m.isBot.isBot
			`\n💬 ${chalk.redBright('[ CHAT ] :')} ${chalk.cyan(
				m.isGroup ? `${m.metadata.subject} ${chalk.gray(`(${m.chat})`)}` :
				isStatus ? 'Status (UpSW)' :
				isChannel ? 'Channel Chat' : 'Private Chat'
			)}`,
			`\n📩 ${chalk.whiteBright(`[ PESAN ]:`)}\n${chalk.greenBright(budy || m.type)}`,
			isStatus ? `\n📝 ${chalk.yellowBright('[ UP STORY DARI KONTAK ]')}` : '' 
			//isStatus ? `\n📝 ${chalk.yellowBright('[ FULL MESSAGE DATA ]:')}\n${chalk.gray(pesan)}` : '' // Tambahkan log detail jika UpSW
		);
	
		if (db.set[botNumber].autoread && naze.public) naze.readMessages([m.key]);
	}
	// Filter Bot
	if (m.myBot) return
	// Mengetik
	if (db.set[botNumber].autotyping && isCmd) {
		await naze.sendPresenceUpdate('composing', m.chat)
	}
	// Anti PC && !isCreator
	if (!isGroup && !isStatus && !isCreator && !m.key.remoteJid.endsWith('@newsletter')) {
		console.log(`\n💬 ${chalk.redBright('[ CHAT ] :')} ${chalk.cyan('Private Chat')} dari ${sender}`);

		// Cek apakah fitur Anti Chat Pribadi aktif
		if (db.set[botNumber]?.antipc) {
			let warningMessage = `🛑 *DASAR OTAK UDANG!*  

Kamu pikir ini bot pacar kamu? Enak aja main PC, tolol!  
*BOT INI GAK TERIMA CHAT PRIBADI!* 

Kalau mau make, *PAKAI DI GRUP*!  
Mikir dikit sebelum ngetik, gak susah kan?  

🚫 *KAMU DIBLOKIR* 🚫

> Owner Bot:
> +${global.owner} (${global.ownername})`;

			await naze.sendMessage(sender, { text: warningMessage }, { quoted: m });

			// Blokir user
			await naze.updateBlockStatus(sender, 'block')
				.then(() => console.log(`🚫 Pengguna ${sender} telah *DIHABISI* karena sok asik chat PC.`))
				.catch((err) => console.error('Gagal memblokir pengguna:', err));
		}
	}
    //autoreply
	for (let Namenya of VoiceNote) {
	if (budy === Namenya) {
	let audiobuffy = fs.readFileSync(`./data/assets/audio/${Namenya}.mp3`)
	naze.sendMessage(m.chat, { audio: audiobuffy, mimetype: 'audio/mp4' }, { quoted: m })     
	}
	}
	for (let Namenya of Sticker){
	if (budy === Namenya){
	let stickerbuffy = fs.readFileSync(`./data/media/sticker/${Namenya}.webp`)
	naze.sendMessage(m.chat, { sticker: stickerbuffy }, { quoted: m })
	}
	}
	for (let Namenya of Image){
	if (budy === Namenya){
	let imagebuffy = fs.readFileSync(`./data/media/image/${Namenya}.jpg`)
	naze.sendMessage(m.chat, { image: imagebuffy }, { quoted: m })
	}
	}
	for (let Namenya of Video){
	if (budy === Namenya){
	let videobuffy = fs.readFileSync(`./data/media/video/${Namenya}.mp4`)
	naze.sendMessage(m.chat, { video: videobuffy }, { quoted: m })
	}
	}

if (fs.existsSync(textListPath)) {
    try {
        const chatId = m.chat;
        let TextList = {};
        try {
            TextList = JSON.parse(fs.readFileSync(textListPath, 'utf-8'));
        } catch (err) {
            console.error(`[ERROR] Gagal parsing textlist.json: ${err.message}`);
            TextList = {};
        }
        const groupList = TextList[chatId] || [];
        for (let item of groupList) {
            if (budy.toLowerCase() === item.name.toLowerCase()) {
                if (item.media && typeof item.media === 'string') {
                    const mediaPath = path.join(__dirname, './data/media/imagelist', item.media);
                    if (fs.existsSync(mediaPath)) {
                        const imagebuffy = fs.readFileSync(mediaPath);
                        naze.sendMessage(m.chat, { 
                            image: imagebuffy, 
                            caption: item.text || '' 
                        }, { quoted: m });
                        console.log(`[INFO] Mengirim gambar: ${mediaPath} dengan caption: ${item.text || ''}`);
                    } else {
                        console.error(`[ERROR] File media tidak ditemukan: ${mediaPath}`);
                        naze.sendMessage(m.chat, { 
                            text: item.text || 'Pesan tidak ditemukan.' 
                        }, { quoted: m });
                    }
                } else {
                    naze.sendMessage(m.chat, { 
                        text: item.text || 'Pesan tidak ditemukan.' 
                    }, { quoted: m });
                    console.log(`[INFO] Mengirim teks: ${item.text || 'Pesan tidak ditemukan.'}`);
                }
                break; // Keluar dari loop setelah menemukan kecocokan
            }
        }
    } catch (err) {
        console.error(`[ERROR] Gagal memproses textlist.json untuk grup ${chatId}: ${err.message}`);
    }
}
	// Group Settings
	if (m.isGroup) {
		// Cek jika bot adalah admin grup
		if (db.groups[m.chat].mute && !isCreator) return;
		let detectedWord = deteksiKataKotor(budy);
		// Deteksi pesan dari nomor luar
		if (m.isGroup && global.db.groups[m.chat]?.antiNomorLuar?.active&& !m.isAdmin) {
			const groupMetadata = await naze.groupMetadata(m.chat);
			const groupName = groupMetadata.subject;
			const exceptions = global.db.groups[m.chat].antiNomorLuar.exceptions;
			const senderNumber = m.sender.split('@')[0]; // Ambil nomor dari m.sender
			const isForeign = !exceptions.some(code => senderNumber.startsWith(code));
			const isAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin;

			if (isForeign && !isAdmin) {
				const displayName = m.pushName || senderNumber; // Gunakan pushName jika ada, fallback ke nomor
				const warningMessage = `⚠️ *PERINGATAN NOMOR LUAR!* ⚠️\n\n` +
									`🚨 *Nama:* @${senderNumber} (${displayName})\n` +
                      				`📢 *Grup:* ${groupName}\n` +
									`📌 *Pelanggaran:* Mengirim pesan dengan nomor di luar kode telepon :\n\`${exceptions.map(code => `+${code}`).join(', ')}\` !\n\n` +
									`⛔ Pesan anda akan dihapus dan anda akan dikeluarkan dari grup!`;

				await naze.sendMessage(m.chat, {
					text: warningMessage,
					contextInfo: { mentionedJid: [m.sender] }
				}, { quoted: m });

				await naze.sendMessage(m.chat, {
					delete: {
						remoteJid: m.chat,
						fromMe: false,
						id: m.key.id,
						participant: m.sender
					}
				});

				await naze.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {});

				await new Promise(resolve => setTimeout(resolve, 2000));

				await naze.sendMessage(m.chat, {
					text: `*Member dengan nomor luar @${senderNumber} (${displayName}) telah dikeluarkan dari grup!*`,
					mentions: [m.sender]
				});
			}
		}
		// Anti Delete
		if (m.type === 'protocolMessage') {
			const mess = m.message.protocolMessage;
			const chatId = m.chat;
		
			// Pastikan db.groups[m.chat] ada
			if (!db.groups[chatId]) {
				db.groups[chatId] = { antidelete: false, antiedit: false };
			}
		
			// Hanya proses jika salah satu fitur aktif dan ada histori pesan
			if ((db.groups[chatId].antidelete || db.groups[chatId].antiedit) && 
				store.messages && store.messages[chatId] && store.messages[chatId].array) {
				
				// Cari pesan asli
				const chats = store.messages[chatId].array.find(a => a.id === mess.key.id);
				if (!chats?.msg) return;
		
				// **Delete Message**: Jika pesan dihapus (type: 0) dan fitur antidelete aktif
				if (mess.type === 0 && db.groups[chatId].antidelete) {
					await sendRestoredMessage(naze, chatId, chats, '*Anti Delete❗*');
				}
		
				// **Edit Message**: Jika pesan diedit (type: 14) dan fitur antiedit aktif
				if (mess.type === 14 && db.groups[chatId].antiedit) {
					await sendRestoredMessage(naze, chatId, chats, '*Anti Edit❗*');
				}
			}
		}
		// ANTI TOXIC
        if (db.groups[m.chat].antitoxic && db.groups[m.chat].antitoxic.enabled && !m.isAdmin && detectedWord && m.sender !== global.number_bot + '@s.whatsapp.net') {
            // Fungsi untuk meminta pesan peringatan dari AI
            async function askOpenAI(inputText, detectedWord, fullText) {
                try {
                    const prompt = `Ada user yang ngomong kotor di kalimat "${fullText}", kata yang kena deteksi adalah "${detectedWord}". Buat pesan peringatan yang nyelekit, pedas, dan bikin sakit hati, tapi tetap cocok buat chat grup. Langsung to the point, ga usah formal.

        Awali dengan ejekan yang tajam (variatif, misalnya "dasar", "heh", "buset", "parah", "nggak banget", dll). Gunakan \${nama} untuk nyebut nama user.

        Tampilkan seluruh kalimat dengan kata yang terdeteksi dalam *bold*, pastikan spasi di dalam tanda kutip kalau ada, contoh: " *anjing lah orang itu* ". 

        Jelaskan konteks kalimatnya (misalnya emosi, kekaguman, atau ekspresi spontan), tapi tekankan betapa nggak pantasnya kata itu di grup dengan nada menghina. Buat user ngerasa malu karena pake kata kotor.

        Pake emoji yang ngegas (misalnya 😡, 😤, 👊, 🚫, 🔥) biar pesan makin pedas. Jangan ubah struktur utama atau logika pendeteksian. Fokus bikin pesan yang ngena dan bikin kapok.`;
                    const response = await axios.post("https://chateverywhere.app/api/chat/", {
                        model: {
                            id: "gpt-4",
                            name: "GPT-4",
                            maxLength: 32000,
                            tokenLimit: 8000,
                            completionTokenLimit: 5000,
                            deploymentName: "gpt-4"
                        },
                        messages: [
                            { pluginId: null, content: prompt, role: "user" }
                        ],
                        prompt: "",
                        temperature: 0.8 // Naikkan temperatur untuk hasil lebih agresif
                    }, {
                        headers: {
                            "Accept": "/*/",
                            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
                        }
                    });

                    return response.data.replace(/\*\*(.*?)\*\*/g, '*$1*');
                } catch (err) {
                    return `Dasar @${m.sender.split('@')[0]}! 😡 Kata *${detectedWord}* di "${budy}" bikin grup ini kotor! 🚫 Mulut lu itu ga pantes banget, mending tobat sebelum ku tendang! 😤`;
                }
            }

            // Dapatkan pesan peringatan dari AI
            let warningMessage = await askOpenAI(budy, detectedWord, budy);

            // Ganti ${nama} dengan tag pengirim
            warningMessage = warningMessage.replace(/\${nama}/g, `@${m.sender.split('@')[0]}`);

            // Kirim pesan peringatan dengan mentions
            await naze.sendMessage(m.chat, { 
                text: warningMessage, 
                mentions: [m.sender] 
            }, { quoted: m }).catch(() => {});

            // Eksekusi tindakan sesuai dengan pengaturan
            const antitoxic = db.groups[m.chat].antitoxic;

            if (antitoxic.delete) {
                await naze.sendMessage(m.chat, { 
                    delete: { remoteJid: m.chat, fromMe: false, id: m.id, participant: m.sender } 
                }).catch(() => {
                    naze.sendMessage(m.chat, { text: 'Gagal hapus pesan kotor lu, tapi catetan dosa lu udah masuk daftar! 😬' }, { quoted: m });
                });
            }

            if (antitoxic.kick) {
                await naze.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {});
            }
        }
        // Anti Hidetag
        if (db.groups[m.chat]?.antihidetag?.enabled && m.isBotAdmin && !isCreator && m.isGroup) {
            const lidMentions = (m.mentionedJid || []).filter(jid =>
                typeof jid === 'string' && jid.endsWith('@lid')
            );
            const hasVisibleMention = (m.body || '').includes('@');
            const isHidetag = lidMentions.length > 0 && !hasVisibleMention;

            if (isHidetag) {
                const senderNumber = m.sender.split('@')[0];
                const displayName = m.pushName || senderNumber;
                const antihidetag = db.groups[m.chat].antihidetag;
                let actionTaken = '';

                const customKeyId = generateCustomKeyId();

                // 1. KIRIM PERINGATAN DULU (dengan Tindakan masih kosong / "Peringatan diberikan")
                await naze.sendMessage(m.chat, {
                    text: `*⚠️ PELANGGARAN HIDETAG TERDETEKSI* ⚠️\n\n` +
                          `⏰ *Waktu Deteksi:* ${new Date().toLocaleString('id-ID')}\n` +
                          `👤 *Pengguna:* @${senderNumber} (${displayName})\n` +
                          `👤 *username:* (${displayName})\n` +
                          `📌 *Pelanggaran:* Mengirim pesan hidetag!\n\n` +
                          `⚙️ *Sanksi Pelanggaran:*\n` +
                          `📢 *Tindakan:* ${actionTaken || 'Peringatan diberikan'}.`,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        externalAdReply: {
                            title: 'Pelanggaran Hidetag',
                            body: 'Tag Tersembunyi Terdeteksi',
                            thumbnailUrl: global.getRandomThumbnailUrl(),
                            mediaType: 1,
                            previewType: 1,
                            renderLargerThumbnail: false
                        }
                    }
                }, { quoted: m, messageId: customKeyId });

                // 2. BARU EKSEKUSI DELETE & KICK
                if (antihidetag.delete) {
                    await naze.sendMessage(m.chat, {
                        delete: {
                            remoteJid: m.chat,
                            fromMe: false,
                            id: m.key.id,
                            participant: m.sender
                        }
                    }).catch(() => {});
                    actionTaken += 'Pesan dihapus';
                }

                if (antihidetag.kick) {
                    await naze.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                        .catch(() => {});
                    actionTaken += actionTaken ? ' dan pengguna dikeluarkan' : 'Pengguna dikeluarkan';
                }

                // 3. UPDATE PESAN PERINGATAN DENGAN HASIL AKHIR (biar Tindakan sesuai kenyataan)
                await naze.sendMessage(m.chat, {
                    edit: customKeyId,
                    text: `*⚠️ PELANGGARAN HIDETAG TERDETEKSI* ⚠️\n\n` +
                          `⏰ *Waktu Deteksi:* ${new Date().toLocaleString('id-ID')}\n` +
                          `👤 *Pengguna:* @${senderNumber} (${displayName})\n` +
                          `👤 *username:* (${displayName})\n` +
                          `📌 *Pelanggaran:* Mengirim pesan hidetag!\n\n` +
                          `⚙️ *Sanksi Pelanggaran:*\n` +
                          `📢 *Tindakan:* ${actionTaken || 'Peringatan diberikan'}.`
                });

                //console.log(`[ANTIHIDETAG] @${senderNumber} | ${lidMentions.length} orang | Tindakan: ${actionTaken || 'Peringatan'}`);
            }
        }
        // Anti Link Group (Link undangan WhatsApp)
        if (db.groups[m.chat].antilink && db.groups[m.chat].antilink.enabled && !isCreator) {
            if (budy.match('chat.whatsapp.com/')) {
                const isGcLink = new RegExp(`https://chat.whatsapp.com/${await naze.groupInviteCode(m.chat)}`, 'i').test(m.text);
                if (isGcLink) {
                    const customKeyId = generateCustomKeyId();
                    await naze.sendMessage(m.chat, {
                        text: `*✅ IZIN DIBERIKAN*\n` +
                            `⏰ *Waktu:* ${new Date().toLocaleString()}\n` +
                            `👤 *Pengguna:* @${m.sender.split('@')[0]}\n` +
                            `📌 *Status:* Tautan grup ini diperbolehkan.\n` +
                            `-------------------------------\n` +
                            `⚙️ *Tindakan:* Pesan diterima tanpa sanksi.`,
                        contextInfo: {
                            mentionedJid: [m.sender],
                            externalAdReply: {
                                title: 'Tautan Diizinkan',
                                body: 'Tautan Grup Diterima',
                                thumbnailUrl: global.getRandomThumbnailUrl(),
                                mediaType: 1,
                                previewType: 1,
                                renderLargerThumbnail: false
                            }
                        }
                    }, { quoted: m, messageId: customKeyId });
                    return;
                }

                if (!m.isAdmin) {
                    const antilink = db.groups[m.chat].antilink;
                    let actionTaken = '';

                    // Hapus pesan jika delete aktif
                    if (antilink.delete) {
                        await naze.sendMessage(m.chat, { 
                            delete: { remoteJid: m.chat, fromMe: false, id: m.id, participant: m.sender } 
                        });
                        actionTaken += 'Pesan dihapus';
                    }

                    // Tendang pengguna jika kick aktif
                    if (antilink.kick) {
                        await naze.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                        actionTaken += actionTaken ? ' dan pengguna dikeluarkan' : 'Pengguna dikeluarkan';
                    }

                    // Kirim pesan peringatan dengan gaya modern dan elegan
                    const customKeyId = generateCustomKeyId();
                    await naze.sendMessage(m.chat, {
                        text: `*⚠️ PELANGGARAN TERDETEKSI*\n` +
                            `⏰ *Waktu Deteksi:* ${new Date().toLocaleString()}\n` +
                            `👤 *Pengguna:* @${m.sender.split('@')[0]}\n` +
                            `📌 *Pelanggaran:* Tautan grup asing terdeteksi.\n` +
                            `-------------------------------\n` +
                            `⚙️ *Sanksi Pelanggaran:*\n` +
                            `- Tendang: ${antilink.kick ? '✅' : '❌'}\n` +
                            `- Hapus: ${antilink.delete ? '✅' : '❌'}\n` +
                            `📢 *Tindakan:* ${actionTaken || 'Peringatan diberikan'}.`,
                        contextInfo: {
                            mentionedJid: [m.sender],
                            externalAdReply: {
                                title: 'Pelanggaran Tautan',
                                body: 'Tautan Asing Terdeteksi',
                                thumbnailUrl: global.getRandomThumbnailUrl(),
                                mediaType: 1,
                                previewType: 1,
                                renderLargerThumbnail: false
                            }
                        }
                    }, { quoted: m, messageId: customKeyId });
                }
            }
        }	
        // antibot
        if (db.groups[m.chat]?.antibot?.enabled && !isCreator && m.isBotAdmin) {
            // Cek apakah pengirim adalah bot (kecuali bot sendiri)
            const { isBot, reasons: botReasons } = m.isBot; // Ambil isBot dan reasons dari m.isBot
            const isBotSender = m.sender !== global.number_bot + '@s.whatsapp.net' && isBot;

            if (isBotSender) {
                // Jika bot adalah admin, log tanpa tindakan
                if (m.isAdmin) {
                    const logData = {
                        timestamp: new Date().toLocaleString(),
                        group: m.chat,
                        sender: m.sender,
                        keyId: m.id,
                        idLength: m.id.length,
                        detectedAs: 'Bot',
                        reasons: botReasons.length > 0 
                            ? botReasons.map(reason => `- ${reason}`).join('\n')
                            : '- Tidak ada alasan spesifik (m.isBot = true)',
                        messageContent: m.text || 'N/A',
                        action: 'no action (sender is admin)'
                    };
                    console.log('[ANTIBOT DETECTION] Bot Detected but No Action Taken:', logData);
                    return;
                }

                // Format alasan deteksi untuk log dan pesan peringatan
                const formattedReasons = botReasons.length > 0 
                    ? botReasons.map(reason => `- ${reason}`).join('\n')
                    : '- Tidak ada alasan spesifik (m.isBot = true)';

                // Buat log dasar
                const logData = {
                    timestamp: new Date().toLocaleString(),
                    group: m.chat,
                    sender: m.sender,
                    keyId: m.id,
                    idLength: m.id.length,
                    detectedAs: 'Bot',
                    reasons: formattedReasons,
                    messageContent: m.text || 'N/A',
                    action: 'detected'
                };

                let actionTaken = '';

                // 1. Balas pesan bot
                const customKeyId = generateCustomKeyId();
                await naze.sendMessage(m.chat, {
                    text: `*🤖 Bot Terdeteksi!* Pesan Anda akan dihapus karena aktivitas bot terdeteksi.`,
                    contextInfo: {
                        mentionedJid: [m.sender]
                    }
                }, { quoted: m, messageId: customKeyId }).catch(() => {
                    logData.action = 'failed to reply to bot message';
                    console.log('[ANTIBOT ERROR] Failed to reply to bot message:', logData);
                });
                actionTaken += 'Pesan dibalas';

                // 2. Hapus pesan jika delete aktif
                if (db.groups[m.chat].antibot.delete) {
                    await naze.sendMessage(m.chat, { 
                        delete: { 
                            remoteJid: m.chat, 
                            fromMe: false, 
                            id: m.id, 
                            participant: m.sender 
                        }
                    }).catch(() => {
                        logData.action = actionTaken ? `${actionTaken}, failed to delete message` : 'failed to delete message';
                        console.log('[ANTIBOT ERROR] Failed to delete message:', logData);
                    });
                    actionTaken = actionTaken ? `${actionTaken}, pesan dihapus` : 'Pesan dihapus';
                }

                // 3. Kirim pesan peringatan
                await naze.sendMessage(m.chat, {
                    text: `*⚠️ PELANGGARAN TERDETEKSI*\n` +
                        `⏰ *Waktu Deteksi:* ${new Date().toLocaleString()}\n` +
                        `👤 *Pengguna:* @${m.sender.split('@')[0]}\n` +
                        `🔑 *Key ID:* ${m.id}\n` +
                        `📏 *Jumlah Karakter ID:* ${m.id.length}\n` +
                        `📌 *Pelanggaran:* Aktivitas bot terdeteksi.\n` +
                        `📜 *Alasan Deteksi:*\n${formattedReasons}\n` +
                        `-------------------------------\n` +
                        `⚙️ *Sanksi Pelanggaran:*\n` +
                        `- Tendang: ${db.groups[m.chat].antibot.kick ? '✅' : '❌'}\n` +
                        `- Hapus: ${db.groups[m.chat].antibot.delete ? '✅' : '❌'}\n` +
                        `📢 *Tindakan:* ${actionTaken || 'Peringatan diberikan'}.\n` +
                        `${db.groups[m.chat].antibot.kick ? 'Pengguna akan dikeluarkan dari grup!' : ''}`,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        externalAdReply: {
                            title: 'Pelanggaran Bot',
                            body: 'Bot Terdeteksi',
                            thumbnailUrl: `${global.thumbnailisbot}`,
                            mediaType: 1,
                            previewType: 1,
                            renderLargerThumbnail: false
                        }
                    }
                }, { quoted: m, messageId: generateCustomKeyId() }).catch(() => {
                    logData.action = actionTaken ? `${actionTaken}, failed to send warning` : 'failed to send warning';
                    console.log('[ANTIBOT ERROR] Failed to send warning message:', logData);
                });

                // 4. Tendang bot jika kick aktif
                if (db.groups[m.chat].antibot.kick) {
                    await naze.groupParticipantsUpdate(m.chat, [m.sender], 'remove').then(() => {
                        actionTaken = actionTaken ? `${actionTaken}, bot dikeluarkan` : 'Bot dikeluarkan';
                        logData.action = actionTaken;
                        console.log('[ANTIBOT DETECTION] User Kicked:', logData);
                    }).catch(() => {
                        logData.action = actionTaken ? `${actionTaken}, failed to kick user` : 'failed to kick user';
                        console.log('[ANTIBOT ERROR] Failed to kick user:', logData);
                    });
                }
            }
        }
        // Anti Link All (Untuk semua jenis link, selain grup)
        if (db.groups[m.chat].antilinkall && db.groups[m.chat].antilinkall.enabled && !isCreator) {
            if (budy.match(/(?:https?:\/\/|http?:\/\/|www\.|bit\.ly|t\.co|wa\.me|tinyurl\.com|goo\.gl|cutt\.ly|shorturl\.at|rebrand\.ly|is\.gd|rb\.gy|shrtco\.de|adf\.ly|ouo\.io|linkvertise\.com|linktr\.ee|v\.gd|lc\.chat|buff\.ly|lnkd\.in|dis\.gd|t2m\.io|x\.co|bc\.vc|gestyy\.com|clk\.sh|shorte\.st|ity\.im|cur\.lv|qrl\.es|soo\.gd|vzturl\.com|safeurl\.me|bitly\.com|jump\.boingboing\.net|snipurl\.com|b\.ly|tr\.im|cli\.gs|filoops\.info|zzb\.bz|url\.ie|tiny\.cc|urlm\.in|prettylinkpro\.com|moourl\.com|unfurlr\.com|3url\.com|fuur\.net|tinyarrows\.com|plu\.sh|viralurl\.com|xurl\.es|starturl\.com|hex\.io|linkspy\.cc|hit\.sh|safelinking\.net|iklanbaris\.co\.id|clkim\.com|xwb\.in|adcrun\.ch|tny\.cz|ux\.nu|smll\.io|cut\.by|gestyy\.com|u\.bb|shrtfly\.com|shortcm\.li|smarturl\.it|linkly\.hq|shareasale\.com|clkmein\.com|cutpaid\.com|ay\.gy|micurl\.fr|shortenurl\.at|lil\.vn|zip\.li|croco\.me|gg\.gg|acortaz\.com|shorl\.com|tini\.cc|linkly\.hq|shrten\.com|shortcm\.com|shortenworld\.com|qps\.ru|po\.st|shorten\.sh|poplme\.co|scissor\.app|campus\.app|fuse\.io|snap\.ly|lnkd\.in|bebo\.com|y2u\.be|youtu\.be|linkz\.com|getlink\.info|play\.app|dl\.app|apkmonk\.com|zippyshare\.com|mediafire\.com|mega\.nz|anonfiles\.com|solidfiles\.com|sendgb\.com|filedropper\.com|uploadfiles\.io|files\.fm|krakenfiles\.com|dropbox\.com|drive\.google\.com|yadi\.sk|sendspace\.com|we\.tl|fex\.net|1fichier\.com|upfiles\.com|getfile\.cc|4shared\.com|openload\.co|megaup\.net|fireload\.com|racaty\.com|userscloud\.com|sendit\.cloud|ziddu\.com|gigafile\.nu|bayfiles\.com|anonfile\.com|filehost\.guru|sharemods\.com|fastshare\.cz|uploadhaven\.com|dlsharefile\.com|terabox\.com|solidfile\.net|mediafirelink\.com|directdownloadlink\.com|sharedownloadlink\.com)[^\s]+/gi)) {
                const isGcLink = new RegExp(`https://chat.whatsapp.com/${await naze.groupInviteCode(m.chat)}`, 'i').test(m.text);
                if (isGcLink) {
                    const customKeyId = generateCustomKeyId();
                    await naze.sendMessage(m.chat, {
                        text: `*✅ IZIN DIBERIKAN*\n` +
                            `⏰ *Waktu:* ${new Date().toLocaleString()}\n` +
                            `👤 *Pengguna:* @${m.sender.split('@')[0]}\n` +
                            `📌 *Status:* Tautan grup ini diperbolehkan.\n` +
                            `-------------------------------\n` +
                            `⚙️ *Tindakan:* Pesan diterima tanpa sanksi.`,
                        contextInfo: {
                            mentionedJid: [m.sender],
                            externalAdReply: {
                                title: 'Tautan Diizinkan',
                                body: 'Tautan Grup Diterima',
                                thumbnailUrl: global.getRandomThumbnailUrl(),
                                mediaType: 1,
                                previewType: 1,
                                renderLargerThumbnail: false
                            }
                        }
                    }, { quoted: m, messageId: customKeyId }).catch(() => {});
                    return;
                }

                if (!m.isAdmin) {
                    const antilinkall = db.groups[m.chat].antilinkall;
                    let actionTaken = '';

                    // Hapus pesan jika delete aktif
                    if (antilinkall.delete) {
                        await naze.sendMessage(m.chat, { 
                            delete: { remoteJid: m.chat, fromMe: false, id: m.id, participant: m.sender } 
                        }).catch(() => {});
                        actionTaken += 'Pesan dihapus';
                    }

                    // Tendang pengguna jika kick aktif
                    if (antilinkall.kick) {
                        await naze.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {});
                        actionTaken += actionTaken ? ' dan pengguna dikeluarkan' : 'Pengguna dikeluarkan';
                    }

                    // Kirim pesan peringatan dengan gaya modern dan elegan
                    const customKeyId = generateCustomKeyId();
                    await naze.sendMessage(m.chat, {
                        text: `*⚠️ PELANGGARAN TERDETEKSI*\n` +
                            `⏰ *Waktu Deteksi:* ${new Date().toLocaleString()}\n` +
                            `👤 *Pengguna:* @${m.sender.split('@')[0]}\n` +
                            `📌 *Pelanggaran:* Tautan terlarang terdeteksi.\n` +
                            `-------------------------------\n` +
                            `⚙️ *Sanksi Pelanggaran:*\n` +
                            `- Tendang: ${antilinkall.kick ? '✅' : '❌'}\n` +
                            `- Hapus: ${antilinkall.delete ? '✅' : '❌'}\n` +
                            `📢 *Tindakan:* ${actionTaken || 'Peringatan diberikan'}.`,
                        contextInfo: {
                            mentionedJid: [m.sender],
                            externalAdReply: {
                                title: 'Pelanggaran Tautan',
                                body: 'Tautan Terlarang Terdeteksi',
                                thumbnailUrl: global.getRandomThumbnailUrl(),
                                mediaType: 1,
                                previewType: 1,
                                renderLargerThumbnail: false
                            }
                        }
                    }, { quoted: m, messageId: customKeyId }).catch(() => {});
                }
            }
        }
        // Anti WaMe (Tautan wa.me)
        if (db.groups[m.chat].antiwame && db.groups[m.chat].antiwame.enabled && !isCreator && m.isBotAdmin) {
            if (budy.match(/https:\/\/wa\.me\//i)) {
                if (m.isAdmin) {
                    const customKeyId = generateCustomKeyId();
                    await naze.sendMessage(m.chat, {
                        text: `*✅ IZIN DIBERIKAN*\n` +
                            `⏰ *Waktu:* ${new Date().toLocaleString()}\n` +
                            `👤 *Pengguna:* @${m.sender.split('@')[0]}\n` +
                            `📌 *Status:* Admin diperbolehkan mengirim tautan wa.me.\n` +
                            `-------------------------------\n` +
                            `⚙️ *Tindakan:* Pesan diterima tanpa sanksi.`,
                        contextInfo: {
                            mentionedJid: [m.sender],
                            externalAdReply: {
                                title: 'Tautan Diizinkan',
                                body: 'Tautan WaMe Diterima',
                                thumbnailUrl: global.getRandomThumbnailUrl(),
                                mediaType: 1,
                                previewType: 1,
                                renderLargerThumbnail: false
                            }
                        }
                    }, { quoted: m, messageId: customKeyId }).catch(() => {});
                    return;
                }

                const antiwame = db.groups[m.chat].antiwame;
                let actionTaken = '';

                // Kirim pesan peringatan dengan gaya modern dan elegan terlebih dahulu
                const customKeyId = generateCustomKeyId();
                await naze.sendMessage(m.chat, {
                    text: `*⚠️ PELANGGARAN TERDETEKSI*\n` +
                        `⏰ *Waktu Deteksi:* ${new Date().toLocaleString()}\n` +
                        `👤 *Pengguna:* @${m.sender.split('@')[0]}\n` +
                        `📌 *Pelanggaran:* Tautan wa.me terdeteksi.\n` +
                        `-------------------------------\n` +
                        `⚙️ *Sanksi Pelanggaran:*\n` +
                        `- Tendang: ${antiwame.kick ? '✅' : '❌'}\n` +
                        `- Hapus: ${antiwame.delete ? '✅' : '❌'}\n` +
                        `📢 *Tindakan:* ${antiwame.kick ? 'Pengguna akan dikeluarkan' : ''}${antiwame.kick && antiwame.delete ? ' dan ' : ''}${antiwame.delete ? 'Pesan akan dihapus' : ''}${!antiwame.kick && !antiwame.delete ? 'Peringatan diberikan' : ''}.`,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        externalAdReply: {
                            title: 'Pelanggaran Tautan',
                            body: 'Tautan WaMe Terdeteksi',
                            thumbnailUrl: global.getRandomThumbnailUrl(),
                            mediaType: 1,
                            previewType: 1,
                            renderLargerThumbnail: false
                        }
                    }
                }, { quoted: m, messageId: customKeyId }).catch(() => {});

                // Eksekusi tindakan setelah reply
                if (antiwame.delete) {
                    await naze.sendMessage(m.chat, { 
                        delete: { remoteJid: m.chat, fromMe: false, id: m.id, participant: m.sender } 
                    }).catch(() => {});
                    actionTaken += 'Pesan dihapus';
                }

                if (antiwame.kick) {
                    await naze.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {});
                    actionTaken += actionTaken ? ' dan pengguna dikeluarkan' : 'Pengguna dikeluarkan';
                }
            }
        }
        // Anti Spam Link (Link grup, channel, dan wa.me)
        if (db.groups[m.chat]?.antispamlink?.enabled && !m.isAdmin) {
            if (budy.match(/(https?:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9]+|https?:\/\/whatsapp\.com\/channel\/[a-zA-Z0-9]+|https?:\/\/wa\.me\/\+?[0-9]+)/i)) {
                const isGcLink = new RegExp(`https://chat.whatsapp.com/${await naze.groupInviteCode(m.chat)}`, 'i').test(m.text);
                if (isGcLink) {
                    const customKeyId = generateCustomKeyId();
                    await naze.sendMessage(m.chat, {
                        text: `*✅ IZIN DIBERIKAN*\n` +
                              `⏰ *Waktu:* ${new Date().toLocaleString()}\n` +
                              `👤 *Pengguna:* @${m.sender.split('@')[0]}\n` +
                              `📌 *Status:* Tautan grup ini diperbolehkan.\n` +
                              `-------------------------------\n` +
                              `⚙️ *Tindakan:* Pesan diterima tanpa sanksi.`,
                        contextInfo: {
                            mentionedJid: [m.sender],
                            externalAdReply: {
                                title: 'Tautan Diizinkan',
                                body: 'Tautan Grup Diterima',
                                thumbnailUrl: global.getRandomThumbnailUrl(),
                                mediaType: 1,
                                previewType: 1,
                                renderLargerThumbnail: false
                            }
                        }
                    }, { quoted: m, messageId: customKeyId }).catch(() => {});
                    return;
                }

                // Inisialisasi database antispamlink jika belum ada
                if (!db.groups[m.chat].antispamlink) {
                    db.groups[m.chat].antispamlink = { users: {} };
                }

                const userId = m.sender;
                const currentTime = Date.now();
                const userData = db.groups[m.chat].antispamlink.users[userId] || { time: currentTime, links: [] };

                // Tambahkan link ke data pengguna
                userData.links.push(m.text);
                userData.time = userData.time || currentTime; // Pertahankan waktu awal jika sudah ada

                // Simpan data ke database
                db.groups[m.chat].antispamlink.users[userId] = userData;

                // Format log untuk deteksi
                const logData = {
                    timestamp: new Date().toLocaleString(),
                    group: m.chat,
                    sender: m.sender,
                    keyId: m.id,
                    idLength: m.id.length,
                    detectedAs: 'Spam Link',
                    messageContent: m.text || 'N/A',
                    action: 'detected'
                };

                let actionTaken = '';

                // Cek apakah pengguna mengirim lebih dari 2 link dalam 1 menit
                if (userData.links.length > 2) {
                    // Balas pesan spam
                    const customKeyId = generateCustomKeyId();
                    await naze.sendMessage(m.chat, {
                        text: `*⚠️ Spam Link Terdeteksi!* Pesan Anda akan dihapus karena mengirim lebih dari 2 link dalam 1 menit.`,
                        contextInfo: {
                            mentionedJid: [m.sender]
                        }
                    }, { quoted: m, messageId: customKeyId }).catch(() => {
                        logData.action = 'failed to reply to spam message';
                        console.log('[ANTISPAMLINK ERROR] Failed to reply to spam message:', logData);
                    });
                    actionTaken += 'Pesan dibalas';

                    // Hapus pesan jika delete aktif dan bot adalah admin
                    if (db.groups[m.chat].antispamlink.delete && m.isBotAdmin) {
                        await naze.sendMessage(m.chat, {
                            delete: { remoteJid: m.chat, fromMe: false, id: m.id, participant: m.sender }
                        }).catch(() => {
                            logData.action = actionTaken ? `${actionTaken}, failed to delete message` : 'failed to delete message';
                            console.log('[ANTISPAMLINK ERROR] Failed to delete message:', logData);
                        });
                        actionTaken = actionTaken ? `${actionTaken}, pesan dihapus` : 'Pesan dihapus';
                    }
//------------------------------------------------------------------------------------------------
                    //kalau gamau ada teks, hapus aja bagian ini , udah di batasin pakai garis code nya.
                    // Kirim pesan peringatan dengan gaya modern dan elegan
                   
					//ini batas nya
//------------------------------------------------------------------------------------------------
                    // Tendang pengguna jika kick aktif dan bot adalah admin
                    if (db.groups[m.chat].antispamlink.kick && m.isBotAdmin) {
                        await naze.groupParticipantsUpdate(m.chat, [m.sender], 'remove').then(() => {
                            actionTaken = actionTaken ? `${actionTaken}, pengguna dikeluarkan` : 'Pengguna dikeluarkan';
                            logData.action = actionTaken;
                            console.log('[ANTISPAMLINK DETECTION] User Kicked:', logData);
                        }).catch(() => {
                            logData.action = actionTaken ? `${actionTaken}, failed to kick user` : 'failed to kick user';
                            console.log('[ANTISPAMLINK ERROR] Failed to kick user:', logData);
                        });
                    }

                    // Reset data pengguna setelah pelanggaran
                    delete db.groups[m.chat].antispamlink.users[userId];
                }

                // Bersihkan data pengguna setelah 1 menit
                setTimeout(() => {
                    if (db.groups[m.chat]?.antispamlink?.users[userId]?.time === userData.time) {
                        delete db.groups[m.chat].antispamlink.users[userId];
                        console.log(`[ANTISPAMLINK] Data pengguna ${userId} dihapus setelah 1 menit`);
                    }
                }, 60 * 1000); // 1 menit
            }
        }
        // Anti Virtex Group
        if (db.groups[m.chat].antivirtex && db.groups[m.chat].antivirtex.enabled && !isCreator && m.isBotAdmin) {
            if (budy.length > 6000 || (m.msg.nativeFlowMessage && m.msg.nativeFlowMessage.messageParamsJson && m.msg.nativeFlowMessage.messageParamsJson.length > 3500)) {
                if (!m.isAdmin) {
                    const antivirtex = db.groups[m.chat].antivirtex;
                    let actionTaken = '';

                    // Hapus pesan jika delete aktif
                    if (antivirtex.delete) {
                        await naze.sendMessage(m.chat, { 
                            delete: { remoteJid: m.chat, fromMe: false, id: m.id, participant: m.sender } 
                        }).catch(() => {});
                        actionTaken += 'Pesan dihapus';
                    }

                    // Tendang pengguna jika kick aktif
                    if (antivirtex.kick) {
                        await naze.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {});
                        actionTaken += actionTaken ? ' dan pengguna dikeluarkan' : 'Pengguna dikeluarkan';
                    }

                    // Kirim pesan peringatan dengan gaya modern dan elegan
                    const customKeyId = generateCustomKeyId();
                    await naze.sendMessage(m.chat, {
                        text: `*⚠️ PELANGGARAN TERDETEKSI*\n` +
                            `⏰ *Waktu Deteksi:* ${new Date().toLocaleString()}\n` +
                            `👤 *Pengguna:* @${m.sender.split('@')[0]}\n` +
                            `📌 *Pelanggaran:* Pesan virtex/bug terdeteksi.\n` +
                            `-------------------------------\n` +
                            `⚙️ *Sanksi Pelanggaran:*\n` +
                            `- Tendang: ${antivirtex.kick ? '✅' : '❌'}\n` +
                            `- Hapus: ${antivirtex.delete ? '✅' : '❌'}\n` +
                            `📢 *Tindakan:* ${actionTaken || 'Peringatan diberikan'}.`,
                        contextInfo: {
                            mentionedJid: [m.sender],
                            externalAdReply: {
                                title: 'Pelanggaran Virtex',
                                body: 'Virtex/Bug Terdeteksi',
                                thumbnailUrl: global.getRandomThumbnailUrl(),
                                mediaType: 1,
                                previewType: 1,
                                renderLargerThumbnail: false
                            }
                        }
                    }, { quoted: m, messageId: customKeyId }).catch(() => {});
                }
            }
        }
     	// Anti Sticker
        if (db.groups[m.chat]?.antisticker?.enabled && m.isBotAdmin) {
            if (m.type === 'stickerMessage') {
                if (m.isAdmin) {
                    naze.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
                    return;
                }

                const antisticker = db.groups[m.chat].antisticker;

                const groupMetadata = await naze.groupMetadata(m.chat);
                const groupName = groupMetadata.subject;

                if (antisticker.kick || antisticker.both) {
                    await naze.sendMessage(m.chat, {
                        text: `⚠️ *PERINGATAN PELANGGARAN!* ⚠️\n\n` +
                              `👤 *Nama:* @${m.sender.split('@')[0]}\n` +
                              `📌 *Pelanggaran:* Mengirim sticker!\n` +
                              `📢 *Grup:* ${groupName}\n` +
                              `⛔ Anda akan dikeluarkan dari grup!`,
                        contextInfo: { mentionedJid: [m.sender] }
                    }, { quoted: m });

                    await delay(1500); // delay sebentar agar pesan terkirim sebelum kick
                    await naze.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                }

                if (antisticker.delete || antisticker.both) {
                    await naze.sendMessage(m.chat, {
                        delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.sender }
                    });
                }
            }
        }
        // Anti Text
        if (db.groups[m.chat]?.antitext?.enabled  && m.isBotAdmin) {
            if (m.type === 'conversation' || m.type === 'extendedTextMessage') {
                if (m.isAdmin) {
                    naze.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
                    return;
                }

                const antitext = db.groups[m.chat].antitext;

                const groupMetadata = await naze.groupMetadata(m.chat);
                const groupName = groupMetadata.subject;

                if (antitext.kick || antitext.both) {
                    await naze.sendMessage(m.chat, {
                        text: `⚠️ *PERINGATAN PELANGGARAN!* ⚠️\n\n` +
                              `👤 *Nama:* @${m.sender.split('@')[0]}\n` +
                              `📌 *Pelanggaran:* Mengirim teks!\n` +
                              `📢 *Grup:* ${groupName}\n` +
                              `⛔ Anda akan dikeluarkan dari grup!`,
                        contextInfo: { mentionedJid: [m.sender] }
                    }, { quoted: m });

                    await delay(1500);
                    await naze.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                }

                if (antitext.delete || antitext.both) {
                    await naze.sendMessage(m.chat, {
                        delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.sender }
                    });
                }
            }
        }
        // Anti Media
        if (db.groups[m.chat]?.antimedia?.enabled  && m.isBotAdmin) {
            if (m.type === 'imageMessage' || m.type === 'videoMessage') {
                if (m.isAdmin) {
                    naze.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
                    return;
                }

                const antimedia = db.groups[m.chat].antimedia;

                const groupMetadata = await naze.groupMetadata(m.chat);
                const groupName = groupMetadata.subject;

                if (antimedia.kick || antimedia.both) {
                    await naze.sendMessage(m.chat, {
                        text: `⚠️ *PERINGATAN PELANGGARAN!* ⚠️\n\n` +
                              `👤 *Nama:* @${m.sender.split('@')[0]}\n` +
                              `📌 *Pelanggaran:* Mengirim foto atau video!\n` +
                              `📢 *Grup:* ${groupName}\n` +
                              `⛔ Anda akan dikeluarkan dari grup!`,
                        contextInfo: { mentionedJid: [m.sender] }
                    }, { quoted: m });

                    await delay(1500);
                    await naze.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                }

                if (antimedia.delete || antimedia.both) {
                    await naze.sendMessage(m.chat, {
                        delete: { remoteJid: m.chat, fromMe: false, id: m.key.id, participant: m.sender }
                    });
                }
            }
        }
        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

		// Jika onlyadmin aktif, cegah semua command dari member biasa, tapi biarkan fitur otomatis dan creator tetap berjalan
		 // Blokir command hanya untuk non-admin yang bukan creator
		// Jika onlyadmin aktif, cegah semua command dari member biasa, tapi biarkan fitur otomatis dan creator tetap berjalan
if (db.groups[m.chat].onlyadmin) {
    if (!m.isAdmin && !m.isCreator && (m.body.startsWith(prefix) || m.isCmd)) return; // Blokir command hanya untuk non-admin yang bukan creator
}			
		if (db.groups[m.chat].autojoingc) {
    	if (budy.match('chat.whatsapp.com/')) {
        const inviteCodeMatch = m.text.match(/https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/);
        if (!inviteCodeMatch) return;
        const inviteCode = inviteCodeMatch[1];
        const customKeyId = generateCustomKeyId();
        naze.sendMessage(m.chat, {
            text: `*🏰 DETEKSI LINK GRUP* ⚜️\n` +
                `⏰ *Waktu:* ${new Date().toLocaleString()}\n` +
                `👤 *Pengirim:* @${m.sender.split('@')[0]}\n` +
                `🔗 *Link Grup:* Terdeteksi\n` +
                `📜 *Tindakan:* Bot akan mencoba bergabung!`,
            contextInfo: {
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: '🏰 Auto Join Grup',
                    body: '⚜️ Link Grup Terdeteksi',
                    thumbnailUrl: global.getRandomThumbnailUrl(),
                    mediaType: 1,
                    previewType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m, messageId: customKeyId });
        naze.groupAcceptInvite(inviteCode, (err, groupId) => {
            if (!err) {
                naze.sendMessage(m.chat, {
                    text: `*🏰 BERHASIL BERGABUNG* ⚜️\n` +
                        `⏰ *Waktu:* ${new Date().toLocaleString()}\n` +
                        `👤 *Pengirim:* @${m.sender.split('@')[0]}\n` +
                        `🔗 *Grup:* Berhasil bergabung!\n` +
                        `-------------------------------\n` +
                        `✅ *Status:* Bot sudah di grup.`,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        externalAdReply: {
                            title: '🏰 Sukses Join Grup',
                            body: '⚜️ Bot Berhasil Bergabung',
                            thumbnailUrl: global.getRandomThumbnailUrl(),
                            mediaType: 1,
                            previewType: 1,
                            renderLargerThumbnail: false
                        }
                    }
                }, { quoted: m, messageId: generateCustomKeyId() });
            } else {
                let errorMessage = 'Gagal bergabung ke grup.';
                if (err.data == 400) errorMessage = 'Grup tidak ditemukan ❗';
                else if (err.data == 401) errorMessage = 'Bot dikeluarkan dari grup ❗';
                else if (err.data == 409) errorMessage = 'Bot sudah di grup ❗';
                else if (err.data == 410) errorMessage = 'Link grup direset ❗';
                else if (err.data == 500) errorMessage = 'Grup penuh ❗';
                naze.sendMessage(m.chat, {
                    text: `*🏰 GAGAL BERGABUNG* ⚔️\n` +
                        `⏰ *Waktu:* ${new Date().toLocaleString()}\n` +
                        `👤 *Pengirim:* @${m.sender.split('@')[0]}\n` +
                        `🔗 *Link Grup:* Gagal diproses\n` +
                        `📜 *Alasan:* ${errorMessage}\n` +
                        `-------------------------------\n` +
                        `⚠️ *Status:* Bot gagal bergabung.`,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        externalAdReply: {
                            title: '⚔️ Gagal Join Grup',
                            body: '⚠️ Terjadi Kesalahan',
                            thumbnailUrl: global.getRandomThumbnailUrl(),
                            mediaType: 1,
                            previewType: 1,
                            renderLargerThumbnail: false
                        }
                    }
                }, { quoted: m, messageId: generateCustomKeyId() });
            }
        });
    }
}
	}
	// Salam
	if (/^a(s|ss)alamu('|)alaikum(| )(wr|)( |)(wb|)$/.test(budy?.toLowerCase())) {
		const jwb_salam = ['Wa\'alaikumusalam','Wa\'alaikumusalam wr wb','Wa\'alaikumusalam Warohmatulahi Wabarokatuh']
		m.reply(pickRandom(jwb_salam))
	}
	// Cek Expired
	prem.expiredCheck(naze, premium);
	//menfess/confess
	if (!m.isGroup) {
		if (menfes[m.sender] && m.key.remoteJid !== 'status@broadcast') {
			if (!/^del(menfe(s|ss)|confe(s|ss))$/i.test(command)) {
				m.msg.contextInfo = { isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: `*Pesan Dari ${menfes[m.sender].nama ? menfes[m.sender].nama : 'Seseorang'}*`}, key: { remoteJid: '0@s.whatsapp.net', fromMe: false, participant: '0@s.whatsapp.net' }}
				const pesan = m.type === 'conversation' ? { extendedTextMessage: { text: m.msg, contextInfo: { isForwarded: true, forwardingScore: 1, quotedMessage: { conversation: `*Pesan Dari ${menfes[m.sender].nama ? menfes[m.sender].nama : 'Seseorang'}*`}, key: { remoteJid: '0@s.whatsapp.net', fromMe: false, participant: '0@s.whatsapp.net' }}}} : { [m.type]: m.msg }
				await naze.relayMessage(menfes[m.sender].tujuan, pesan, {});
			}
		}
	}
	//afk
	if (db.users[m.sender].afkTime > -1) {
		let user = db.users[m.sender];
		
		// Fungsi untuk format durasi jadi human-readable
		function clockString(ms) {
			let days = Math.floor(ms / (24 * 60 * 60 * 1000));
			let hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
			let minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
			let seconds = Math.floor((ms % (60 * 1000)) / 1000);
			
			let result = [];
			if (days > 0) result.push(`${days} hari`);
			if (hours > 0) result.push(`${hours} jam`);
			if (minutes > 0) result.push(`${minutes} menit`);
			if (seconds > 0 && days === 0 && hours === 0 && minutes === 0) result.push(`${seconds} detik`);
			
			return result.length > 0 ? result.join(' ') : 'sebentar doang';
		}
		
		let afkDuration = clockString(new Date - user.afkTime);
		let reason = user.afkReason || '';
		
		// Fungsi sederhana untuk deteksi nuansa Jawa
		const isJavanese = (text) => {
			const javaneseWords = ['mangan', 'mlaku', 'turun', 'ndelok', 'ngomong', 'pengin', 'arep', 'sugeng', 'sore', 'enak', 'apik', 'sae', 'koyok', 'opo', 'yo', 'wis', 'lho', 'kok', 'ra', 'ora'];
			return text && javaneseWords.some(word => text.toLowerCase().includes(word));
		};
		
		// Fungsi untuk meminta pesan end-AFK dari AI
		async function askOpenAIForEndAfk(sender, reason, duration) {
			try {
				console.log('Mengirimkan permintaan ke OpenAI untuk pesan end-AFK...');
				const languageHint = isJavanese(reason) ? 'Gunakan bahasa Jawa santai atau campuran Jawa-Indonesia yang natural, sesuai vibe alasan.' : 'Gunakan bahasa Indonesia santai, bisa campur Jawa kalau pas.';
				const prompt = `buat dua kalimat santai dan pendek buat ngasih tahu kalau si user udah selesai afk dan sekarang aktif lagi di grup whatsapp. gaya bahasa super kasual, kayak ngobrol sama temen deket, sedikit nge-bully tapi gak lebay. pakai huruf kecil semua. jangan pake tanda seru (!). jangan lebih dari 100 karakter per kalimat. pisahkan kalimat dengan "\${jarak}".

alasan afk sebelumnya: "${reason}". kalimat pertama wajib awali dengan sapaan santai kayak "eh", "lho", "yo", "wah", sebut nama user (@${sender.split('@')[0]}), sebut inti alasannya (ubah jadi natural, misal "mau berak coy, sakit banget" jadi "udah selesai dari wc", "mau tidur nih ngantuk banget besok kuliah" jadi "udah bangun dari tidur"), lalu tambah alasan asli dalam italic, misal "lho kamu @${sender.split('@')[0]} udah selesai dari wc, tadi tuh kamu afk karena *${reason}*". kalau alasan kosong, bilang "tadi tuh kamu afk ga bilang kenapa". pakai 1 emoji cocok di akhir inti alasan, misal 😴 untuk tidur, 🚽 untuk ke wc.

kalimat kedua: sebut nama user (@${sender.split('@')[0]}) 1-2 kali, kasih komen santai atau nanya kabar pake durasi "${duration}". kalau durasi < 1 menit (misal "5 detik") dan alasan serius kayak tidur, kasih vibe kaget/bercanda, misal "lho anyink wkkwk cepet amat bos tidur nya, baru juga ${duration} (jam/menit/detik ini nanti kmau sesuaikan sesuai durasi) lhoo, pasti lagi ga bisa bobo ya? atau karena ada tugas dadakan 😄". kalau durasi lebih lama kayak durasi yang ga normal, misalkan user afk mau tidur, tapi dia kembali afk nya sekitar 12 jam, itu kan ga normal buat tidur, nah itu kamu kasih respon kayak kaget atau sejenis nya, ini ga harus tentang tidur, bisa mencakup yang lain, sesuai dengan alasan afk user, misal " njir lama banget tidur nyayaaa, sekitar ${duration} loh kamu afk buat bobo, pasti mimpi nya indah yaaa ciee". tambahin 1 emoji lucu di akhir, kayak 😄 atau 😎(emoji sesuaikan dengan bentuk respon kamu terhadap user tersebut).

contoh:
user: afk mau tidur nih ngantuk banget besok kuliah, durasi: 5 detik
respon:
lho kamu @${sender.split('@')[0]} udah bangun dari tidur, tadi tuh kamu afk karena *mau tidur nih ngantuk banget besok kuliah*. 😴\${jarak}kamu bobo baru juga 5 detik loh, ga jadi bobo ya? lagi ga ngantuk apa gimana 😄

contoh:
user: afk mau tidur nih ngantuk banget besok kuliah, durasi: 2 jam
respon:
lho kamu @${sender.split('@')[0]} udah bangun dari tidur, tadi tuh kamu afk karena *mau tidur nih ngantuk banget besok kuliah*. 😴\${jarak}btw kamu  @${sender.split('@')[0]} badan kamu udah segar buat kuliah apa masih ngantuk? kamu baru tidur 2 jam loh, seharusnya udah lumayan fit yaa 😄

contoh:
user: afk mau berak coy, sakit banget, durasi: 10 menit
respon:
wah kamu @${sender.split('@')[0]} udah selesai dari wc, tadi tuh kamu afk karena *mau berak coy, sakit banget*. 🚽\${jarak}udah enak belum perutnya? kamu berak baru 10 menit loh. 😎

contoh:
user: afk tanpa alasan, durasi: 5 detik
respon:
yo kamu @${sender.split('@')[0]} udah balik, tadi tuh kamu afk ga bilang kenapa. 😆\${jarak}baru juga 5 detik loh, kemana tadi? 😎
`;
	
				const response = await axios.post("https://chateverywhere.app/api/chat/", {
					model: {
						id: "gpt-4",
						name: "GPT-4",
						maxLength: 32000,
						tokenLimit: 8000,
						completionTokenLimit: 2000,
						deploymentName: "gpt-4"
					},
					messages: [
						{ pluginId: null, content: prompt, role: "user" }
					],
					prompt: "",
					temperature: 0.8
				}, {
					headers: {
						"Accept": "/*/",
						"User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
					}
				});
	
				let result = response.data;
				console.log('Respons dari OpenAI:', result);
				result = result.toLowerCase();
				// Parsing respons
				result = result
					.split('\n')
					.map(line => line.replace(/^\d+\.\s*|\*\*|\*/g, '').trim()) // Hapus nomor, markdown bold, tapi biarkan italic
					.filter(line => line.length > 0) // Hapus baris kosong
					.slice(0, 3) // Ambil maksimal 3 kalimat
					.join('\n'); // Gabung dengan \n
	
				return result;
	
			} catch (err) {
				console.error('Kesalahan saat menghubungi OpenAI:', err);
				// Fallback dengan poin penting
				const shortReason = reason ? reason.split(' ').slice(0, 2).join(' ') : '';
				const username = `@${sender.split('@')[0]}`;
				return isJavanese(reason) ?
					(reason ? `lho udah balik dari afk, tadi afk karena *${reason}*\nlho udah beres ${shortReason}. 😎\${jarak}wis ${username} apa kabar? ${duration} doang. 😄` :
						`yo udah balik dari afk, tadi afk ga bilang kenapa\nyo udah balik lagi. 😆\${jarak}kemana aja ${username}? ${duration} doang. 😎`) :
					(reason ? `lho udah balik dari afk, tadi afk karena *${reason}*\neh udah selesai ${shortReason}. 😎\${jarak}udah ${username} oke belum? ${duration} doang. 😄` :
						`yo udah balik dari afk, tadi afk ga bilang kenapa\nwoy udah balik lagi. 😆\${jarak}ngapain aja ${username}? ${duration} doang. 😎`);
			}
		}
	
		// Dapatkan pesan end-AFK dari AI
		let endAfkMessage = await askOpenAIForEndAfk(m.sender, reason, afkDuration);
	
		// Ganti ${nama} dengan tag pengirim dan ${jarak} dengan pemisah
		endAfkMessage = endAfkMessage
			.replace(/\${nama}/g, `@${m.sender.split('@')[0]}`)
			.replace(/\${jarak}/g, '\n\n'); // Ganti ${jarak} dengan \n dan spasi
	
		// Kirim pesan end-AFK dengan mentions
		await naze.sendMessage(m.chat, {
			text: endAfkMessage,
			mentions: [m.sender]
		}, { quoted: m });
	
		// Reset status AFK
		user.afkTime = -1;
		user.afkReason = '';
	}
	//baca database message
	if (incomingMessage in db.database) {
		let response = db.database[incomingMessage];
		await naze.relayMessage(m.chat, response, { quoted: m });
	}
	
	//games
	async function handleGameMessage(naze, m) {
		if (!games[m.chat]) return;

		const game = games[m.chat];
		const currentTime = Date.now();
		const endTime = game.startTime + game.duration * 1000;
		const timeLeft = Math.max(0, Math.floor((endTime - currentTime) / 1000)); // Waktu tersisa dalam detik
		const timeUsed = Math.floor((currentTime - game.startTime) / 1000); // Waktu yang sudah digunakan dalam detik

		const userAnswer = m.text.toLowerCase().trim();
		const jawabanLower = game.jawaban.toLowerCase().trim();

		async function endGame(text) {
			if (activeTimers[m.chat]) {
				clearTimeout(activeTimers[m.chat]);
				delete activeTimers[m.chat];
			}
			await naze.sendMessage(m.chat, { text }, { quoted: m });
			delete games[m.chat];
			saveGames(games);
		}

		if (userAnswer === 'nyerah') {
			let surrenderText = `🏳️ *Kamu menyerah!* 🏳️\n\n`;
			if (game.gameName === 'lengkapikalimat') {
				const fullKalimat = game.pertanyaan.replace(/_+/, game.jawaban.toLowerCase()).replace(/_/g, '');
				surrenderText += `Jawaban: *${game.jawaban}*\nKalimat: *${fullKalimat.trim()}*`;
			} else {
				surrenderText += `Jawaban yang benar adalah: *${game.jawaban}*`;
				if (game.gameName === 'caklontong' && game.deskripsi) {
					surrenderText += `\n📜 *Penjelasan:* ${game.deskripsi}`;
				} else if (game.gameName === 'tebakgambar' && game.deskripsi) {
					surrenderText += `\n📜 *Deskripsi:* ${game.deskripsi}`;
				}
			}
			surrenderText += `\nPermainan selesai! 🎮`;
			await endGame(surrenderText);
			return;
		}

		if (!m.quoted) return;

		if (userAnswer === 'bantuan') {
			const maxBantuan = (game.gameName === 'tebakbendera' || game.gameName === 'tebakgame' || game.gameName === 'tebaklogo' || game.gameName === 'tebakangka') ? 2 : 3;
			if (game.bantuanCount >= maxBantuan) {
				await naze.sendMessage(m.chat, {
					text: `❌ *Kesempatan bantuan sudah habis!* Kamu tidak bisa meminta bantuan lagi untuk soal ini. Coba tebak atau ketik *nyerah* untuk menyerah.`
				}, { quoted: m });
				return;
			}

			game.bantuanCount++;
			const jawabanWords = game.jawaban.split(' ');
			let bantuanText = '';

			if (game.bantuanCount === 1) {
				bantuanText = jawabanWords.map(word => {
					if (word.length < 3) return word;
					return `${word[0]} ${'_ '.repeat(word.length - 1)}`.trim();
				}).join('  ');
				await naze.sendMessage(m.chat, {
					text: `💡 *Bantuan 1 (Huruf Awal):*\n${bantuanText}\n\n⏳ Masih ada waktu, coba tebak lagi! (Sisa bantuan: ${maxBantuan - game.bantuanCount})`
				}, { quoted: m });
			} else if (game.bantuanCount === 2) {
				bantuanText = jawabanWords.map(word => {
					if (word.length < 3) return word;
					return `${word[0]} ${'_ '.repeat(word.length - 2)}${word[word.length - 1]}`.trim();
				}).join('  ');
				await naze.sendMessage(m.chat, {
					text: `💡 *Bantuan 2 (Huruf Awal & Akhir):*\n${bantuanText}\n\n⏳ ${maxBantuan === 2 ? 'Ini bantuan terakhir' : 'Masih ada waktu'}, coba tebak lagi!${maxBantuan === 2 ? '' : ` (Sisa bantuan: ${maxBantuan - game.bantuanCount})`}`
				}, { quoted: m });
			} else if (game.bantuanCount === 3 && maxBantuan === 3) {
				bantuanText = jawabanWords.map(word => {
					if (word.length < 3) return word;
					const midIndex = Math.floor((word.length - 1) / 2);
					let result = '';
					for (let i = 0; i < word.length; i++) {
						if (i === 0 || i === midIndex || i === word.length - 1) {
							result += word[i];
						} else {
							result += ' _';
						}
					}
					return result.trim();
				}).join('  ');
				await naze.sendMessage(m.chat, {
					text: `💡 *Bantuan 3 (Huruf Awal, Tengah, & Akhir):*\n${bantuanText}\n\n⏳ Ini bantuan terakhir, coba tebak lagi!`
				}, { quoted: m });
			}

			saveGames(games);
			return;
		}

		if (userAnswer === jawabanLower) {
			let successText = `🎉 *Selamat, jawabanmu benar!* 🎉\n\n`;
			if (game.gameName === 'lengkapikalimat') {
				const fullKalimat = game.pertanyaan.replace(/_+/, game.jawaban.toLowerCase()).replace(/_/g, '');
				successText += `Jawaban: *${game.jawaban}*\nKalimat: *${fullKalimat.trim()}*`;
			} else {
				successText += `Jawaban: *${game.jawaban}*`;
				if (game.gameName === 'caklontong' && game.deskripsi) {
					successText += `\n📜 *Penjelasan:* ${game.deskripsi}`;
				} else if (game.gameName === 'tebakgambar' && game.deskripsi) {
					successText += `\n📜 *Deskripsi:* ${game.deskripsi}`;
				}
			}
			successText += `\n⏱️ Kamu menjawab dalam *${timeUsed} detik*!\nPermainan selesai! 🏆`;
			await endGame(successText);
		} else if (userAnswer !== '' && userAnswer !== 'bantuan') {
			const maxBantuan = (game.gameName === 'tebakbendera' || game.gameName === 'tebakgame' || game.gameName === 'tebaklogo' || game.gameName === 'tebakangka') ? 2 : 3;
			let replyText = `❌ *Jawaban salah!* 😔\n\nCoba lagi, kamu pasti bisa! 💪\n⏳ Waktu tersisa: *${timeLeft} detik*\n💡 Ketik *bantuan* untuk meminta bantuan (Sisa: ${maxBantuan - game.bantuanCount})\n🏳️ Ketik *nyerah* untuk menyerah.`;
			await naze.sendMessage(m.chat, { text: replyText }, { quoted: m });
		}
	} await handleGameMessage(naze, m);
	//waktu sholat
	const jadwalSholat = {
	Subuh: '05:05',
	Dzuhur: '12:25',
	Ashar: '15:33',
	Maghrib: '18:28',
	Isya: '19:34'
	};
	if (!this.intervalSholat) this.intervalSholat = null;
	if (!this.waktusholat) this.waktusholat = {};
	if (this.intervalSholat) clearInterval(this.intervalSholat);
	setTimeout(() => {
	this.intervalSholat = setInterval(async () => {
		const jamSholat = moment.tz('Asia/Jakarta').locale('id').format('HH:mm');
		let sekarang = moment.tz('Asia/Jakarta');
		let selisih = moment.duration(tanggalIdulFitri.diff(sekarang));

		let hari = Math.floor(selisih.asDays());
		let jam = selisih.hours();
		let menit = selisih.minutes();
		let detik = selisih.seconds();
		let countdownText = `🌙 *Hitung Mundur Idul Fitri 1446 H* 🕌\n`
			+ `📆 *Tersisa:* ${hari} hari, ${jam} jam, ${menit} menit, ${detik} detik lagi! ⏳\n`
			+ `🕌 Bersiaplah menyambut hari kemenangan! 🎊✨`;

		for (const [sholat, waktu] of Object.entries(jadwalSholat)) {
			if (jamSholat === waktu && this.waktusholat[sholat] !== jamSholat) {
				this.waktusholat[sholat] = jamSholat;

				for (const [idnya, settings] of Object.entries(db.groups)) {
					if (settings.waktusholat) {
						let teks1 = `📢 Adzan (${sholat}) telah berkumandang!`;
						let teks2 = `﷽ *Waktunya Sholat* ﷽

🌙 Waktu Sholat *${sholat}* telah tiba pada pukul 🕰 *${waktu} WIB*  

🕋 Segera sucikan diri dan tunaikan sholat dengan khusyuk. 🕌  

📍 Jadwal sholat ini berdasarkan waktu untuk:
🏙️ *Pekanbaru* dan *sekitarnya*`;

						let nomorBot = global.number_bot;
						let fakeReply = {
							key: {
								fromMe: false,
								participant: nomorBot + '@s.whatsapp.net',
								remoteJid: idnya
							},
							message: { conversation: teks1 }
						};

						await naze.sendMessage(idnya, {
							text: teks2,
							contextInfo: {
								externalAdReply: {
									title: 'Waktunya Sholat!',
									body: `(${sholat}) - ${waktu} WIB`,
									thumbnailUrl: `${global.thumbnailmasjid}`,
									mediaType: 1,
									previewType: 0,
									renderLargerThumbnail: true,
								}
							}
						}, { quoted: fakeReply, ephemeralExpiration: m.expiration || 0 }).catch(e => {});
					}
				}
			}
		}
	}, 60000);
	}, time_end);
// Auto Backup
const backupTimes = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
let lastBackupDate = null;
if (!this.intervalBackup) this.intervalBackup = null;
if (this.intervalBackup) clearInterval(this.intervalBackup);
setTimeout(() => {
    this.intervalBackup = setInterval(async () => {
        const now = new Date();
        const currentTime = moment.tz('Asia/Jakarta').format('HH:mm');
        const currentDate = now.toISOString().split('T')[0];
        
        // Reset lastBackupDate jika hari baru
        if (lastBackupDate !== currentDate) {
            this.lastBackup = null;
            lastBackupDate = currentDate;
        }
        
        if (backupTimes.includes(currentTime) && this.lastBackup !== currentTime) {
            this.lastBackup = currentTime;
            try {
                const backupModule = require('./plugins/ownermenu/getscript.js');
                const botNumber = naze.user?.id.split(':')[0] + '@s.whatsapp.net';
                const ownerJid = global.owner[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                const dummyMessage = {
                    sender: ownerJid,
                    chat: ownerJid,
                    key: {
                        remoteJid: ownerJid,
                        fromMe: false,
                        id: `AUTO_BACKUP_${Date.now()}`
                    },
                    message: {
                        conversation: 'Auto Backup Trigger'
                    },
                    quoted: {
                        key: {
                            remoteJid: ownerJid,
                            fromMe: false,
                            id: `AUTO_BACKUP_QUOTED_${Date.now()}`
                        },
                        message: {
                            conversation: 'Auto Backup Quoted Message'
                        }
                    }
                };
                
                await backupModule.run({ naze, m: dummyMessage });
            
            } catch (error) {
                await naze.sendMessage(global.owner[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net', {
                    text: `⚠️ *Auto Backup Gagal* ⚠️\nError: ${error.message}\nDate: ${currentDate}`
                });
            }
        }
    }, 60000); // Check every minute
}, 1000);
    // Fungsi pesan daily
const jadwalDaily = {
    Daily: '07:30' // ubah waktu pesan daily nya
};

if (!this.intervalDaily) this.intervalDaily = null;
if (!this.waktudaily) this.waktudaily = {};
if (this.intervalDaily) clearInterval(this.intervalDaily);

setTimeout(() => {
    this.intervalDaily = setInterval(async () => {
        const jamDaily = moment.tz('Asia/Jakarta').locale('id').format('HH:mm');

        for (const [daily, waktu] of Object.entries(jadwalDaily)) {
            if (jamDaily === waktu && this.waktudaily[daily] !== jamDaily) {
                this.waktudaily[daily] = jamDaily;

                for (const [idnya, settings] of Object.entries(db.groups)) {
                    // Inisialisasi dailyActive jika belum ada, default false
                    if (typeof settings.dailyActive === 'undefined') {
                        db.groups[idnya] = db.groups[idnya] || {};
                        db.groups[idnya].dailyActive = false;
                    }

                    // Hanya lanjutkan jika dailyActive true dan cek inisialisasi dailyMessage
                    if (settings.dailyActive) {
                        // Inisialisasi dailyMessage hanya jika belum ada
                        if (!settings.dailyMessage) {
                            db.groups[idnya].dailyMessage = 'Hallo semua nya, @greeting';
                        }

                        try {
                            // Ambil teks pesan dari db
                            let teksDaily = settings.dailyMessage;

                            // Integrasi dengan replacePlaceholders
                            const { replacePlaceholders } = require('./database/list_function.js');
                            const m = {
                                sender: global.number_bot + '@s.whatsapp.net', // Sender default (bot)
                                pushName: global.botname,
                                chat: idnya,
                                isGroup: true
                            };
                            teksDaily = await replacePlaceholders(teksDaily, m, naze);

                            // Kirim pesan tanpa thumbnail
                            let nomorBot = global.number_bot;
                            let fakeReply = {
                                key: {
                                    fromMe: false,
                                    participant: nomorBot + '@s.whatsapp.net',
                                    remoteJid: idnya
                                },
                                message: { conversation: '📢 Pesan Harian' }
                            };

                            await naze.sendMessage(idnya, {
                                text: teksDaily
                            }, { quoted: fakeReply, ephemeralExpiration: m.expiration || 0 }).catch(e => {
                                console.error(`[DAILY-MESSAGE] Gagal mengirim pesan harian ke grup ${idnya}:`, e);
                            });
                        } catch (err) {
                            console.error(`[DAILY-MESSAGE] Error mengirim pesan harian ke grup ${idnya}:`, err);
                        }
                    }
                }
            }
        }
    }, 60000); // Cek setiap 1 menit
}, time_end);

	//waktu puasa
	const pickHadits = (list) => list[Math.floor(Math.random() * list.length)];
	if (!this.intervalPuasa) this.intervalPuasa = null;
	if (!this.waktupuasa) this.waktupuasa = {};
	if (this.intervalPuasa) clearInterval(this.intervalPuasa);
	setTimeout(() => {
		this.intervalPuasa = setInterval(async () => {
			const jamPuasa = moment.tz('Asia/Jakarta').locale('id').format('HH:mm');
	
			for (const [puasa, waktu] of Object.entries(jadwalPuasa)) {
				if (jamPuasa === waktu && this.waktupuasa[puasa] !== jamPuasa) {
					this.waktupuasa[puasa] = jamPuasa;
	
					// Pilih pesan acak sesuai waktu puasa
					// Pilih pesan acak sesuai waktu puasa
					let pesanRandom;
					if (puasa === "Sahur") pesanRandom = pickRandom(pesansahur);
					if (puasa === "Imsak") pesanRandom = pickRandom(pesanimsak);
					if (puasa === "Berbuka") pesanRandom = pickRandom(pesanmaghrib);
			
					// Pilih hadits acak sesuai waktu puasa
					let haditsRandom;
					if (puasa === "Sahur") haditsRandom = pickHadits(haditsSahur);
					if (puasa === "Imsak") haditsRandom = pickHadits(haditsImsak);
					if (puasa === "Berbuka") haditsRandom = pickHadits(haditsMaghrib);
	
					for (const [idnya, settings] of Object.entries(db.groups)) {
						if (settings.waktupuasa) {
							let teks1 = `📢 Waktu (${puasa}) telah tiba!`;
							let teks2 = ` ﷽  *Waktunya ${puasa}*  ﷽

🌙 *Waktu ${puasa} telah tiba!*  
📅 *Pukul:* 🕰 *${waktu} WIB*  

${pesanRandom}

📍 Jadwal puasa ini berdasarkan waktu untuk:  
🏙️ *Pekanbaru* dan *sekitarnya*  `;
	
							let nomorBot = global.number_bot;
							let fakeReply = {
								key: {
									fromMe: false,
									participant: nomorBot + '@s.whatsapp.net',
									remoteJid: idnya
								},
								message: { conversation: teks1 }
							};
	
							await naze.sendMessage(idnya, {
								text: teks2,
								contextInfo: {
									externalAdReply: {
										title: 'Waktunya puasa!',
										body: `(${puasa}) - ${waktu} WIB`,
										
										thumbnailUrl: `${global.thumbnailmasjid}`,
										mediaType: 1,
										previewType: 0,
										renderLargerThumbnail: true,
									}
								}
							}, { quoted: fakeReply, ephemeralExpiration: m.expiration || 0 }).catch(e => {});
						}
					}
				}
			}
		}, 60000);
	}, time_end);
	//panggil bot
	if (deteksiPanggilanBot(body) && m.sender !== global.number_bot + '@s.whatsapp.net' && !m.quoted // Cegah membalas pesan yang dikutip, biar gak spam
	) {let respon = [
			"Iya, aku di sini! Ada yang bisa Bangsul bantu? 😊",
			"Dipanggil kok manis, ada apa nih? 😏",
			"Yo! Bangsul hadir, ada yang bisa dibantu?",
			"Kenapa manggil-manggil aku? Butuh bantuan? 😁",
			"Bangsul on, siap melayani! 😎",
			"Hadir bosku, ada apa nih? 🔥",
			"Ada yang bisa Bangsul kerjakan? Jangan sungkan! 😆",
			"Eh, ada yang nyari aku? Aku di sini dong~",
			"Panggilan diterima! Bangsul siap beraksi! 🚀",
			"Wih, dipanggil sama yang punya bot. Gimana nih? 😏",
			"Bangsul detected! Ada urusan penting? 🤔",
			"Yo! Bangsul reporting in! Apa kabar nih?",
			"Wah, wah, ada yang kangen sama Bangsul? 🤭",
			"Manggil aku tuh ada maksudnya kan? Jangan PHP ya~",
			"Aku di sini, jangan ragu buat tanya-tanya! 😊",
			"Bangsul datang, siap membantu! 🚀",
			"Gimana, butuh sesuatu? Bangsul selalu sedia! ✨",
			"Hayo, mau minta tolong apa nih? Jangan sungkan~",
			"Langsung hadir nih kalau dipanggil! Ada yang bisa aku bantu?",
			"Bangsul siap! Butuh hiburan, info, atau apapun? 😆",
			"Aku denger namaku disebut! Ada apa nih? 😎",
			"Yessir! Bangsul ready to serve! 🚀",
			"Duh, dipanggil-panggil bikin aku tersipu 😳",
			"Bangsul is here, tell me what you need! 😃"
		];

		let randomRespon = respon[Math.floor(Math.random() * respon.length)];
		m.reply(randomRespon);
	}
const jadwalAbsen = {
    Absen: '07:00'
};

if (!this.intervalAbsen) this.intervalAbsen = null;
if (!this.waktuabsen) this.waktuabsen = {};
if (this.intervalAbsen) clearInterval(this.intervalAbsen);

setTimeout(() => {
    this.intervalAbsen = setInterval(async () => {
        const jamAbsen = moment.tz('Asia/Jakarta').locale('id').format('HH:mm');

        for (const [absen, waktu] of Object.entries(jadwalAbsen)) {
            if (jamAbsen === waktu && this.waktuabsen[absen] !== jamAbsen) {
                this.waktuabsen[absen] = jamAbsen;

                for (const [idnya, settings] of Object.entries(db.groups)) {
                    if (settings.autoabsen) {
                        try {
                            // Ambil metadata grup
                            const metadata = await naze.groupMetadata(idnya);

                            // Buat objek message (m) untuk dikirim ke plugin
                            const m = {
                                key: {
                                    remoteJid: idnya,
                                    fromMe: false,
                                    id: crypto.randomUUID(),
                                    participant: global.number_bot + '@s.whatsapp.net' // Tambahkan participant
                                },
                                message: { conversation: '' },
                                chat: idnya,
                                isGroup: true,
                                metadata: metadata,
                                isBotAdmin: metadata.participants.some(p => p.id === naze.user.id && p.admin),
                                sender: global.number_bot + '@s.whatsapp.net' // Tambahkan sender
                            };

                            // Panggil plugin absen
                            const absenPlugin = require('./plugins/grupmenu/absen.js');
                            await absenPlugin.run({ naze, m });

                        } catch (err) {
                            console.error(`[AUTO-ABSEN] Gagal mengirim absen untuk grup ${idnya}:`, err);
                        }
                    }
                }
            }
        }
    }, 60000);
}, time_end);


switch(command) {
	//==================================================================
	//case add = 1
	

case '19rujxl1e'	: {
		
		console.log('.')
		
	}
	break
	// confess = 2
	case 'confes'	 	: case 'confess'	 : case 'menfes'   :	case 'menfess'	  : {
		if (m.isGroup) return await global.sendMessageWithThumbnail(naze, m.chat, 'private', m);
		if (menfes[m.sender]) return m.reply(`Kamu Sedang Berada Di Sesi ${command}!`)
		if (!text) return m.reply(`Example : ${prefix + command} 62xxxx|Nama Samaran`)
		let [teks1, teks2] = text.split`|`
		if (teks1) {
			const tujuan = teks1.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
			const onWa = await naze.onWhatsApp(tujuan)
			if (!onWa.length > 0) return m.reply('Nomer Tersebut Tidak Terdaftar Di Whatsapp!')
			menfes[m.sender] = {
				tujuan: tujuan,
				nama: teks2 ? teks2 : 'Orang',
				waktu: setTimeout(() => {
					if (menfes[m.sender]) m.reply(`_Waktu ${command} habis_`)
					delete menfes[m.sender];
				}, 600000)
			};
			menfes[tujuan] = {
				tujuan: m.sender,
				nama: 'Penerima',
				waktu: setTimeout(() => {
					if (menfes[tujuan]) naze.sendMessage(tujuan, { text: `_Waktu ${command} habis_` });
					delete menfes[tujuan];
				}, 600000)
			};
			naze.sendMessage(tujuan, { text: `_${command} connected_\n*Note :* jika ingin mengakhiri ketik _*${prefix}del${command}*_` });
			m.reply(`_Memulai ${command}..._\n*Silahkan Mulai kirim pesan/media*\n*Durasi ${command} hanya selama 10 menit*\n*Note :* jika ingin mengakhiri ketik _*${prefix}del${command}*_`)
		} else {
			m.reply(`Masukkan Nomernya!\nExample : ${prefix + command} 62xxxx|Nama Samaran`)
		}
	}
	break
	case 'delconfes' 	: case 'delconfess'  : case 'delmenfes':	case 'delmenfess' : {
		if (!menfes[m.sender]) return m.reply(`Kamu Tidak Sedang Berada Di Sesi ${command.split('del')[1]}!`)
		let anu = menfes[m.sender]
		naze.sendMessage(anu.tujuan, { text: `Chat Di Akhiri Oleh ${anu.nama ? anu.nama : 'Seseorang'}` })
		m.reply(`Sukses Mengakhiri Sesi ${command.split('del')[1]}!`)
		delete menfes[anu.tujuan];
		delete menfes[m.sender];
	}
	break
	//==================================================================
	//grupmenu = 2 fitur
	case 'listonline'  : case 'liston': {
		if (!m.isGroup) return m.reply(mess.group)
		let id = args && /\d+\-\d+@g.us/.test(args[0]) ? args[0] : m.chat
		if (!store.presences || !store.presences[id]) return m.reply('Sedang Tidak ada yang online!')
		let online = [...Object.keys(store.presences[id]), botNumber]
		await m.reply('List Online:\n\n' + online.map(v => setv + ' @' + v.replace(/@.+/, '')).join`\n`, { mentions: online }).catch((e) => m.reply('Sedang Tidak Ada Yang Online..'))
	}
	break
	case 'afk'         : {
		let user = global.db.users[m.sender];
		user.afkTime = +new Date();
		user.afkReason = text || ''; // Simpan alasan, kosong jika tidak ada
	
		// Fungsi sederhana untuk deteksi nuansa Jawa
		const isJavanese = (text) => {
			const javaneseWords = ['mangan', 'mlaku', 'turun', 'ndelok', 'ngomong', 'pengin', 'arep', 'sugeng', 'sore', 'enak', 'apik', 'sae', 'koyok', 'opo', 'yo', 'wis', 'lho', 'kok', 'ra', 'ora'];
			return text && javaneseWords.some(word => text.toLowerCase().includes(word));
		};
	
		// Fungsi untuk meminta pesan AFK dari AI
		async function askOpenAIForAfk(sender, reason) {
			try {
				console.log('Mengirimkan permintaan ke OpenAI untuk pesan AFK...');
				const languageHint = isJavanese(reason) ? 'Gunakan bahasa Jawa santai atau campuran Jawa-Indonesia yang gaul, sesuaikan dengan vibe alasan.' : 'Gunakan bahasa Indonesia gaul, bisa campur sedikit Jawa kalau cocok.';
				const prompt = `
	Buat satu kalimat singkat dan super santai buat ngasih tahu di grup WhatsApp kalau user lagi AFK. ${languageHint} Gaya bahasanya harus kayak ngobrol sama temen, pake istilah lokal yang asik, ga pake kata baku. Pesan harus unik, ga boleh kaku atau kayak template.
	
	Kalau user kasih alasan AFK, alasan itu: "${reason}". Jangan ulang alasan apa adanya, tapi ambil inti atau poin pentingnya aja dan bikin kalimat yang lebih seru. Misal, alasan "mau berak coy, sakit banget" jadi "lagi ke WC" atau "perut ngeluh". Kalau alasan pake bahasa Jawa, misal "arep mangan", jadi "lagi nyemil" atau "njam-njam dhisik". Kalau ga ada alasan (kosong), bikin pesan asik tanpa sebutin alasan, kayak "ngapain ya dia?" atau "lho, kabur nang ndi?".
	
	Awali dengan sapaan gaul yang beda-beda, kayak "woy", "eh", "bro", "guys", "yow", "cie", "lho", "yok" (atau kalau Jawa: "lha", "ko", "yo"). Sebut \${nama} sekali di awal dan sekali di akhir. Tambahin 1-2 emoji yang nyambung sama vibe (misal 😅, 😜, 🏃, 😎, 🍽️). Pesan maksimal 100 karakter biar pas di WhatsApp.
	
	Contoh:
	- Alasan "mau berak coy, sakit banget": "Eh, si \${nama} AFK, lagi buru-buru ke WC! Cepet sehat, \${nama}! 😅"
	- Alasan "arep mangan": "Lho, \${nama} AFK, lagi nyemil dhisik. Enak ta, \${nama}? 🍽️"
	- Tanpa alasan: "Woy, \${nama} ngilang AFK nih. Ngapain ya, \${nama}? 😆"
	
	Hanya kembalikan SATU kalimat, tanpa nomor atau daftar. Langsung ke inti, ga pake kalimat pembuka formal.
				`;
				const response = await axios.post("https://chateverywhere.app/api/chat/", {
					model: {
						id: "gpt-4",
						name: "GPT-4",
						maxLength: 32000,
						tokenLimit: 8000,
						completionTokenLimit: 5000,
						deploymentName: "gpt-4"
					},
					messages: [
						{ pluginId: null, content: prompt, role: "user" }
					],
					prompt: "",
					temperature: 0 // Temperatur tinggi untuk variasi
				}, {
					headers: {
						"Accept": "/*/",
						"User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, seperti Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
					}
				});
	
				let result = response.data;
				console.log('Respons dari OpenAI:', result);
				// Pastikan hanya satu kalimat dengan membersihkan nomor atau daftar
				result = result.replace(/^\d+\.\s*|\n\s*\d+\.\s*/g, '').split('\n')[0];
				return result.replace(/\*\*(.*?)\*\*/g, '*$1*'); // Perbaiki format Markdown
			} catch (err) {
				console.error('Kesalahan saat menghubungi OpenAI:', err);
				// Fallback dengan poin penting
				const shortReason = text ? text.split(' ').slice(0, 2).join(' ') : '';
				return isJavanese(reason) ? 
					(text ? `Lho, si \${nama} AFK, lagi ${shortReason}. Cepet balik, \${nama}! 😎` : 
							`Yo, \${nama} AFK lho, ra bilang nang ndi. Ngopo ya, \${nama}? 😆`) : 
					(text ? `Eh, si \${nama} AFK, lagi ${shortReason}. Buruan balik, \${nama}! 😎` : 
							`Woy, \${nama} kabur AFK nih. Ngapain ya, \${nama}? 😆`);
			}
		}
	
		// Dapatkan pesan AFK dari AI
		let afkMessage = await askOpenAIForAfk(m.sender, text);
	
		// Ganti ${nama} dengan tag pengirim
		afkMessage = afkMessage.replace(/\${nama}/g, `@${m.sender.split('@')[0]}`);
	
		// Kirim pesan AFK dengan mentions
		await naze.sendMessage(m.chat, { 
			text: afkMessage, 
			mentions: [m.sender] 
		}, { quoted: m });
	
	}
		break;
	//==================================================================
	// ownermenu = 13 fitur
	case 'listgc1'	    : {
		if (!isCreator) return m.reply(mess.owner)
		
			const pembuka1 = '╔═〇';
			const pembuka2 = '╠═════════〇';
			const pembuka3 = '╚═════════════════〇';
			const fitur1   = '╔»';
			const fitur2   = '╠»';
			const fitur3   = '╚»';
		// Ambil semua chat grup
		let anu = store.chats.all().filter(v => v.id.endsWith('@g.us')).map(v => v.id)
		let teks = `${pembuka1} *LIST GROUP CHAT*\n${fitur3} *Total Group* : ${anu.length} Group\n\n`
		if (anu.length === 0) return m.reply(teks)
		
		for (let i of anu) {
			// Ambil metadata grup
			let metadata = store.groupMetadata[i] || await naze.groupMetadata(i)
			
			// Tambahkan detail grup ke teks
			teks += `${fitur1} *Nama :* ${metadata.subject}\n` +
					`${fitur2} *Admin :* ${metadata.owner ? `@${metadata.owner.split('@')[0]}` : '-'}\n` +
					`${fitur2} *ID :* ${metadata.id}\n` +
					`${fitur2} *Member :* ${metadata.participants.length}\n` +
					`${pembuka3}\n\n`
		}
		
		// Kirim teks dengan mentions
		await naze.sendTextMentions(m.chat, teks, m)
	}
	break
	case 'listpc': {
    if (!isCreator) return m.reply(mess.owner);

    let chats = await store.chats.all();
    let privateChats = chats.filter(v => v.id.endsWith('.net') && !v.id.includes('@g.us'));

    if (privateChats.length === 0) {
        return m.reply("❌ Tidak ada chat pribadi yang ditemukan. 😢");
    }

    let teks = `🌐 *Daftar Chat Pribadi Bot*\n\n`;
    for (let i = 0; i < privateChats.length; i++) {
        let chat = privateChats[i];
        let id = chat.id;
        let number = id.split('@')[0];
        let pushName = (store.messages[id]?.array?.[0]?.pushName) || chat.name || 'Tidak Diketahui';

        teks += `📌 *${i + 1}. ${pushName}*\n`;
        teks += `📱 *Nomor*: @${number}\n`;
        teks += `🔗 *Link Chat*: https://wa.me/${number}\n\n`;
    }

    teks += `📊 *Total Chat Pribadi*: ${privateChats.length}\n`;
    teks += `🤖 Bot aktif melayani semua chat ini!`;

    await naze.sendTextMentions(m.chat, teks, m);
}
break;
	case 'addcase'		: {
					if (!isCreator) return m.reply(mess.owner)
					if (!text && !text.startsWith('case')) return m.reply('Masukkan Casenya!')
					fs.readFile('naze.js', 'utf8', (err, data) => {
						if (err) {
							console.error('Terjadi kesalahan saat membaca file:', err);
							return;
						}
						const posisi = data.indexOf("case '19rujxl1e'	:");
						if (posisi !== -1) {
							const codeBaru = data.slice(0, posisi) + '\n' + `${text}` + '\n' + data.slice(posisi);
							fs.writeFile('naze.js', codeBaru, 'utf8', (err) => {
								if (err) {
									m.reply('Terjadi kesalahan saat menulis file: ', err);
								} else {
									m.reply('Case berhasil ditambahkan');
								}
							});
						} else {
							m.reply('Gagal Menambahkan case!');
						}
					});
				}
				break
	case 'getcase'      : {
		if (!isCreator) return m.reply(mess.owner);
		if (!text) return m.reply('Masukkan Nama Casenya!');
		
		const getCase = (cases) => {
			const fileContent = fs.readFileSync("naze.js").toString();
			const caseStartIndex = fileContent.indexOf(`case '${cases}'`);
			
			if (caseStartIndex === -1) {
				return `Case '${cases}' tidak ditemukan!`;
			}
			
			const caseContent = fileContent.split(`case '${cases}'`)[1];
			
			if (!caseContent || caseContent.indexOf('break') === -1) {
				return `Tidak bisa mendapatkan konten case '${cases}'.`;
			}
			
			return `case '${cases}'` + caseContent.split("break")[0] + "break";
		};
		
		m.reply(`${getCase(text)}`);
	}
	break;
	case 'delcase'      : {
		if (!isCreator) return m.reply(mess.owner)
		if (!text) return m.reply('Masukkan Nama Casenya!')
		fs.readFile('naze.js', 'utf8', (err, data) => {
			if (err) {
				console.error('Terjadi kesalahan saat membaca file:', err);
				return;
			}
			const regex = new RegExp(`case\\s+'${text.toLowerCase()}':[\\s\\S]*?break`, 'g');
			const modifiedData = data.replace(regex, '');
			fs.writeFile('naze.js', modifiedData, 'utf8', (err) => {
				if (err) {
					m.reply('Terjadi kesalahan saat menulis file: ', err);
				} else {
					m.reply('Case berhasil dihapus dari file');
				}
			});
		});
	}
	break
	case 'addimage'     : {
		if (!isCreator) return m.reply(mess.owner)
		if (args.length < 1) return m.reply(`*reply pesan!!!* lalu gunakan perintah seperti ini:\n\n${prefix}delimage (namanya)  `)
		if (Image.includes(q)) return m.reply("nama telah di gunakan!!!")
		let delb = await naze.downloadAndSaveMediaMessage(quoted)
		Image.push(q)
		await fse.copy(delb, `./data/media/image/${q}.jpg`)
		fs.writeFileSync('./data/media/database/image.json', JSON.stringify(Image))
		fs.unlinkSync(delb)
		m.reply(`sukses menambah "${q}" ke dalam database`)
		}
	break
	case 'delimage'     : {
		if (!isCreator) return m.reply(mess.owner)
		if (args.length < 1) return m.reply(`*reply pesan!!!* lalu gunakan perintah seperti ini:\n\n${prefix}delimage (namanya) `)
		if (!Image.includes(q)) return m.reply("nama tidak tersedia di dalam database!!!")
		let wanu = Image.indexOf(q)
		Image.splice(wanu, 1)
		fs.writeFileSync('./data/media/database/image.json', JSON.stringify(Image))
		fs.unlinkSync(`./data/media/image/${q}.jpg`)
		m.reply(`sukses menghapus "${q}" dari database`)
		}
	break
	case 'addvideo'     : {
		if (!isCreator) return m.reply(mess.owner)
		if (args.length < 1) return m.reply(`*reply pesan!!!* lalu gunakan perintah seperti ini:\n\n${prefix}delvideo (namanya) `)
		if (Video.includes(q)) return m.reply("nama telah di gunakan!!!")
		let delb = await naze.downloadAndSaveMediaMessage(quoted)
		Video.push(q)
		await fse.copy(delb, `./data/media/video/${q}.mp4`)
		fs.writeFileSync('./data/media/database/video.json', JSON.stringify(Video))
		fs.unlinkSync(delb)
		m.reply(`sukses menambah Video\nsilahkan cek pada list ya..\n gunakan perintah:  ${prefix}listvideo`)
		}
	break
	case 'delvideo'     : {
		if (!isCreator) return m.reply(mess.owner)
		if (args.length < 1) return m.reply(`*reply pesan!!!* lalu gunakan perintah seperti ini:\n\n${prefix}delvideo (namanya) `)
		if (!Video.includes(q)) return m.reply("The name does not exist in the database")
		let wanu = Video.indexOf(q)
		Video.splice(wanu, 1)
		fs.writeFileSync('./data/media/database/video.json', JSON.stringify(Video))
		fs.unlinkSync(`./data/media/video/${q}.mp4`)
		m.reply(`sukses menghapus "${q}" dari database`)
		}
	break
	case 'addvn'        : {
		if (!isCreator) return m.reply(mess.owner)
		if (args.length < 1) return m.reply(`*reply pesan!!!* lalu gunakan perintah seperti ini:\n\n${prefix}addvn (namanya) `)
		if (VoiceNote.includes(q)) return m.reply("nama telah di gunakan!!!")
		let delb = await naze.downloadAndSaveMediaMessage(quoted)
		VoiceNote.push(q)
		await fse.copy(delb, `./data/assets/audio/${q}.mp3`)
		fs.writeFileSync('./data/media/database/vn.json', JSON.stringify(VoiceNote))
		fs.unlinkSync(delb)
		m.reply(`sukses menambah "${q}" ke dalam database`)
		}
	break
	case 'delvn'        : {
		if (!isCreator) return m.reply(mess.owner)
		if (args.length < 1) return m.reply(`*reply pesan!!!* lalu gunakan perintah seperti ini:\n\n${prefix}delvn (namanya)  `)
		if (!VoiceNote.includes(q)) return m.reply("The name does not exist in the database")
		let wanu = VoiceNote.indexOf(q)
		VoiceNote.splice(wanu, 1)
		fs.writeFileSync('./data/media/database/vn.json', JSON.stringify(VoiceNote))
		fs.unlinkSync(`./data/assets/audio/${q}.mp3`)
		m.reply(`sukses menghapus "${q}" dari database`)
		}
	break
	case 'addsticker'   : {
		if (!isCreator) return m.reply(mess.owner)
		if (args.length < 1) return m.reply(`*reply pesan!!!* lalu gunakan perintah seperti ini:\n\n${prefix}delsticker (namanya) `)
		if (Sticker.includes(q)) return m.reply("nama telah di gunakan!!!")
		let delb = await naze.downloadAndSaveMediaMessage(quoted)
		Sticker.push(q)
		await fse.copy(delb, `./data/media/sticker/${q}.webp`)
		fs.writeFileSync('./data/media/database/sticker.json', JSON.stringify(Sticker))
		fs.unlinkSync(delb)
		m.reply(`sukses menambah "${q}" ke dalam database`)
		}
	break
	case 'delsticker'   : {
		if (!isCreator) return m.reply(mess.owner)
		if (args.length < 1) return m.reply(`*reply pesan!!!* lalu gunakan perintah seperti ini:\n\n${prefix}delsticker (namanya) `)
		if (!Sticker.includes(q)) return m.reply("nama tidak tersedia di dalam database!!!")
		let wanu = Sticker.indexOf(q)
		Sticker.splice(wanu, 1)
		fs.writeFileSync('./data/media/database/sticker.json', JSON.stringify(Sticker))
		fs.unlinkSync(`./data/media/sticker/${q}.webp`)
		m.reply(`sukses menghapus "${q}" dari database`)
		}
	break
	
	//==================================================================
	// Menu	
default:
	if (budy.startsWith('>')) {
    if (!isCreator) return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
    try {
        let code = budy.slice(2).trim();

        // Menangkap output console.log
        let consoleOutput = [];
        const originalConsoleLog = console.log;
        console.log = (...args) => {
            const output = args.map(item => typeof item === 'object' ? require('util').inspect(item) : item).join(' ');
            consoleOutput.push(output);
            originalConsoleLog(...args); // Tetap mencetak ke log bot
        };

        // Jika kode mengandung "return", bungkus dalam async function
        if (code.startsWith("return")) {
            code = `(async () => { ${code} })()`;
        } else if (code.startsWith("async () =>")) {
            // Jika kode adalah async arrow function, langsung eksekusi
            code = `(${code})()`;
        } else {
            // Pastikan mendukung deklarasi const dan let
            code = `(async () => { 
                try { 
                    ${code.includes("const") || code.includes("let") ? code : "return (" + code + ")"}; 
                } catch (e) { 
                    return e.toString(); 
                } 
            })()`;
        }

        // Eksekusi kode
        let evaled = await eval(code);
        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);

        // Kembalikan console.log ke fungsi aslinya
        console.log = originalConsoleLog;

        // Gabungkan hasil eval dan console.log (jika ada)
        let finalOutput = evaled;
        if (consoleOutput.length > 0) {
            finalOutput = `📜 *Hasil Console Log:*\n${consoleOutput.join('\n')}\n\n📟 *Hasil Eksekusi:*\n${evaled}`;
        }

        // Kirim hasil dengan thumbnail
        await naze.sendMessage(m.chat, {
            text: finalOutput,
            contextInfo: {
                forwardingScore: 10,
                isForwarded: true,
                externalAdReply: {
                    title: '✅ Hasil Eksekusi Kode',
                    body: 'BangsulBotz',
                    thumbnailUrl: global.getRandomThumbnailUrl(),
                    mediaType: 1,
                    previewType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m });
    } catch (err) {
        // Kirim error dengan thumbnail
        await naze.sendMessage(m.chat, {
            text: `${String(err)}`,
            contextInfo: {
                forwardingScore: 10,
                isForwarded: true,
                externalAdReply: {
                    title: '❌ Error Eksekusi Kode',
                    body: `${global.botname}`,
                    thumbnailUrl: global.getRandomThumbnailUrl(),
                    mediaType: 1,
                    previewType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m });

        // Analisis error dengan Gemini
        let currentKeyIndex = 0;
        const analyzeError = async () => {
            const GEMINI_API_KEY = global.key_gemini[currentKeyIndex];
            try {
                const response = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        contents: [{
                            parts: [{
                                text: `Kamu adalah AI yang ahli dalam bahasa pemrograman dan mampu menganalisa log error serta kode yang dieksekusi. Jawab dengan bahasa Indonesia yang natural dan boleh kasih emoji untuk kesan lebih hidup. Berikan saran spesifik seperti baris yang bermasalah dan solusi (misalnya, tambah baris ini sebelum/sesudah baris tertentu). Jangan panjang-panjang ya! Analisa log error dan kode ini:\n\nKode yang Dieksekusi:\n${budy.slice(2).trim()}\n\nError: ${err.message}\n\nStack Trace: ${err.stack}`
                            }]
                        }],
                        generationConfig: {
                            temperature: 0
                        },
                        systemInstruction: {
                            parts: [{
                                text: "Kamu adalah AI yang ahli dalam bahasa pemrograman, dan mampu menganalisa log error serta kode. Jawab dengan bahasa Indonesia yang natural dan boleh kasih emoji seperti reaksi kamu supaya kesan lebih hidup, berikan saran spesifik (misalnya, tambah baris ini sebelum/sesudah baris tertentu), jangan panjang-panjang ya untuk menjawabnya."
                            }]
                        }
                    }
                );
                return response.data.candidates[0].content.parts[0].text;
            } catch (err) {
                if (err.response?.status === 429 || err.message.includes('API key') || err.message.includes('quota') || err.message.includes('limit')) {
                    currentKeyIndex = (currentKeyIndex + 1) % global.key_gemini.length;
                    if (currentKeyIndex === 0) {
                        throw new Error('Semua kunci API gagal');
                    }
                    return analyzeError();
                }
                throw err;
            }
        };

        try {
            const geminiAnalysis = await analyzeError();
            await naze.sendMessage(m.chat, {
                text: geminiAnalysis,
                contextInfo: {
                    forwardingScore: 10,
                    isForwarded: true,
                    externalAdReply: {
                        title: `🤖 Analisis Error oleh ${global.botname}`,
                        body: `${global.botname}`,
                        thumbnailUrl: global.getRandomThumbnailUrl(),
                        mediaType: 1,
                        previewType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });
        } catch (analysisErr) {
            // Tidak ada tindakan tambahan jika analisis gagal
        }
    }
}

if (budy.startsWith('<')) {
    if (!isCreator) return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
    try {
        // Menangkap output console.log
        let consoleOutput = [];
        const originalConsoleLog = console.log;
        console.log = (...args) => {
            const output = args.map(item => typeof item === 'object' ? require('util').inspect(item) : item).join(' ');
            consoleOutput.push(output);
            originalConsoleLog(...args); // Tetap mencetak ke log bot
        };

        // Eksekusi kode
        let evaled = await eval(`(async () => { ${budy.slice(2)} })()`);
        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);

        // Kembalikan console.log ke fungsi aslinya
        console.log = originalConsoleLog;

        // Gabungkan hasil eval dan console.log (jika ada)
        let finalOutput = evaled;
        if (consoleOutput.length > 0) {
            finalOutput = `📜 *Hasil Console Log:*\n${consoleOutput.join('\n')}\n\n📟 *Hasil Eksekusi:*\n${evaled}`;
        }

        // Kirim hasil dengan thumbnail
        await naze.sendMessage(m.chat, {
            text: finalOutput,
            contextInfo: {
                externalAdReply: {
                    title: '✅ Hasil Eksekusi Kode',
                    body: 'BangsulBotz',
                    thumbnailUrl: global.getRandomThumbnailUrl(),
                    mediaType: 1,
                    previewType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m });
    } catch (err) {
        // Kirim error dengan thumbnail
        await naze.sendMessage(m.chat, {
            text: `${String(err)}`,
            contextInfo: {
                externalAdReply: {
                    title: '❌ Error Eksekusi Kode',
                    body: `${global.botname}`,
                    thumbnailUrl: global.getRandomThumbnailUrl(),
                    mediaType: 1,
                    previewType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m });

        // Analisis error dengan Gemini
        let currentKeyIndex = 0;
        const analyzeError = async () => {
            const GEMINI_API_KEY = global.key_gemini[currentKeyIndex];
            try {
                const response = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                    {
                        contents: [{
                            parts: [{
                                text: `Kamu adalah AI yang ahli dalam bahasa pemrograman dan mampu menganalisa log error serta kode yang dieksekusi. Jawab dengan bahasa Indonesia yang natural dan boleh kasih emoji untuk kesan lebih hidup. Berikan saran spesifik seperti baris yang bermasalah dan solusi (misalnya, tambah baris ini sebelum/sesudah baris tertentu). Jangan panjang-panjang ya! Analisa log error dan kode ini:\n\nKode yang Dieksekusi:\n${budy.slice(2).trim()}\n\nError: ${err.message}\n\nStack Trace: ${err.stack}`
                            }]
                        }],
                        generationConfig: {
                            temperature: 0
                        },
                        systemInstruction: {
                            parts: [{
                                text: "Kamu adalah AI yang ahli dalam bahasa pemrograman, dan mampu menganalisa log error serta kode. Jawab dengan bahasa Indonesia yang natural dan boleh kasih emoji seperti reaksi kamu supaya kesan lebih hidup, berikan saran spesifik (misalnya, tambah baris ini sebelum/sesudah baris tertentu), jangan panjang-panjang ya untuk menjawabnya."
                            }]
                        }
                    }
                );
                return response.data.candidates[0].content.parts[0].text;
            } catch (err) {
                if (err.response?.status === 429 || err.message.includes('API key') || err.message.includes('quota') || err.message.includes('limit')) {
                    currentKeyIndex = (currentKeyIndex + 1) % global.key_gemini.length;
                    if (currentKeyIndex === 0) {
                        throw new Error('Semua kunci API gagal');
                    }
                    return analyzeError();
                }
                throw err;
            }
        };

        try {
            const geminiAnalysis = await analyzeError();
            await naze.sendMessage(m.chat, {
                text: geminiAnalysis,
                contextInfo: {
                    externalAdReply: {
                        title: `🤖 Analisis Error oleh ${global.botname}`,
                        body: `${global.botname}`,
                        thumbnailUrl: global.getRandomThumbnailUrl(),
                        mediaType: 1,
                        previewType: 1,
                        renderLargerThumbnail: false
                    }
                }
            }, { quoted: m });
        } catch (analysisErr) {
            // Tidak ada tindakan tambahan jika analisis gagal
        }
    }
}
	
if (budy.startsWith('1$')) {
    if (!isCreator) return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
    if (!text) return global.sendMessageWithThumbnail(naze, m.chat, 'error', m);

    //await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m); // Pesan wait dengan thumbnail
    exec(budy.slice(2), (err, stdout) => {
        if (err) {
            // Kirim error dengan thumbnail
            naze.sendMessage(m.chat, {
                text: `${err}`,
                contextInfo: {
                    externalAdReply: {
                        title: '❌ Error Eksekusi Shell',
                        body: 'BangsulBotz',
                        thumbnailUrl: global.getRandomThumbnailUrl(), // Perbaikan ke getRandomThumbnailUrl
                        mediaType: 1,
                        previewType: 1,
                        renderLargerThumbnail: false, // Aktifkan untuk memastikan thumbnail muncul
                    }
                }
            }, { quoted: m });
            return;
        }
        if (stdout) {
            // Kirim hasil dengan thumbnail
            naze.sendMessage(m.chat, {
                text: `${stdout}`,
                contextInfo: {
                    externalAdReply: {
                        title: '✅ Hasil Eksekusi Shell',
                        body: 'BangsulBotz',
                        thumbnailUrl: global.getRandomThumbnailUrl(), // Perbaikan ke getRandomThumbnailUrl
                        mediaType: 1,
                        previewType: 1,
                        renderLargerThumbnail: false, // Aktifkan untuk memastikan thumbnail muncul
                    }
                }
            }, { quoted: m });
        }
    });
}
	naze.CAI = naze.CAI ? naze.CAI : {};
if (m.isBaileys && m.fromMe) return;
if (!m.text) return;
if (!naze.CAI[m.sender]) return; // Gunakan `m.sender` untuk mendefinisikan pengirim.

if (
    m.text.startsWith(".") ||
    m.text.startsWith("#") ||
    m.text.startsWith("!") ||
    m.text.startsWith("/") ||
    m.text.startsWith("\\/")
) return;
}

}catch (err) {
            console.error(`Kesalahan pada fitur: ${m.command}\n\n`, err);
            await global.GroupCacheUpdate
            // Try to get Gemini analysis, fall back to default error message if it fails
            try {
                const geminiAnalysis = await global.analyzeErrorWithGemini(err.message, err.stack);
                console.log(`Respon Gemini untuk fitur ${m.command}:\n${geminiAnalysis}`);
                await naze.sendFromOwner(
                    global.owner,
                    `Halo \`${global.ownername}\`, analisis error di fitur \`${m.command}\` dari Gemini:\n\n${geminiAnalysis}`,
                    m,
                    { contextInfo: { isForwarded: true } }
                );
            } catch (geminiErr) {
                console.error('Kesalahan saat menganalisis dengan Gemini:', geminiErr);
                await naze.sendFromOwner(
                    global.owner,
                    `Halo \`${global.ownername}\`, error di fitur:\n \`${m.command}\`\n\nPesan Error:\n${err.message}\n\nStack Trace:\n${err.stack}`,
                    m,
                    { contextInfo: { isForwarded: true } }
                );
            }
        }
let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(chalk.redBright(`Update ${__filename}`))
	delete require.cache[file]
	require(file)
})};

