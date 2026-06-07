require('../settings.js');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const axios = require('axios');
const chalk = require('chalk');
const moment = require('moment-timezone');
const { writeExif } = require('../lib/exif.js');
const {FileType,fromBuffer} = require('file-type');
const PhoneNumber = require('awesome-phonenumber');
const { generateCustomKeyId } = require('./idcustom.js'); 
const topCommand = require('../plugins/botmenu/topcommand');
const { loadPlugins, plugins } = require('../plugins/index.js');
const premium = JSON.parse(fs.readFileSync('./database/premium.json'));
const blockUserPath = path.join(__dirname, '../database/block_user.json');
const { getBuffer, getSizeMedia,pickRandom } = require('../lib/function.js');
const { jidNormalizedUser, proto, getBinaryNodeChild,prepareWAMessageMedia, generateWAMessageContent, areJidsSameUser, extractMessageContent, downloadContentFromMessage, generateWAMessageFromContent, jidDecode, generateWAMessage, getContentType, getDevice } = require('baileys');

async function GroupUpdate(naze, update, store, groupCache) {
  const groupUpdate = Array.isArray(update) ? update[0] : update;
  const chatId = groupUpdate.key?.remoteJid || groupUpdate.id;

  if (!chatId || !chatId.endsWith('@g.us')) {
    return;
  }

  if (!store.groupMetadata[chatId]) {
    try {
      await global.updateGroupMetadata(naze, chatId, store, groupCache);
    } catch (metadataError) {
      console.error('Error fetching group metadata:', metadataError);
      return;
    }
  }

  if (!global.db?.groups?.[chatId] || !store?.groupMetadata?.[chatId] || !naze.public) {
    return;
  }

  const metadata = store.groupMetadata[chatId];
  let participant = groupUpdate.author || groupUpdate.actor || groupUpdate.participant || groupUpdate.key?.participant || 'unknown';

  if (participant.endsWith('@lid')) {
    const getJidFromLid = (lid, metadata) => {
      if (!metadata?.participants || !lid) return lid;
      const participant = metadata.participants.find(p => 
        p.lid === lid || p.id === lid || (p.lid?.jid === lid)
      );
      return participant ? participant.jid || participant.id || lid : lid;
    };
    participant = getJidFromLid(participant, metadata);
  }

  const admin = `@${participant.split('@')[0] || 'unknown'}`;
  let messageType = null;
  let mentions = [participant].filter(Boolean);
  const normalizedTarget = groupUpdate.message?.protocolMessage?.parameters?.[0] || groupUpdate.parameters?.[0] || '';

  if (groupUpdate.subject) {
    messageType = 'subject';
  } else if (groupUpdate.desc) {
    messageType = 'desc';
  } else if (groupUpdate.announce !== undefined) {
    messageType = 'announce';
  } else if (groupUpdate.restrict !== undefined) {
    messageType = 'restrict';
  } else if (groupUpdate.revoke) {
    messageType = 'revoke';
  } else if (groupUpdate.message?.protocolMessage?.type === 3) {
    const expiration = groupUpdate.message.protocolMessage.ephemeralExpiration;
    messageType = expiration > 0 ? 'ephemeralDuration' : 'ephemeralDisabled';
  } else if (groupUpdate.ephemeralDuration && groupUpdate.ephemeralDuration !== 0) {
    messageType = 'ephemeralDuration';
  } else if (groupUpdate.ephemeralDuration === 0) {
    messageType = 'ephemeralDisabled';
  } else if (groupUpdate.icon) {
    messageType = 'icon';
  } else if (groupUpdate.memberAddMode !== undefined) {
    messageType = 'memberAddMode';
  } else if (groupUpdate.joinApprovalMode !== undefined) {
    messageType = 'joinApprovalMode';
  } else if (groupUpdate.inviteCode) {
    messageType = 'inviteCode';
  } else if (groupUpdate.action === 'add' && groupUpdate.participants?.length) {
    messageType = 'add';
    mentions = [participant, ...groupUpdate.participants].filter(Boolean);
  } else if (groupUpdate.action === 'remove' && groupUpdate.participants?.length) {
    messageType = 'remove';
    mentions = [participant, ...groupUpdate.participants].filter(Boolean);
  }

  if (!messageType || !global.db.groups[chatId].setinfo) {
    return;
  }

  let notificationText;
  const ephemeralExpiration = groupUpdate.message?.protocolMessage?.ephemeralExpiration || groupUpdate.ephemeralDuration || normalizedTarget;
  const durationText = ephemeralExpiration === 86400 ? '`24 jam`' : 
                      ephemeralExpiration === 604800 ? '`7 hari`' : 
                      ephemeralExpiration === 7776000 ? '`90 hari`' : `\`${ephemeralExpiration} detik\``;

  switch (messageType) {
    case 'subject':
      notificationText = `${admin} mengubah Subject Grup menjadi:\n${groupUpdate.subject || normalizedTarget}`;
      break;
    case 'desc':
      notificationText = `${admin} mengubah deskripsi grup:\n\`${groupUpdate.desc || normalizedTarget}\``;
      break;
    case 'announce':
      notificationText = `${admin} telah \`${groupUpdate.announce ? 'menutup' : 'membuka'}\` grup!\nSekarang ${groupUpdate.announce ? 'hanya admin yang' : 'semua peserta'} dapat mengirim pesan.`;
      break;
    case 'restrict':
      notificationText = `${admin} telah mengatur agar \`${groupUpdate.restrict ? 'hanya admin' : 'semua peserta'}\` yang dapat mengedit info grup.`;
      break;
    case 'revoke':
      notificationText = `${admin} mereset link grup!`;
      break;
    case 'ephemeralDuration':
      notificationText = `${admin} mengubah durasi pesan sementara menjadi ${durationText}`;
      break;
    case 'ephemeralDisabled':
      notificationText = `${admin} menonaktifkan pesan sementara`;
      break;
    case 'icon':
      notificationText = `${admin} telah mengubah icon grup.`;
      break;
    case 'memberAddMode':
      notificationText = `${admin} telah \`${groupUpdate.memberAddMode ? 'mengaktifkan' : 'menonaktifkan'}\` izin tambah anggota oleh semua peserta.`;
      break;
    case 'joinApprovalMode':
      notificationText = `${admin} telah \`${groupUpdate.joinApprovalMode ? 'mengaktifkan' : 'menonaktifkan'}\` persetujuan keanggotaan grup.`;
      break;
    case 'inviteCode':
      notificationText = `${admin} mereset link grup!`;
      break;
    case 'add':
      notificationText = `${admin} telah **menambahkan** anggota baru:\n${groupUpdate.participants?.map(p => `@${p.split('@')[0]}`).join(', ') || 'unknown'}`;
      break;
    case 'remove':
      notificationText = `${admin} telah **mengeluarkan** anggota:\n${groupUpdate.participants?.map(p => `@${p.split('@')[0]}`).join(', ') || 'unknown'}`;
      break;
    default:
      return;
  }

  try {
    await naze.sendMessage(chatId, {
      text: notificationText,
      mentions,
    }, {
      ephemeralExpiration: metadata.ephemeralDuration || 0,
    });
  } catch (sendError) {
    console.error('Error sending group update message:', sendError);
  }

  try {
    await global.updateGroupMetadata(naze, chatId, store, groupCache);
  } catch (metadataUpdateError) {
    console.error('Error updating group metadata:', metadataUpdateError);
  }
}
async function GroupCacheUpdate(naze, m, store) {
	if (!m.messageStubType || !m.isGroup) return
	if (global.db?.groups[m.chat]?.setinfo && naze.public) {
		const admin = `@${m.sender.split`@`[0]}`
		const messages = {
			1: 'mereset link grup!',
			21: `mengubah Subject Grup menjadi :\n*${m.messageStubParameters[0]}*`,
			22: 'telah mengubah icon grup.',
			23: 'mereset link grup!',
			24: `mengubah deskripsi grup.\n\n${m.messageStubParameters[0]}`,
			25: `telah mengatur agar *${m.messageStubParameters[0] == 'on' ? 'hanya admin' : 'semua peserta'}* yang dapat mengedit info grup.`,
			26: `telah *${m.messageStubParameters[0] == 'on' ? 'menutup' : 'membuka'}* grup!\nSekarang ${m.messageStubParameters[0] == 'on' ? 'hanya admin yang' : 'semua peserta'} dapat mengirim pesan.`,
			29: `telah menjadikan @${m.messageStubParameters[0].split`@`[0]} sebagai admin.`,
			30: `telah memberhentikan @${m.messageStubParameters[0].split`@`[0]} dari admin.`,
			72: `mengubah durasi pesan sementara menjadi *@${m.messageStubParameters[0]}*`,
			123: 'menonaktifkan pesan sementara.',
			132: 'mereset link grup!',
		}
		if (messages[m.messageStubType]) {
			await naze.sendMessage(m.chat, { text: `${admin} ${messages[m.messageStubType]}`, mentions: [m.sender, ...(m.messageStubParameters[0]?.includes('@') ? [`${m.messageStubParameters[0]}`] : [])]}, { ephemeralExpiration: m.expiration || store?.messages[m.chat]?.array?.slice(-1)[0]?.metadata?.ephemeralDuration || 0 })
		} else {
			console.log({
				messageStubType: m.messageStubType,
				messageStubParameters: m.messageStubParameters,
				type: WAMessageStubType[m.messageStubType],
			})
		}
	}
}
const editImage = require('./proses-out');
const joinImage = require('./proses-join'); // Impor fungsi dari proses-join.js

async function updateGroupMetadata(naze, chatId, store, groupCache) {
  try {
    if (store.groupMetadata && store.groupMetadata[chatId]) {
      delete store.groupMetadata[chatId];
    }
    if (groupCache && typeof groupCache.has === 'function' && groupCache.has(chatId)) {
      groupCache.del(chatId);
    }
    const metadata = await naze.groupMetadata(chatId, { forceFetch: true });
    if (metadata) {
      metadata.participants = metadata.participants
        ?.filter(p => p.hasOwnProperty('id') && p.hasOwnProperty('jid') && p.hasOwnProperty('admin'))
        ?.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
        || [];
      metadata.addressingMode = metadata.addressingMode || 'jid';
      store.groupMetadata[chatId] = metadata;
      if (groupCache && typeof groupCache.set === 'function') {
        groupCache.set(chatId, metadata);
      }
      return metadata;
    }
    return { participants: [], addressingMode: 'jid' };
  } catch (err) {
    const fallback = { participants: [], addressingMode: 'jid' };
    store.groupMetadata[chatId] = fallback;
    if (groupCache && typeof groupCache.set === 'function') {
      groupCache.set(chatId, fallback);
    }
    return fallback;
  }
}

global.updateGroupMetadata = updateGroupMetadata;

async function GroupParticipantsUpdate(naze, { id, participants, author, action }, store, groupCache) {
  try {
    await global.updateGroupMetadata(naze, id, store, groupCache);
    const metadata = store.groupMetadata[id] || {};
    const getLidFromJid = (jid, metadata) => {
      if (!metadata?.participants || !jid) return jid;
      const participant = metadata.participants.find(p => p.jid === jid);
      return participant ? participant.lid || jid : jid;
    };
    const resolveLidToJid = (lid, metadata) => {
      if (!metadata?.participants || !lid) return lid;
      if (lid.endsWith('@s.whatsapp.net')) return lid;
      const participant = metadata.participants.find(p => p.lid === lid || p.id === lid);
      return participant?.jid || lid;
    };
    if (global.db.groups && global.db.groups[id] && global.db.groups[id].antiNomorLuar?.active && metadata) {
      metadata.addressingMode = metadata.addressingMode || 'jid';
      const botNumber = await naze.decodeJid(naze.user.id);
      const botLid = metadata.addressingMode === 'lid' ? getLidFromJid(botNumber, metadata) : botNumber;
      const isBotAdmin = metadata.participants.find(p => (metadata.addressingMode === 'lid' ? p.lid : p.jid) === botLid)?.admin;
      if (!isBotAdmin) {
        return;
      }
      const exceptions = global.db.groups[id].antiNomorLuar.exceptions;
      for (let n of participants) {
        const resolvedJid = resolveLidToJid(n, metadata);
        const participantLid = metadata.addressingMode === 'lid' ? getLidFromJid(resolvedJid, metadata) : resolvedJid;
        if (action === 'add') {
          if (resolvedJid.endsWith('@lid')) {
            continue;
          }
          const isAdmin = metadata.participants.find(p => (metadata.addressingMode === 'lid' ? p.lid : p.jid) === participantLid)?.admin;
          if (isAdmin) {
            continue;
          }
          const isForeign = !exceptions.some(code => resolvedJid.startsWith(code));
          if (isForeign) {
            let profile;
            try {
              profile = await naze.profilePictureUrl(resolvedJid, 'image');
            } catch {
              profile = 'https://telegra.ph/file/95670d63378f7f4210f03.png';
            }
            await naze.sendMessage(id, {
              text: `🚨 *Deteksi Nomor Asing*\n\n👤 User: @${resolvedJid.split('@')[0]}\n📞 Nomor: ${resolvedJid.split('@')[0]}\n❗ Status: Nomor ini berasal dari luar kode:\n=> \`+${exceptions.join(', +')}\`\n\n😡 Grup ini bukan tempat turis. Pengusiran sedang diproses...`,
              contextInfo: {
                mentionedJid: [resolvedJid],
                externalAdReply: {
                  title: 'Nomor Luar Terdeteksi',
                  mediaType: 1,
                  previewType: 0,
                  thumbnailUrl: profile,
                  renderLargerThumbnail: true,
                  sourceUrl: global.my.gh
                }
              }
            });
            await naze.groupParticipantsUpdate(id, [resolvedJid], 'remove').catch(err => {});
            await new Promise(resolve => setTimeout(resolve, 2000));
            await naze.sendMessage(id, {
              text: `*Member dengan nomor luar @${resolvedJid.split('@')[0]} telah dikeluarkan dari grup!*`,
              mentions: [resolvedJid]
            });
          }
        }
      }
    }
    if (global.db.groups && global.db.groups[id] && global.db.groups[id].welcome && metadata) {
      metadata.addressingMode = metadata.addressingMode || 'jid';
      for (let n of participants) {
        const resolvedJid = resolveLidToJid(n, metadata);
        const jidUser = jidNormalizedUser(resolvedJid);
        const participantLid = metadata.addressingMode === 'lid' ? getLidFromJid(resolvedJid, metadata) : jidUser;
        let profile;
        try {
          profile = await naze.profilePictureUrl(resolvedJid, 'image');
        } catch {
          profile = 'https://telegra.ph/file/95670d63378f7f4210f03.png';
        }
        const defaultWelcome = `${global.simbol.barisjudul} *WELCOME* 
${global.simbol.tutupjudul}
${global.simbol.barisfitur} *user*      : @${resolvedJid.split('@')[0]}
${global.simbol.barisfitur} *grup*     : ${metadata.subject}
${global.simbol.barisfitur} *status* : *BERGABUNG*
${global.simbol.barisfitur} *pesan*   : *semoga betah ya...* 
${global.simbol.penutup}`;
        const defaultOut = `${global.simbol.barisjudul} *OUT* 
${global.simbol.tutupjudul}
${global.simbol.barisfitur} *user*      : @${resolvedJid.split('@')[0]}
${global.simbol.barisfitur} *grup*     : ${metadata.subject}
${global.simbol.barisfitur} *status* : *KELUAR*
${global.simbol.barisfitur} *pesan*   : *selamat tinggal* 
${global.simbol.penutup}`;
        const processMessage = (text, user, group) => {
          return text.replace(/@user/g, `@${user.split('@')[0]}`).replace(/@grup/g, group);
        };
        if (action === 'add') {
          const welcomeMessage = global.db.groups[id].setwelcome
            ? processMessage(global.db.groups[id].setwelcome, resolvedJid, metadata.subject)
            : defaultWelcome;
          const imageResult = await joinImage(resolvedJid.split('@')[0], metadata.subject, profile);
          let thumbnailUrl = profile;
          if (imageResult.status === 'success') {
            thumbnailUrl = imageResult.imageUrl;
          }
          await naze.sendMessage(id, {
            text: welcomeMessage,
            contextInfo: {
              mentionedJid: [resolvedJid],
              externalAdReply: {
                title: 'selamat datang',
                mediaType: 1,
                previewType: 0,
                thumbnailUrl: thumbnailUrl,
                renderLargerThumbnail: true,
                sourceUrl: global.my.gh
              }
            }
          });
          if (!metadata.participants.some(p => (metadata.addressingMode === 'lid' ? p.lid : p.jid) === participantLid)) {
            metadata.participants.push({ id: jidUser, jid: jidUser, lid: participantLid, admin: null });
          }
        } else if (action === 'remove') {
          const outMessage = global.db.groups[id].setout
            ? processMessage(global.db.groups[id].setout, resolvedJid, metadata.subject)
            : defaultOut;
          const imageResult = await editImage(resolvedJid.split('@')[0], metadata.subject, profile);
          let thumbnailUrl = profile;
          if (imageResult.status === 'success') {
            thumbnailUrl = imageResult.imageUrl;
          }
          await naze.sendMessage(id, {
            text: outMessage,
            contextInfo: {
              mentionedJid: [resolvedJid],
              externalAdReply: {
                title: 'selamat tinggal',
                mediaType: 1,
                previewType: 0,
                thumbnailUrl: thumbnailUrl,
                renderLargerThumbnail: true,
                sourceUrl: global.my.gh
              }
            }
          });
          metadata.participants = metadata.participants.filter(p => (metadata.addressingMode === 'lid' ? p.lid : p.jid) !== participantLid);
        } else if (action === 'promote') {
          const resolvedAuthor = resolveLidToJid(author, metadata);
          const authorLid = metadata.addressingMode === 'lid' ? getLidFromJid(resolvedAuthor, metadata) : resolvedAuthor;
          await naze.sendMessage(id, {
            text: `╔═〇 *NAIK JABATAN* 
${global.simbol.tutupjudul}
${global.simbol.barisfitur} *User*      : @${resolvedJid.split('@')[0]}
${global.simbol.barisfitur} *Grup*     : ${metadata.subject}
${global.simbol.barisfitur} *Status* : *ADMIN* 
${global.simbol.barisfitur} *Di angkat oleh* @${resolvedAuthor.split('@')[0]}
${global.simbol.penutup}`,
            contextInfo: {
              mentionedJid: [resolvedJid, resolvedAuthor],
              externalAdReply: {
                title: 'JADI ADMIN',
                mediaType: 1,
                previewType: 0,
                thumbnailUrl: profile,
                renderLargerThumbnail: true,
                sourceUrl: global.my.gh
              }
            }
          });
          let userData = metadata.participants.find(p => (metadata.addressingMode === 'lid' ? p.lid : p.jid) === participantLid);
          if (userData) {
            userData.admin = 'admin';
          }
        } else if (action === 'demote') {
          const resolvedAuthor = resolveLidToJid(author, metadata);
          const authorLid = metadata.addressingMode === 'lid' ? getLidFromJid(resolvedAuthor, metadata) : resolvedAuthor;
          await naze.sendMessage(id, {
            text: `╔═〇 *TURUN JABATAN* 
${global.simbol.tutupjudul}
${global.simbol.barisfitur} *user*      : @${resolvedJid.split('@')[0]}
${global.simbol.barisfitur} *grup*     : ${metadata.subject}
${global.simbol.barisfitur} *status* : *MEMBER*
${global.simbol.barisfitur} *Diturunkan oleh* @${resolvedAuthor.split('@')[0]} 
${global.simbol.penutup}`,
            contextInfo: {
              mentionedJid: [resolvedJid, resolvedAuthor],
              externalAdReply: {
                title: 'TIDAK ADMIN!',
                mediaType: 1,
                previewType: 0,
                thumbnailUrl: profile,
                renderLargerThumbnail: true,
                sourceUrl: global.my.gh
              }
            }
          });
          let userData = metadata.participants.find(p => (metadata.addressingMode === 'lid' ? p.lid : p.jid) === participantLid);
          if (userData) {
            userData.admin = null;
          }
        }
      }
    }
    await global.updateGroupMetadata(naze, id, store, groupCache);
  } catch (e) {}
}

async function LoadDataBase(naze, m) {
    try {
        const botNumber = await naze.decodeJid(naze.user.id);
        const isNumber = x => typeof x === 'number' && !isNaN(x);
        const isBoolean = x => typeof x === 'boolean' && Boolean(x);
        let setBot = global.db.set[botNumber];

        // Inisialisasi pengaturan bot
        if (typeof setBot !== 'object') global.db.set[botNumber] = {};
        if (setBot) {
            if (!('lang' in setBot)) setBot.lang = 'id';
            if (!('status' in setBot)) setBot.status = 0;
            if (!('anticall' in setBot)) setBot.anticall = true;
            if (!('antipc' in setBot)) setBot.antipc = true;
            if (!('autobio' in setBot)) setBot.autobio = false;
            if (!('autoread' in setBot)) setBot.autoread = true;
            if (!('autotyping' in setBot)) setBot.autotyping = false;
            if (!('readsw' in setBot)) setBot.readsw = false;
            if (!('autoai' in setBot)) setBot.autoai = false;
            if (!('public' in setBot)) setBot.public = true;
            if (!('autoDownload' in setBot)) setBot.autoDownload = true;
            if (!('public' in setBot)) setBot.public = true;
        } else {
            global.db.set[botNumber] = {
                lang: 'id',
                status: 0,
                anticall: true,
                antipc: true,
                autobio: false,
                autoread: true,
                autotyping: false,
                readsw: false,
                autoai: false,
                autoDownload:false,
                public: true
            };
        }

        // Inisialisasi data pengguna (hanya pushname)
        let user = global.db.users[m.sender];
        if (typeof user !== 'object') global.db.users[m.sender] = {};
        if (user) {
            if (!('pushname' in user)) user.pushname = m.pushName || "~ (No Name)";
        } else {
            global.db.users[m.sender] = {
                pushname: m.pushName || "~ (No Name)",
                lastUpdated: Date.now()
            };
        }

        // Fungsi untuk memperbarui pushname
        const updateUserPushname = (jid, pushname) => {
            if (!jid || !pushname) return;
            const currentData = global.db.users[jid] || {};
            const currentPushname = currentData.pushname;

            if (!currentPushname || currentPushname !== pushname) {
                global.db.users[jid] = {
                    pushname: pushname,
                    lastUpdated: Date.now()
                };
                console.log(`✅ Pushname untuk ${jid} diperbarui menjadi: ${pushname}`);
            }
        };

        // Fungsi untuk mengambil pushname
        const getUserPushname = (jid) => {
            return global.db.users[jid]?.pushname || "~ (No Name)";
        };

        // Perbarui pushname pengirim jika ada
        if (m.sender && m.pushName) {
            updateUserPushname(m.sender, m.pushName);
        }

        // Inisialisasi data grup (jika pesan dari grup)
        if (m.isGroup) {
  let group = global.db.groups[m.chat];
  if (typeof group !== 'object') global.db.groups[m.chat] = {};
  if (group) {
    if (!('antidelete' in group)) group.antidelete = false;
    if (!('antiedit' in group)) group.antiedit = false;
    if (!('welcome' in group)) group.welcome = false;
    if (!('waktusholat' in group)) group.waktusholat = false;
    if (!('waktupuasa' in group)) group.waktupuasa = false;
    if (!('onlyadmin' in group)) group.onlyadmin = false;
    if (!('antinomor-luar' in group)) group.antinomor_luar = false;
    if (!('antibot' in group)) group.antibot = { enabled: false, delete: false, kick: false };
    if (!('antilinkall' in group)) group.antilinkall = { enabled: false, delete: false, kick: false };
    if (!('antilinkgc' in group)) group.antilinkgc = { enabled: false, delete: false, kick: false };
    if (!('antimedia' in group)) group.antimedia = { enabled: false, delete: false, kick: false };
    if (!('antispamlink' in group)) group.antispamlink = { enabled: false, delete: false, kick: false };
    if (!('antisticker' in group)) group.antisticker = { enabled: false, delete: false, kick: false };
    if (!('antitext' in group)) group.antitext = { enabled: false, delete: false, kick: false };
    if (!('antitoxic' in group)) group.antitoxic = { enabled: false, delete: false, kick: false };
    if (!('antiupsw' in group)) group.antiupsw = { enabled: false, delete: false, kick: false };
    if (!('antivirtex' in group)) group.antivirtex = { enabled: false, delete: false, kick: false };
    if (!('antiwame' in group)) group.antiwame = { enabled: false, delete: false, kick: false };
  } else {
    global.db.groups[m.chat] = {
      welcome: false,
      antidelete: false,
      antiedit: false,
      waktusholat: false,
      waktupuasa: false,
      onlyadmin: false,
      antinomor_luar: false,
      antibot: { enabled: false, delete: false, kick: false },
      antilinkall: { enabled: false, delete: false, kick: false },
      antilinkgc: { enabled: false, delete: false, kick: false },
      antimedia: { enabled: false, delete: false, kick: false },
      antispamlink: { enabled: false, delete: false, kick: false },
      antisticker: { enabled: false, delete: false, kick: false },
      antitext: { enabled: false, delete: false, kick: false },
      antitoxic: { enabled: false, delete: false, kick: false },
      antiupsw: { enabled: false, delete: false, kick: false },
      antivirtex: { enabled: false, delete: false, kick: false },
      antiwame: { enabled: false, delete: false, kick: false }
    };
  }
}

        // Kembalikan fungsi yang diperlukan
        return { updateUserPushname, getUserPushname };

    } catch (e) {
        throw e;
    }
}

function loadBlockedUsers() {
	if (!fs.existsSync(blockUserPath)) {
		fs.writeFileSync(blockUserPath, JSON.stringify([]));
		return new Set();
	}
	return new Set(JSON.parse(fs.readFileSync(blockUserPath, 'utf8')));
}

function saveBlockedUsers(blockedUsers) {
	try {
		console.log(`💾 Menyimpan data ke database...`);
		fs.writeFileSync(blockUserPath, JSON.stringify([...blockedUsers], null, 2));
		console.log(`✅ Data berhasil disimpan ke ${blockUserPath}`);
		let checkFile = fs.readFileSync(blockUserPath, 'utf8');
		console.log(`🔍 Isi file setelah disimpan:`, checkFile);
	} catch (error) {
		console.error(`❌ Gagal menyimpan data:`, error);
	}
}

let blockedUsers = loadBlockedUsers();

// Buat peta perintah ke nama file fitur saat startup
const commandsDir = path.join(__dirname, '../plugins'); // Direktori fitur
const commandFiles = fs.readdirSync(commandsDir, { recursive: true }) // Cari file di semua subdirektori
    .filter(file => file.endsWith('.js'));
const commandMap = new Map(); // Peta: perintah/alias -> nama file fitur (tanpa .js)

for (const file of commandFiles) {
    try {
        const command = require(path.join(commandsDir, file));
        const fileNameWithoutExt = path.basename(file, '.js'); // Misalnya, 'deepseek'

        // Tambahkan nama fitur ke peta
        if (command.name) {
            commandMap.set(command.name.toLowerCase(), fileNameWithoutExt);
        }

        // Tambahkan semua alias ke peta
        if (command.alias && Array.isArray(command.alias)) {
            for (const alias of command.alias) {
                commandMap.set(alias.toLowerCase().replace(/^\./, ''), fileNameWithoutExt); // Hapus titik dari alias
            }
        }
    } catch (err) {
        console.error(`Error loading command file ${file}:`, err.message);
    }
}
loadPlugins();
// Path ke settings.js
const settingsPath = path.join(__dirname, '../settings.js');

// Fungsi untuk membaca isi settings.js dan mengambil global.prefixes
function readPrefixesFromSettings() {
    try {
        const settingsContent = fs.readFileSync(settingsPath, 'utf8');
        const prefixesMatch = settingsContent.match(/global\.prefixes\s*=\s*(\[.*?\])/);
        if (prefixesMatch && prefixesMatch[1]) {
            return JSON.parse(prefixesMatch[1].replace(/'/g, '"'));
        }
        return ['.', '!', '#']; // Default jika tidak ditemukan
    } catch (error) {
        console.error('❌ Gagal membaca prefixes dari settings.js:', error);
        return ['.', '!', '#']; // Default jika gagal
    }
}

// Muat prefix saat startup
global.prefixes = readPrefixesFromSettings();
const handleCommand = async (naze, m, isGroup, isAdmin, isBotAdmin, isOwner, onlyAdmin, store, getUserPushname) => {
    try {
        const text = m.text?.trim() || "";
        if (!text) return;

        const command = text.split(' ')[0].toLowerCase();
        const args = text.split(' ').slice(1).join(' ');

        if (!plugins || typeof plugins.get !== "function") {
            console.error("❌ Error: plugins tidak terdefinisi atau bukan Map.");
            return;
        }

        // Pertahankan logika onlyAdmin
        if (isGroup && onlyAdmin && !isAdmin && !isOwner) return;

        if (plugins.has(command)) {
            const plugin = plugins.get(command);
            await plugin.run({ naze, m, text: args, store, getUserPushname });
        }
    } catch (err) {
        console.error("❌ Error di handleCommand:", err);
    }
};

const handleAutoFeature = async (m, isGroup, isAdmin, isBotAdmin, isOwner, autoFeatures) => {
    for (const feature of autoFeatures) {
        feature(m, isGroup, isAdmin, isBotAdmin, isOwner);
    }
};

const messageHandler = async (naze, m, isGroup, isAdmin, isBotAdmin, isOwner, onlyAdmin, autoFeatures, store, getUserPushname) => {
    try {
        let senderNumber = m.sender.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        blockedUsers = loadBlockedUsers();
        if (blockedUsers.has(senderNumber)) return;

        const sender = m.sender?.trim();
        if (!sender) return;

        // Gunakan m.command dan m.args yang sudah diekstrak oleh Serialize
        const command = m.command?.toLowerCase() || "";
        const argsText = m.args.join(' ') || "";

        // Tambahkan pengecekan untuk memastikan plugins sudah diinisialisasi
        if (!plugins || typeof plugins.get !== "function") {
            console.error("❌ Error: plugins belum diinisialisasi. Menunggu inisialisasi...");
            await new Promise(resolve => setTimeout(resolve, 1000)); // Tunggu 1 detik
            return messageHandler(naze, m, isGroup, isAdmin, isBotAdmin, isOwner, onlyAdmin, autoFeatures, store, getUserPushname); // Coba lagi
        }

        // Pastikan store ada
        if (!store) {
            store = naze.store || {};
        }

        // Pastikan store.presences ada
        if (!store.presences) {
            store.presences = {};
        }

        if (command) {
            // Cari plugin berdasarkan command atau alias
            const plugin = plugins.get(command) || Array.from(plugins.values()).find(p => p.alias?.includes(command));
            if (!plugin) {
                return; // Jika plugin tidak ditemukan, abaikan
            }

            // Pengecualian untuk plugin 'list' dari ../plugins/storemenu/list.js
            const isListPlugin = command === 'list' || plugin.alias?.includes('list') || plugin.path === '../plugins/storemenu/list.js';

            // Terapkan logika onlyAdmin, kecuali untuk plugin 'list'
            if (isGroup && onlyAdmin && !isAdmin && !isOwner && !isListPlugin) {
                return;
            }

            try {
                await plugin.run({ naze, m, text: argsText, store, getUserPushname });
            } catch (err) {
                console.error(`❌ Error executing plugin ${command}:`, err);
                await naze.sendMessage(m.chat, {
                    text: `⚠️ Terjadi kesalahan saat menjalankan perintah "${command}": ${err.message}`,
                }, { quoted: m });
            }
        } else {
            await handleAutoFeature(m, isGroup, isAdmin, isBotAdmin, isOwner, autoFeatures);
        }
    } catch (err) {
        console.error("❌ Error di messageHandler:", err);
        await naze.sendMessage(m.chat, {
            text: `⚠️ Terjadi kesalahan: ${err.message}`,
        }, { quoted: m });
    }
};

const commandCooldown = new Map();

async function preventSpam(m, cooldownTime = 8000) {
    const userId = m.sender;
    const command = m.command;
    const now = Date.now();

    if (!commandCooldown.has(userId)) {
        commandCooldown.set(userId, {});
    }

    const userCommands = commandCooldown.get(userId);

    if (userCommands[command] && now - userCommands[command] < cooldownTime) {
        return false;
    }

    userCommands[command] = now;

    setTimeout(() => {
        delete userCommands[command];
    }, cooldownTime);

    return true;
}

if (!global.lastGroupAction) global.lastGroupAction = {};

function formatDuration(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    let result = [];
    if (days > 0) result.push(`${days} hari`);
    if (hours > 0) result.push(`${hours} jam`);
    if (minutes > 0) result.push(`${minutes} menit`);
    if (seconds > 0 && days === 0 && hours === 0 && minutes === 0) result.push(`${seconds} detik`);

    return result.length > 0 ? result.join(' ') : 'sebentar';
}

// Fungsi untuk mendeteksi dan menangani pesan dari user yang dimute
async function detectMutedUser(naze, m) {
    // Hanya proses di grup dan bukan dari bot
    if (!m.isGroup || m.myBot) {
        //console.log(`[DEBUG] Pesan diabaikan: isGroup=${m.isGroup}, myBot=${m.myBot}`);
        return;
    }

    // Pastikan db.muteUser terinisialisasi
    if (!db.muteUser || !db.muteUser[m.chat] || !db.muteUser[m.chat][m.sender]) {
        //console.log(`[DEBUG] Tidak ada data mute untuk ${m.sender} di ${m.chat}`);
        return;
    }

    const muteInfo = db.muteUser[m.chat][m.sender];
    const currentTime = new Date();
    const endTime = new Date(muteInfo.endTime);

    // Log untuk debug, termasuk struktur m.message
    //console.log(`[DEBUG] Deteksi pesan dari ${m.sender} di ${m.chat}, mute aktif: ${currentTime < endTime}, key:`, m.key, `message:`, m.message);

    // Cek apakah mute masih aktif
    if (currentTime < endTime) {
        try {
            // Pastikan bot adalah admin untuk menghapus pesan
            if (!m.isBotAdmin) {
                //console.log(`[DEBUG] Bot bukan admin di ${m.chat}, tidak bisa menghapus pesan`);
                await naze.sendMessage(m.chat, {
                    text: `⚠️ Bot bukan admin, tidak bisa menghapus pesan dari @${m.sender.split('@')[0]}. Anda dimute hingga ${endTime.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}.`,
                    contextInfo: { mentionedJid: [m.sender] }
                }, { quoted: m });
                return;
            }

            // Reply ke pesan user yang dimute
            const warningMessage = `🚫 Anda dimute!\n\n` +
                                  `👤 *Nama:* @${m.sender.split('@')[0]}\n` +
                                  `⏰ *Open Mute:* ${new Date(muteInfo.startTime).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n` +
                                  `⏳ *Durasi:* ${formatDuration(muteInfo.duration)}\n` +
                                  `🕒 *Close Mute:* ${endTime.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n` +
                                  `📜 *Alasan:* ${muteInfo.reason}\n\n` +
                                  `Pesan Anda akan dihapus!`;

            //console.log(`[DEBUG] Mengirim balasan untuk pesan dari ${m.sender}`);
       		//     await naze.sendMessage(m.chat, {
           	//     text: warningMessage,
           	//    contextInfo: { mentionedJid: [m.sender] }
           	//  }, { quoted: m });

            // Hapus pesan user
            //console.log(`[DEBUG] Menghapus pesan dari ${m.sender}, ID: ${m.key.id}`);
            await naze.sendMessage(m.chat, {
                delete: {
                    remoteJid: m.chat,
                    fromMe: false,
                    id: m.key.id,
                    participant: m.sender
                }
            });

        } catch (err) {
            //console.error(`[ERROR] Gagal menghapus pesan user yang dimute:`, err);
          //  await naze.sendMessage(m.chat, {
           //     text: `⚠️ Gagal menghapus pesan dari @${m.sender.split('@')[0]}. Anda dimute hingga ${endTime.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}.`,
          //      contextInfo: { mentionedJid: [m.sender] }
           // }, { quoted: m });
        }
    } else {
        // Hapus data mute jika sudah kadaluarsa dan beri notifikasi ke grup
        //console.log(`[DEBUG] Mute untuk ${m.sender} di ${m.chat} telah berakhir`);
        const groupMetadata = await naze.groupMetadata(m.chat);
        const groupName = groupMetadata.subject;
        await naze.sendMessage(m.chat, {
            text: `✅ *Mute Selesai!*\n\n` +
                  `👤 *User:* @${m.sender.split('@')[0]}\n` +
                  `📢 *Grup:* ${groupName}\n` +
                  `🕒 *Waktu Berakhir:* ${endTime.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n` +
                  `📜 *Alasan Mute:* ${muteInfo.reason}\n\n` +
                  `Pengguna ini sudah tidak dimute dan sekarang dapat mengirim pesan di grup.`,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });

        // Hapus data mute
        delete db.muteUser[m.chat][m.sender];
        if (Object.keys(db.muteUser[m.chat]).length === 0) {
            delete db.muteUser[m.chat];
        }
    }
}
// Fungsi getGroupMetadataWithCooldown didefinisikan di luar Serialize
const groupMetadataCooldown = new Map();

async function getGroupMetadataWithCooldown(naze, chatId, store, groupCache) {
  if (!store) {
    console.warn(`[WARNING] store tidak tersedia di getGroupMetadataWithCooldown untuk ${chatId}, menginisialisasi ulang...`);
    store = { groupMetadata: {} };
  }
  if (!store.groupMetadata) store.groupMetadata = {};

  const now = Date.now();
  const cooldownTime = 30000; // 1 menit cooldown
  if (groupMetadataCooldown.has(chatId) && now - groupMetadataCooldown.get(chatId) < cooldownTime) {
    console.log(`[COOLDOWN] Cooldown aktif untuk metadata grup ${chatId}, menggunakan cache...`);
    return store.groupMetadata[chatId] || (groupCache instanceof Map ? groupCache.get(chatId) : {}) || {};
  }

  try {
    // Gunakan naze.groupMetadata dari index.js yang sudah punya wrapper retry
    const metadata = await naze.groupMetadata(chatId);
    if (metadata) {
      metadata.participants = metadata.participants?.filter(p => p.hasOwnProperty('id') && p.hasOwnProperty('admin'))?.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) || [];
      metadata.addressingMode = metadata.addressingMode || 'jid';
      store.groupMetadata[chatId] = metadata;
      if (groupCache instanceof Map) {
  groupCache.set(chatId, fallback);
} else {
  //console.warn(`[WARNING] groupCache bukan instance Map untuk ${chatId}, melewati penyimpanan ke groupCache`);
}
      //console.log(`[GROUP] Metadata grup ${chatId} berhasil diambil dan disimpan ke cache`);
    }
    groupMetadataCooldown.set(chatId, now);
    return metadata || {};
  } catch (err) {
    console.error(`[ERROR] Gagal mengambil metadata untuk grup ${chatId}:`, err);
    const fallback = {};
    store.groupMetadata[chatId] = fallback;
    if (groupCache instanceof Map) {
      groupCache.set(chatId, fallback);
    } else {
      //console.warn(`[WARNING] groupCache bukan instance Map untuk ${chatId}, melewati penyimpanan ke groupCache`);
    }
    groupMetadataCooldown.set(chatId, now);
    return fallback;
  }
}

async function MessagesUpsert(naze, message, store, groupCache) {
    try {
        // Inisialisasi variabel utama
    const msg = message.messages[0];
    const botNumber = await naze.decodeJid(naze.user.id);
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    let blockedUsers = loadBlockedUsers();

    // Normalisasi JID
    const normalizeJid = (jid) => {
      if (!jid) return jid;
      const [number] = jid.split(':');
      return number.includes('@') ? number : `${number}@s.whatsapp.net`;
    };

    // Inisialisasi store jika belum ada
    if (!store) {
      console.warn('[WARNING] store tidak tersedia di MessagesUpsert, menginisialisasi ulang...');
      store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
      store.groupMetadata = {};
      store.messages = {};
      store.presences = {};
    }

    // Inisialisasi store.groupMetadata jika kosong
    if (!store.groupMetadata) {
      store.groupMetadata = {};
    }

    // Hapus logika groupFetchAllParticipating karena sudah ditangani di index.js
    // Inisialisasi store.messages jika kosong
    if (!store.messages) {
      store.messages = {};
    }

    // Inisialisasi store.presences jika kosong
    if (!store.presences) {
      store.presences = {};
    }

    const type = msg.message ? (getContentType(msg.message) || Object.keys(msg.message)[0]) : '';
    if (!naze.public && !msg.key.fromMe && message.type === 'notify') return;
    if (!msg.message) return;

    // Serialisasi pesan
		
        const m = await Serialize(naze, msg, store, groupCache);

        // Muat data tambahan seperti store.presences
        await LoadDataBase(naze, m);
        await GroupCacheUpdate(naze, m, store);

        // Log untuk debugging
        //console.log('store di MessagesUpsert sebelum diteruskan:', store);
        //console.log('store.presences di MessagesUpsert:', store.presences);

        const senderNumber = m.sender.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        const isTagged = Array.isArray(m.mentionedJid) && m.mentionedJid.includes(botNumber);
        const isReplyToBot = m.quoted && m.quoted.sender === botNumber;
        const autoAiEnabled = global.db.set[botNumber]?.autoai || false;
        const senderNumbers = [m.sender].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net');
        const isSenderOwner = senderNumbers.includes(botNumber);
		const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

        // Definisikan m.myBot
        m.myBot = (() => {
            if (!m || !m.sender) return false;
            const normalizedSender = normalizeJid(m.sender);
            const normalizedBotNumber = normalizeJid(botNumber || global.number_bot + '@s.whatsapp.net');
            return m.fromMe || normalizedSender === normalizedBotNumber;
        })();

        // Penanganan perintah
        const senderNumber1 = m.sender.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        const isGroup = m.isGroup;
        const isAdmin = m.isAdmin;
        const isBotAdmin = m.isBotAdmin;
        const onlyAdmin = db.groups[chatId]?.onlyadmin || false;
        const autoFeatures = [];
        const command = m.command;

        // Cek apakah pesan dari bot sendiri atau pengguna yang diblokir
        if (m.myBot) return;
        if (blockedUsers.has(senderNumber)) return;

        // Jalankan fungsi utama naze.js
        require('../naze.js')(naze, m, message, msg, store, groupCache);

        // Parsing tombol
        if (msg.message.buttonsResponseMessage) {
            m.text = msg.message.buttonsResponseMessage.selectedButtonId;
            m.command = m.text.split(' ')[0];
            m.args = m.text.split(' ').slice(1);
        } else if (msg.message.interactiveResponseMessage) {
            const params = JSON.parse(msg.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson || '{}');
            m.text = params.id || '';
            m.command = m.text.split(' ')[0];
            m.args = m.text.split(' ').slice(1);
        } else if (msg.message.templateButtonReplyMessage) {
            m.text = msg.message.templateButtonReplyMessage.selectedId;
            m.command = m.text.split(' ')[0];
            m.args = m.text.split(' ').slice(1);
        }

        // Jalankan Auto AI jika aktif dan bot di-mention/direply
        if (autoAiEnabled && (isTagged || isReplyToBot)) {
            require('../plugins/aimenu/autoai.js').run({ naze, m });
        }

        // Tangani interactiveResponseMessage
        if (type === 'interactiveResponseMessage' && m.quoted && m.quoted.fromMe) {
            const apb = await generateWAMessage(m.chat, {
                text: JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson).id,
                mentions: m.mentionedJid
            }, {
                userJid: naze.user.id,
                quoted: m.quoted
            });
            apb.key = msg.key;
            apb.key.fromMe = areJidsSameUser(m.sender, naze.user.id);
            if (m.isGroup) apb.participant = m.sender;
            const pbr = {
                ...msg,
                messages: [proto.WebMessageInfo.fromObject(apb)],
                type: 'append'
            };
            naze.ev.emit('messages.upsert', pbr);
        }

       // Deteksi Anti-Up-SW untuk groupStatusMentionMessage
        if (type === 'groupStatusMentionMessage') {
            const groupMetadata = await naze.groupMetadata(chatId);
            const groupName = groupMetadata.subject;

            if (global.db.groups[chatId]?.antiupsw?.enabled) {
                if (!m.isBotAdmin) {
                    await naze.sendMessage(chatId, {
                        text: `⚠️ *PERINGATAN:* Saya tidak bisa menghukum @${sender.split('@')[0]} karena saya bukan admin! Harap jadikan saya admin untuk mengaktifkan fitur Anti-Up-SW sepenuhnya.`,
                        contextInfo: { mentionedJid: [sender] }
                    }, { quoted: m });
                    return;
                }

                if (m.isAdmin || m.isOwner) {
                    await naze.sendMessage(chatId, {
                        text: `👑 *Kepada Yang Mulia @${sender.split('@')[0]},* \n\n` +
                              `Hamba mendapati bahwa Paduka adalah seorang ${m.isOwner ? 'pemilik' : 'admin'} di grup ${groupName}. \n` +
                              `Oleh karena itu, Paduka bebas melaksanakan up story dengan mention grup tanpa khawatir akan hukuman. \n` +
                              `Semoga Paduka senantiasa bijaksana dalam memimpin! 🙏`,
                        contextInfo: { mentionedJid: [sender] }
                    }, { quoted: m });
                    return;
                }

                const antiupsw = global.db.groups[chatId].antiupsw;

                // Kirim pesan peringatan terlebih dahulu
                await naze.sendMessage(chatId, {
                    text: `*⚠️ PELANGGARAN TERDETEKSI*\n` +
                          `⏰ *Waktu Deteksi:* ${new Date().toLocaleString()}\n` +
                          `👤 *Pengguna:* @${sender.split('@')[0]}\n` +
                          `📌 *Pelanggaran:* Mengunggah status dengan menandai grup ${groupName}\n` +
                          `-------------------------------\n` +
                          `⚙️ *Sanksi Pelanggaran:*\n` +
                          `- Tendang: ${antiupsw.kick ? '✅' : '❌'}\n` +
                          `- Hapus: ${antiupsw.delete ? '✅' : '❌'}\n` +
                          `📢 *Tindakan:* ${antiupsw.delete && antiupsw.kick ? 'Pesan dihapus dan pengguna dikeluarkan' : antiupsw.delete ? 'Pesan dihapus' : antiupsw.kick ? 'Pengguna dikeluarkan' : 'Peringatan diberikan'}.`,
                    contextInfo: {
                        mentionedJid: [sender],
                        externalAdReply: {
                            title: 'Pelanggaran Status',
                            body: 'Status Grup Terdeteksi',
                            thumbnailUrl: global.getRandomThumbnailUrl(),
                            mediaType: 1,
                            previewType: 1,
                            renderLargerThumbnail: false
                        }
                    }
                }, { quoted: m });

                let actionTaken = '';

                // Eksekusi hapus pesan jika delete aktif
                if (antiupsw.delete) {
                    await naze.sendMessage(chatId, { 
                        delete: { remoteJid: chatId, fromMe: false, id: m.key.id, participant: sender } 
                    });
                    actionTaken += 'Pesan dihapus';
                }

                // Eksekusi tendang pengguna jika kick aktif
                if (antiupsw.kick) {
                    try {
                        await naze.groupParticipantsUpdate(chatId, [sender], 'remove');
                        actionTaken += actionTaken ? ' dan pengguna dikeluarkan' : 'Pengguna dikeluarkan';
                    } catch (error) {
                        await naze.sendMessage(chatId, {
                            text: `❌ *Gagal mengeluarkan @${sender.split('@')[0]}!* Terjadi kesalahan: ${error.message}`,
                            contextInfo: { mentionedJid: [sender] }
                        }, { quoted: m });
                    }
                }

                global.db.upswUsers = global.db.upswUsers || {};
                global.db.upswUsers[sender] = { detected: true, time: Date.now() };
            }
            return;
        }
        await detectMutedUser(naze, m);
        // Abaikan pesan status atau pesan dari bot sendiri
        if (m.key && (m.key.remoteJid === 'status@broadcast' || m.key.fromMe)) return;

       

        // Perbarui pushname pengguna
        const { updateUserPushname, getUserPushname } = await LoadDataBase(naze, m);
        if (m.sender && m.pushName) {
            updateUserPushname(m.sender, m.pushName);
        }

        // Fungsi grup open/close
        const now = moment.tz('Asia/Jakarta').format('HH:mm');
        for (const [groupId, settings] of Object.entries(db.groups)) {
            if (settings.autoGroup?.enabled) {
                const { openTime, closeTime } = settings.autoGroup;
                if (!global.lastGroupAction[groupId]) global.lastGroupAction[groupId] = {};

                if (now === openTime && global.lastGroupAction[groupId].open !== now) {
                    global.lastGroupAction[groupId].open = now;
                    await naze.groupSettingUpdate(groupId, 'not_announcement');
                    await naze.sendMessage(groupId, { text: `🔓 *Grup otomatis dibuka!* Pukul ${openTime} WIB` });
                } else if (now === closeTime && global.lastGroupAction[groupId].close !== now) {
                    global.lastGroupAction[groupId].close = now;
                    await naze.groupSettingUpdate(groupId, 'announcement');
                    await naze.sendMessage(groupId, { text: `🔒 *Grup otomatis ditutup!* Pukul ${closeTime} WIB` });
                }
            }
        }
		if (m.command) {
			if (!global.db.set?.[botNumber]?.public) {
				if (!isOwner) {
					return;
				}
			}
		}
        
        if (command) {
            const featureFileName = commandMap.get(command.toLowerCase());
            if (featureFileName) {
                topCommand.incrementFeatureUsage(featureFileName);
            }
        }
        if (!command) return;
        // Filter Bot
const antispamConfig = db.set?.[botNumber]?.antispam || { aktif: false, durasi: 8000 };

if (antispamConfig.aktif) {
    const passed = await preventSpam(m, antispamConfig.durasi);
    if (!passed) return //m.reply(`⏳ Tunggu *${Math.floor(antispamConfig.durasi / 1000)} detik* sebelum pakai perintah ini lagi.`);
}

// lanjut eksekusi command

		
        await messageHandler(naze, m, isGroup, isAdmin, isBotAdmin, isOwner, onlyAdmin, autoFeatures, store, getUserPushname);
        blockedUsers = loadBlockedUsers();
        if (blockedUsers.has(senderNumber1)) return;
    } catch (e) {
        console.error('Error di MessagesUpsert:', e);
    }
}

async function blockChat(naze, number) {
    let jid = number.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    console.log(`📌 Menerima permintaan untuk memblokir: ${jid}`);
    let updatedBlockedUsers = loadBlockedUsers();
    console.log(`📂 Daftar sebelum ditambah:`, [...updatedBlockedUsers]);
    updatedBlockedUsers.add(jid);
    console.log(`✅ Daftar setelah ditambah:`, [...updatedBlockedUsers]);
    saveBlockedUsers(updatedBlockedUsers);
    let checkSaved = loadBlockedUsers();
    console.log(`🔍 Data setelah disimpan:`, [...checkSaved]);
    return `Nomor ${number} berhasil diblokir dari chat.`;
}

async function listBlockChat() {
    let latestBlockedUsers = loadBlockedUsers();
    return latestBlockedUsers.size > 0 
        ? `Daftar blockchat:\n${[...latestBlockedUsers].join('\n')}` 
        : 'Tidak ada nomor yang diblokir.';
}

async function Solving(naze, store) {
	naze.public = true;
	
	naze.serializeM = (m) => MessagesUpsert(naze, m, store);
	
	naze.decodeJid = (jid) => {
		if (!jid) return jid;
		if (/:\d+@/gi.test(jid)) {
			let decode = jidDecode(jid) || {};
			return decode.user && decode.server && decode.user + '@' + decode.server || jid;
		} else return jid;
	};
	
	naze.getName = (jid, withoutContact = false) => {
		const id = naze.decodeJid(jid);
		if (id.endsWith('@g.us')) {
			const groupInfo = store.contacts[id] || naze.groupMetadata(id) || {};
			return Promise.resolve(groupInfo.name || groupInfo.subject || PhoneNumber('+' + id.replace('@g.us', '')).getNumber('international'));
		} else {
			if (id === '0@s.whatsapp.net') {
				return 'WhatsApp';
			}
			const contactInfo = store.contacts[id] || {};
			return withoutContact ? '' : contactInfo.name || contactInfo.subject || contactInfo.verifiedName || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international');
		}
	};
	
	naze.sendContact = async (jid, kon, quoted = '', opts = {}) => {
		let list = [];
		for (let i of kon) {
			list.push({
				displayName: await naze.getName(i + '@s.whatsapp.net'),
				vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await naze.getName(i + '@s.whatsapp.net')}\nFN:${await naze.getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.ADR:;;Indonesia;;;;\nitem2.X-ABLabel:Region\nEND:VCARD`
			});
		}
		naze.sendMessage(jid, { contacts: { displayName: `${list.length} Kontak`, contacts: list }, ...opts }, { quoted });
	};
	naze.setBotLabel = async (jid, label) => {
    const payload = {
        "protocolMessage": {
            "type": 30,
            "memberLabel": {
                "label": label,
                "labelTimestamp": Math.floor(Date.now()/1000)
            }
        }
    }
    return naze.relayMessage(jid, payload, {})
    }
	naze.profilePictureUrl = async (jid, type = 'image', timeoutMs) => {
		const result = await naze.query({
			tag: 'iq',
			attrs: {
				target: jidNormalizedUser(jid),
				to: '@s.whatsapp.net',
				type: 'get',
				xmlns: 'w:profile:picture'
			},
			content: [{
				tag: 'picture',
				attrs: {
					type, query: 'url'
				},
			}]
		}, timeoutMs);
		const child = getBinaryNodeChild(result, 'picture');
		return child?.attrs?.url;
	};
	
	naze.setStatus = (status) => {
		naze.query({
			tag: 'iq',
			attrs: {
				to: '@s.whatsapp.net',
				type: 'set',
				xmlns: 'status',
			},
			content: [{
				tag: 'status',
				attrs: {},
				content: Buffer.from(status, 'utf-8')
			}]
		});
		return status;
	};
	
	naze.sendPoll = (jid, name = '', values = [], quoted, selectableCount = 1) => {
		return naze.sendMessage(jid, { poll: { name, values, selectableCount }}, { quoted, ephemeralExpiration: quoted.expiration || 0 })
	}
	naze.sendPoll1 = (jid, name = '', values = [], selectableCount = global.select) => {
		return naze.sendMessage(jid, {
		  poll: {
			name,
			values,
			selectableCount
	      }
	    })
	  };

	naze.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
		async function getFileUrl(res, mime) {
			if (mime && mime.includes('gif')) {
				return naze.sendMessage(jid, { video: res.data, caption: caption, gifPlayback: true, ...options }, { quoted });
			} else if (mime && mime === 'application/pdf') {
				return naze.sendMessage(jid, { document: res.data, mimetype: 'application/pdf', caption: caption, ...options }, { quoted });
			} else if (mime && mime.includes('image')) {
				return naze.sendMessage(jid, { image: res.data, caption: caption, ...options }, { quoted });
			} else if (mime && mime.includes('video')) {
				return naze.sendMessage(jid, { video: res.data, caption: caption, mimetype: 'video/mp4', ...options }, { quoted });
			} else if (mime && mime.includes('audio')) {
				return naze.sendMessage(jid, { audio: res.data, mimetype: 'audio/mpeg', ...options }, { quoted });
			}
		}
		
		const res = await axios.get(url, { responseType: 'arraybuffer' });
		let mime = res.headers['content-type'];
		if (!mime || mime === 'application/octet-stream') {
			const fileType = await FileType.fromBuffer(res.data);
			mime = fileType ? fileType.mime : null;
		}
		const hasil = await getFileUrl(res, mime);
		return hasil;
	};
	
	naze.sendFakeLink = async (jid, text, title, body, thumbnail, myweb, options = {}) => {
		await naze.sendMessage(jid, {
			text: text,
			contextInfo: {
				externalAdReply: {
					title: title,
					body: body,
					previewType: 'PHOTO',
					thumbnailUrl: myweb,
					thumbnail: thumbnail,
					sourceUrl: myweb
				}
			}
		}, { ...options });
	};
	
	naze.sendFromOwner = async (jid, text, quoted, options = {}) => {
		for (const a of jid) {
			await naze.sendMessage(a.replace(/[^0-9]/g, '') + '@s.whatsapp.net', { text, ...options }, { quoted });
		}
	};
	// Tambahkan metode sendButtonList ke instance naze
	naze.sendButtonList = async (chatId, text, footer, buttons, options = {}) => {
		try {
			// Generate custom key ID
			const customKeyId = generateCustomKeyId();

			// Buat pesan interaktif
			let msg = generateWAMessageFromContent(chatId, {
				viewOnceMessage: {
					message: {
						interactiveMessage: proto.Message.InteractiveMessage.create({
							contextInfo: {
								mentionedJid: options.mentionedJid || [],
								forwardingScore: options.forwardingScore || 999999,
								isForwarded: options.isForwarded || true
							},
							body: proto.Message.InteractiveMessage.Body.create({ text }),
							footer: proto.Message.InteractiveMessage.Footer.create({ text: footer }),
							nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
								buttons
							}),
						})
					}
				}
			}, { quoted: options.quoted || null });

			// Ganti msg.key.id dengan customKeyId
			msg.key.id = customKeyId;

			// Kirim pesan menggunakan relayMessage dengan custom messageId
			await naze.relayMessage(msg.key.remoteJid, msg.message, { messageId: customKeyId });

			return msg; // Kembalikan pesan yang dikirim
		} catch (err) {
			console.error('Error sending button list:', err);
			throw err;
		}
	};
	// Tambahkan metode sendButtonList ke instance naze
	naze.sendButtonList2 = async (chatId, text, footer, buttons, options = {}) => {
		try {
			// Generate custom key ID
			const customKeyId = generateCustomKeyId();

			// Siapkan media attachment untuk gambar
			let mediaAttachment;
			try {
				mediaAttachment = await prepareWAMessageMedia(
					{ image: { url: global.getRandomThumbnailUrl() } },
					{ upload: naze.waUploadToServer }
				);
			} catch (err) {
				console.error('Gagal load gambar random:', err.message);
				// Fallback ke gambar default jika gagal
				mediaAttachment = await prepareWAMessageMedia(
					{ image: { url: 'https://i.supa.codes/Jd-8FM' } },
					{ upload: naze.waUploadToServer }
				);
			}

			// Buat pesan interaktif dengan header gambar
			let msg = generateWAMessageFromContent(chatId, {
				viewOnceMessage: {
					message: {
						messageContextInfo: {
							deviceListMetadata: {},
							deviceListMetadataVersion: 2
						},
						interactiveMessage: proto.Message.InteractiveMessage.create({
							contextInfo: {
								mentionedJid: options.mentionedJid || [],
								forwardingScore: options.forwardingScore || 999999,
								isForwarded: options.isForwarded || true,
								forwardedNewsletterMessageInfo: {
									newsletterJid: "120363398738527362@newsletter",
									newsletterName: "BangsulBotz Chanel",
									serverMessageId: 145
								}
							},
							body: proto.Message.InteractiveMessage.Body.create({ text }),
							footer: proto.Message.InteractiveMessage.Footer.create({ text: footer }),
							header: proto.Message.InteractiveMessage.Header.create({
								title: "",
								subtitle: "",
								hasMediaAttachment: true,
								...mediaAttachment
							}),
							nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
								buttons
							}),
						})
					}
				}
			}, { quoted: options.quoted || null });

			// Ganti msg.key.id dengan customKeyId
			msg.key.id = customKeyId;

			// Kirim pesan menggunakan relayMessage dengan custom messageId
			await naze.relayMessage(msg.key.remoteJid, msg.message, { messageId: customKeyId });

			return msg; // Kembalikan pesan yang dikirim
		} catch (err) {
			console.error('Error sending button list:', err);
			throw err;
		}
	}
	naze.sendTextMentions = async (jid, text, quoted, options = {}) => naze.sendMessage(jid, { text: text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options }, { quoted });
	
	naze.sendAsSticker = async (jid, path, quoted, options = {}) => {
		const buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
		const result = await writeExif(buff, options);
		await naze.sendMessage(jid, { sticker: { url: result }, ...options }, { quoted });
		return buff;
	};
	naze.sendToSticker = async (jid, path, quoted, options = {}) => {
		try {
			// Konversi input ke buffer
			let buff = Buffer.isBuffer(path) ? path 
				: /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split(',')[1], 'base64') 
				: /^https?:\/\//.test(path) ? await (await getBuffer(path)) 
				: fs.existsSync(path) ? fs.readFileSync(path) 
				: Buffer.alloc(0);
	
			if (buff.length === 0) {
				throw new Error('Buffer kosong atau input tidak valid');
			}
	
			// Proses gambar dengan sharp untuk resize ke 512x512
			buff = await sharp(buff)
				.resize({
					width: 512,
					height: 512,
					fit: 'contain', // Pertahankan rasio aspek, tambahkan padding jika perlu
					background: { r: 0, g: 0, b: 0, alpha: 0 } // Background transparan
				})
				.toFormat('webp') // Konversi ke WebP, format stiker WhatsApp
				.toBuffer();
	
			// Tulis metadata EXIF jika ada
			const result = await writeExif(buff, options);
	
			// Kirim sebagai stiker
			await naze.sendMessage(jid, { sticker: { url: result }, ...options }, { quoted });
			return buff;
		} catch (error) {
			console.error('Error saat membuat stiker:', error);
			throw error; // Biarkan pemanggil menangani error
		}
	};
	
	naze.sendSticker = async (jid, path, options = {}) => {
		const buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
		const result = await writeExif(buff, options);
		await naze.sendMessage(jid, { sticker: { url: result }, ...options });
		return buff;
	};
	
	naze.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    try {
        const quoted = message.msg || message;
        if (!quoted || !quoted.mimetype) {
            throw new Error('Data pesan tidak valid atau tidak ada MIME type.');
        }

        const mime = quoted.mimetype;
        const messageType = (message.mtype || mime.split('/')[0]).replace(/Message/gi, '');
        const stream = await downloadContentFromMessage(quoted, messageType);

        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Validasi buffer tidak kosong
        if (buffer.length === 0) {
            throw new Error('Gagal mengunduh konten: Buffer kosong.');
        }

        // Gunakan file-type untuk deteksi tipe file, dengan penanganan error
        let type;
        try {
            const FileType = require('file-type'); // Pastikan modul diimpor
            type = await FileType.fromBuffer(buffer);
        } catch (typeErr) {
            console.warn('Gagal mendeteksi tipe file dengan file-type, menggunakan fallback ke .png:', typeErr.message);
            type = { ext: 'png' }; // Fallback ke .png jika file-type gagal
        }

        const trueFileName = attachExtension ? `./temp/${filename ? filename : Date.now()}.${type.ext}` : filename;
        await fs.promises.writeFile(trueFileName, buffer);
        return trueFileName;
    } catch (err) {
        console.error('Error di downloadAndSaveMediaMessage:', err.message);
        throw err; // Lempar error ke pemanggil untuk penanganan lebih lanjut
    }
};

	naze.sendGroupInvite = async (jid, participant, inviteCode, inviteExpiration, groupName = 'Unknown Subject', caption = 'Invitation to join my WhatsApp group', jpegThumbnail = null, options = {}) => {
		const msg = proto.Message.fromObject({
			groupInviteMessage: {
				inviteCode,
				inviteExpiration: parseInt(inviteExpiration) || + new Date(new Date + (3 * 86400000)),
				groupJid: jid,
				groupName,
				jpegThumbnail: Buffer.isBuffer(jpegThumbnail) ? jpegThumbnail : null,
				caption,
				contextInfo: {
					mentionedJid: options.mentions || []
				}
			}
		});
		const message = generateWAMessageFromContent(participant, msg, options);
		const invite = await naze.relayMessage(participant, message.message, { messageId: message.key.id })
		return invite
	}
	naze.getFile = async (PATH, save) => {
		let res;
		let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0);
		let type = await FileType.fromBuffer(data) || {
			mime: 'application/octet-stream',
			ext: '.bin'
		};
		filename = path.join(__filename, '../temp/' + new Date * 1 + '.' + type.ext);
		if (data && save) fs.promises.writeFile(filename, data);
		return {
			res,
			filename,
			size: await getSizeMedia(data),
			...type,
			data
		};
	};
	
	naze.sendMedia = async (jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
		const { mime, data, filename } = await naze.getFile(path, true);
		const isWebpSticker = options.asSticker || /webp/.test(mime);
		let type = 'document', mimetype = mime, pathFile = filename;
		if (isWebpSticker) {
			const { writeExif } = require('../lib1/exif.js');
			const media = { mimetype: mime, data };
			pathFile = await writeExif(media, {
				packname: options.packname || global.packname,
				author: options.author || global.author,
				categories: options.categories || [],
			});
			await fs.promises.unlink(filename);
			type = 'sticker';
			mimetype = 'image/webp';
		} else if (/image|video|audio/.test(mime)) {
			type = mime.split('/')[0];
		}
		await naze.sendMessage(jid, { [type]: { url: pathFile }, caption, mimetype, fileName, ...options }, { quoted, ...options });
		return fs.promises.unlink(pathFile);
	};
	
	naze.sendButtonMsg = async (jid, body = '', footer = '', title = '', media, buttons = [], quoted, options = {}) => {
		const { type, data, url, ...rest } = media || {};
		const msg = await generateWAMessageFromContent(jid, {
			viewOnceMessage: {
				message: {
					messageContextInfo: {
						deviceListMetadata: {},
						deviceListMetadataVersion: 2,
					},
					interactiveMessage: proto.Message.InteractiveMessage.create({
						body: proto.Message.InteractiveMessage.Body.create({ text: body }),
						footer: proto.Message.InteractiveMessage.Footer.create({ text: footer }),
						header: proto.Message.InteractiveMessage.Header.fromObject({
							title,
							hasMediaAttachment: !!media,
							...(media ? await generateWAMessageContent({
								[type]: url ? { url } : data, ...rest
							}, {
								upload: naze.waUploadToServer
							}) : {})
						}),
						nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
							buttons: buttons.map(a => {
								return {
									name: a.name,
									buttonParamsJson: JSON.stringify(a.buttonParamsJson ? (typeof a.buttonParamsJson === 'string' ? JSON.parse(a.buttonParamsJson) : a.buttonParamsJson) : '')
								};
							})
						}),
						contextInfo: {
							forwardedNewsletterMessageInfo: {
								newsletterJid: global.my.ch,
								serverMessageId: null,
								newsletterName: 'Join For More Info'
							},
							mentionedJid: options.mentions || [],
							...options.contextInfo,
							...(quoted ? {
								stanzaId: quoted.key.id,
								remoteJid: quoted.key.remoteJid,
								participant: quoted.key.participant || quoted.key.remoteJid,
								fromMe: quoted.key.fromMe,
								quotedMessage: quoted.message
							} : {})
						}
					})
				}
			}
		}, {});
		const hasil = await naze.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
		return hasil;
	};
	
	naze.sendCarouselMsg = async (jid, body = '', footer = '', cards = [], options = {}) => {
	async function getImageMsg(url) {
		const { imageMessage } = await generateWAMessageContent({ image: { url } }, { upload: naze.waUploadToServer });
		return imageMessage;
	}
 
	naze.sendCarouselMsg2 = async (jid, body = '', footer = '', cards = [], options = {}) => {
			async function getImageMsg(url) {
				const { imageMessage } = await generateWAMessageContent({ image: { url } }, { upload: naze.waUploadToServer });
				return imageMessage;
			}
			const cardPromises = cards.map(async (a) => {
				const imageMessage = await getImageMsg(a.url);
				return {
					header: {
						imageMessage: imageMessage,
						hasMediaAttachment: true
					},
					body: { text: a.body },
					footer: { text: a.footer },
					nativeFlowMessage: {
						buttons: a.buttons.map(b => ({
							name: b.name,
							buttonParamsJson: JSON.stringify(b.buttonParamsJson ? JSON.parse(b.buttonParamsJson) : '')
						}))
					}
				};
			});
			
			const cardResults = await Promise.all(cardPromises);
			const msg = await generateWAMessageFromContent(jid, {
				viewOnceMessage: {
					message: {
						messageContextInfo: {
							deviceListMetadata: {},
							deviceListMetadataVersion: 2
						},
						interactiveMessage: proto.Message.InteractiveMessage.create({
							body: proto.Message.InteractiveMessage.Body.create({ text: body }),
							footer: proto.Message.InteractiveMessage.Footer.create({ text: footer }),
							carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({
								cards: cardResults,
								messageVersion: 1
							})
						})
					}
				}
			}, {});
			const hasil = await naze.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
			return hasil
		}

	// Validasi cards harus array
	if (!Array.isArray(cards) || cards.length === 0) {
		console.error('[ERROR] Gagal membuat carousel: cards kosong atau bukan array');
		await naze.sendMessage(jid, { text: 'Gagal membuat carousel: data tidak valid.' }, options);
		return;
	}

	const cardPromises = cards.map(async (a, idx) => {
		let imageMessage;
		try {
			imageMessage = await getImageMsg(a.url);
		} catch (e) {
			console.error(`[ERROR] Gagal mengambil gambar untuk card ${idx + 1}:`, e);
			imageMessage = null; // fallback jika error
		}

		const buttons = Array.isArray(a.buttons)
			? a.buttons.map(b => ({
				name: b.name,
				buttonParamsJson: JSON.stringify(b.buttonParamsJson ? JSON.parse(b.buttonParamsJson) : '')
			}))
			: [];

		return {
			header: {
				imageMessage: imageMessage,
				hasMediaAttachment: !!imageMessage
			},
			body: { text: a.body || `Item ${idx + 1}` },
			footer: { text: a.footer || '' },
			nativeFlowMessage: { buttons }
		};
	});

	const cardResults = await Promise.all(cardPromises);

	const msg = await generateWAMessageFromContent(jid, {
		viewOnceMessage: {
			message: {
				messageContextInfo: {
					deviceListMetadata: {},
					deviceListMetadataVersion: 2
				},
				interactiveMessage: proto.Message.InteractiveMessage.create({
					body: proto.Message.InteractiveMessage.Body.create({ text: body }),
					footer: proto.Message.InteractiveMessage.Footer.create({ text: footer }),
					carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({
						cards: cardResults,
						messageVersion: 1
					})
				})
			}
		}
	}, {});
	
	const hasil = await naze.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
	return hasil;
};


	return naze;
}

async function Serialize(naze, m, store, groupCache) {
  // Inisialisasi store jika belum ada
  if (!store) {
    console.warn('[WARNING] store tidak tersedia di Serialize, menginisialisasi ulang...');
    store = { groupMetadata: {}, messages: {}, presences: {} };
  }
  if (!store.groupMetadata) store.groupMetadata = {};

  const normalizeJid = (jid) => {
    if (!jid) return jid;
    const [number] = jid.split(':');
    return number.includes('@') ? number : `${number}@s.whatsapp.net`;
  };

  // Fungsi untuk mendapatkan LID dari JID berdasarkan metadata
  const getLidFromJid = (jid, metadata) => {
    if (!metadata?.participants || !jid) return jid;
    const participant = metadata.participants.find(p => p.jid === jid);
    return participant ? participant.lid || jid : jid;
  };

  const botNumber = naze.decodeJid(naze.user.id);
  if (!m) return m;
  if (!store.messages[m.key.remoteJid]?.array?.some(a => a.key.id === m.key.id)) return m;

  const getDevice = (id) => {
    if (/^[A-Z0-9]{18}$/.test(id)) return 'ios';
    if (/^[A-Z0-9]{20}$/.test(id)) return 'web';
    if (/^[A-Z0-9]{21,32}$/.test(id)) return 'android';
    return 'unknown';
  };

  const getUserPushname = (jid) => {
    return global.db.users[jid]?.pushname || "~ (No Name)";
  };

  if (m.key) {
    m.id = m.key.id;
    m.chat = m.key.remoteJid;
    m.fromMe = m.key.fromMe;

    const messageTimestamps = new Map();

    m.isBot = (() => {
      if (!m || !m.id) return { isBot: false, reasons: [], ruleDetails: [] };

      if (m.msg?.senderKeyDistributionMessage) {
        return { isBot: false, reasons: ["Pengecualian: senderKeyDistributionMessage adalah pesan sistem"], ruleDetails: [] };
      }

      const normalizedSender = normalizeJid(m.sender);
      const normalizedParticipant = normalizeJid(m.participant || m.key.participant);
      const normalizedBotNumber = normalizeJid(botNumber);

      const timestamp = m.msg?.messageTimestamp ? m.msg.messageTimestamp * 1000 : Date.now();
      if (!messageTimestamps.has(normalizedSender)) messageTimestamps.set(normalizedSender, []);
      messageTimestamps.get(normalizedSender).push(timestamp);

      const isBotFlags = [];
      const reasons = [];
      const ruleDetails = [];

      const cleanId = m.id.split('-')[0];

      const isSelf =
        m.fromMe ||
        normalizedSender === normalizedBotNumber ||
        (m.isGroup && normalizedParticipant === normalizedBotNumber);
      isBotFlags.push(isSelf);
      if (isSelf) {
        reasons.push("Bot Sendiri: Pesan dari bot sendiri");
        ruleDetails.push("[Bot Sendiri] : true - Pesan dari bot sendiri");
      } else {
        ruleDetails.push("[Bot Sendiri] : false - Bukan pesan dari bot sendiri");
      }

      const device = getDevice(cleanId);
      const isValidDeviceId = device === "ios" || device === "web" || device === "android";
      const isDeviceInvalid = !isValidDeviceId;
      isBotFlags.push(isDeviceInvalid);
      if (isDeviceInvalid) {
        reasons.push(`Device Invalid: Device unknown (panjang ${cleanId.length}, bukan iOS/Web/Android)`);
        ruleDetails.push(`[Device Invalid] : true - Device unknown (panjang ${cleanId.length}, bukan iOS/Web/Android)`);
      } else {
        ruleDetails.push(`[Device Invalid] : false - Device valid (${device})`);
      }

      const hasLowercase = /[a-z]/.test(cleanId);
      const hasSymbol = /[^A-Za-z0-9]/.test(cleanId);
      const invalidHexChars = cleanId.match(/[^0-9A-F]/g);
      const isInvalidFormat = hasLowercase || hasSymbol || !!invalidHexChars;
      isBotFlags.push(isInvalidFormat);
      if (isInvalidFormat) {
        const formatReasons = [];
        if (hasLowercase) formatReasons.push("huruf kecil");
        if (hasSymbol) formatReasons.push("simbol");
        if (invalidHexChars) formatReasons.push(`karakter di luar heksadesimal (${invalidHexChars.join(", ")})`);
        reasons.push(`Format Invalid: ID mengandung ${formatReasons.join(", ")}`);
        ruleDetails.push(`[Format Invalid] : true - ID mengandung ${formatReasons.join(", ")}`);
      } else {
        ruleDetails.push("[Format Invalid] : false - ID sesuai format (hanya 0-9 dan A-F, tanpa huruf kecil/simbol)");
      }

      const botPrefixes = ["BAE5", "3EB0", "WOLE", "B1EY", "HSK", "FMSG", "MSG"];
      const startsWithBotPrefix = botPrefixes.some((prefix) => cleanId.startsWith(prefix));
      isBotFlags.push(startsWithBotPrefix);
      if (startsWithBotPrefix) {
        reasons.push(`Prefix Bot: ID diawali prefix bot: ${cleanId.slice(0, 4)}`);
        ruleDetails.push(`[Prefix Bot] : true - ID diawali prefix bot: ${cleanId.slice(0, 4)}`);
      } else {
        ruleDetails.push("[Prefix Bot] : false - ID tidak diawali prefix bot");
      }

      const hasBotStructure =
        (m.msg?.protocolMessage && m.msg.protocolMessage.type !== "REVOKE") ||
        (m.msg?.messageStubType && m.msg.messageStubType !== "REVOKE") ||
        m.msg?.senderKeyDistributionMessage;
      isBotFlags.push(hasBotStructure);
      if (hasBotStructure) {
        reasons.push("Struktur Bot: Struktur pesan khas bot (protocolMessage, stub, atau senderKey)");
        ruleDetails.push("[Struktur Bot] : true - Struktur pesan khas bot (protocolMessage, stub, atau senderKey)");
      } else {
        ruleDetails.push("[Struktur Bot] : false - Tidak ada struktur pesan khas bot");
      }

      const senderTimestamps = messageTimestamps.get(normalizedSender);
      const hasFastTiming =
        senderTimestamps.length > 1 &&
        senderTimestamps[senderTimestamps.length - 1] - senderTimestamps[senderTimestamps.length - 2] < 100;
      isBotFlags.push(hasFastTiming);
      if (hasFastTiming) {
        reasons.push("Timing Cepat: Waktu kirim sangat cepat (<100ms dari pesan sebelumnya)");
        ruleDetails.push("[Timing Cepat] : true - Waktu kirim sangat cepat (<100ms dari pesan sebelumnya)");
      } else {
        ruleDetails.push("[Timing Cepat] : false - Waktu kirim tidak terlalu cepat (>=100ms)");
      }

      const recentMessages = senderTimestamps.filter((ts) => Date.now() - ts < 10000);
      const hasHighFrequency = recentMessages.length > 2;
      isBotFlags.push(hasHighFrequency);
      if (hasHighFrequency) {
        reasons.push(`Frekuensi Tinggi: Frekuensi sangat tinggi: ${recentMessages.length} pesan dalam 10 detik`);
        ruleDetails.push(`[Frekuensi Tinggi] : true - Frekuensi sangat tinggi: ${recentMessages.length} pesan dalam 10 detik`);
      } else {
        ruleDetails.push(`[Frekuensi Tinggi] : false - Frekuensi rendah: ${recentMessages.length} pesan dalam 10 detik`);
      }

      const hasBotContext = m.msg?.contextInfo?.isBotMessage === true;
      isBotFlags.push(hasBotContext);
      if (hasBotContext) {
        reasons.push("ContextInfo Bot: ContextInfo menunjukkan tanda bot");
        ruleDetails.push("[ContextInfo Bot] : true - ContextInfo menunjukkan tanda bot");
      } else {
        ruleDetails.push("[ContextInfo Bot] : false - Tidak ada tanda bot di ContextInfo");
      }

      const hasButtonMessage =
        m.interactiveMessage?.nativeFlowMessage?.buttons?.length > 0 ||
        m.buttonsMessage?.buttons?.length > 0;
      isBotFlags.push(hasButtonMessage);
      if (hasButtonMessage) {
        reasons.push("Button Message: Pesan berisi tombol interaktif (buttonsMessage atau nativeFlowMessage)");
        ruleDetails.push("[Button Message] : true - Pesan berisi tombol interaktif (buttonsMessage atau nativeFlowMessage)");
      } else {
        ruleDetails.push("[Button Message] : false - Pesan tidak berisi tombol interaktif");
      }

      const isBot = isBotFlags.some((flag) => flag === true);
      return { isBot, reasons, ruleDetails };
    })();

    m.isGroup = m.chat.endsWith('@g.us');
    m.sender = naze.decodeJid(m.fromMe && naze.user.id || m.participant || m.key.participant || m.chat || '');
    m.metadata = m.isGroup ? m.metadata : {};
    if (m.isGroup) {
  let metadata = store.groupMetadata[m.chat];
  if (!metadata) {
    // Pastikan groupCache adalah Map, jika tidak, gunakan fallback
    if (groupCache instanceof Map) {
      metadata = groupCache.get(m.chat);
    }
    if (!metadata) {
      metadata = await getGroupMetadataWithCooldown(naze, m.chat, store, groupCache); // Teruskan store dan groupCache
      store.groupMetadata[m.chat] = metadata;
      if (groupCache instanceof Map) {
        groupCache.set(m.chat, metadata);
      }
    }
  }
  if (metadata) {
    metadata.participants = metadata.participants?.filter(p => p.hasOwnProperty('id') && p.hasOwnProperty('admin'))?.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) || [];
    metadata.addressingMode = metadata.addressingMode || 'jid';
  }
  m.metadata = metadata || {};

  const senderLid = metadata.addressingMode === 'lid' ? getLidFromJid(m.sender, metadata) : m.sender;
  const botLid = metadata.addressingMode === 'lid' ? getLidFromJid(botNumber, metadata) : botNumber;

  m.admins = metadata?.participants
    ? metadata.participants
        .filter(p => p.admin)
        .map(p => ({ id: metadata.addressingMode === 'lid' ? p.lid : p.jid, admin: p.admin }))
    : [];
  m.isAdmin = m.admins?.some(b => (metadata.addressingMode === 'lid' ? b.id === senderLid : b.id === m.sender)) || false;
  m.participant = m.key.participant;
  m.isBotAdmin = !!m.admins?.find(member => (metadata.addressingMode === 'lid' ? member.id === botLid : member.id === botNumber)) || false;
}
  }

  if (m.message) {
    m.type = getContentType(m.message) || Object.keys(m.message)[0];
    m.msg = (/viewOnceMessage/i.test(m.type) ? m.message[m.type].message[getContentType(m.message[m.type].message)] : (extractMessageContent(m.message[m.type]) || m.message[m.type]));

    if (m.type === 'buttonsResponseMessage') {
      m.buttonId = m.msg.selectedButtonId || '';
      m.body = m.buttonId;
    } else if (m.type === 'interactiveResponseMessage' && m.msg?.nativeFlowResponseMessage?.paramsJson) {
      const params = JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson || '{}');
      m.buttonId = params.id || '';
      m.body = m.buttonId;
    } else {
      m.body = m.message?.conversation || m.msg?.text || m.msg?.conversation || m.msg?.caption ||
        m.msg?.selectedButtonId || m.msg?.singleSelectReply?.selectedRowId ||
        m.msg?.selectedId || m.msg?.contentText || m.msg?.selectedDisplayText ||
        m.msg?.title || m.msg?.name || '';
    }

    m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
    m.text = m.msg?.text || m.msg?.caption || m.message?.conversation || m.msg?.contentText || m.msg?.selectedDisplayText || m.msg?.title || '';
    m.prefix = global.prefixes.find(p => m.body.startsWith(p)) || '';
    m.command = m.body && m.body.replace(m.prefix, '').trim().split(/ +/).shift();
    m.args = m.body?.trim().replace(new RegExp("^" + m.prefix?.replace(/[.*=+:\-?^${}()|[\]\\]|\s/g, '\\$&'), 'i'), '').replace(m.command, '').split(/ +/).filter(a => a) || [];
    m.device = getDevice(m.id);
    m.expiration = m.msg?.contextInfo?.expiration || 0;
    m.timestamp = (typeof m.messageTimestamp === "number" ? m.messageTimestamp : m.messageTimestamp.low ? m.messageTimestamp.low : m.messageTimestamp.high) || m.msg.timestampMs * 1000;
    m.isMedia = !!m.msg?.mimetype || !!m.msg?.thumbnailDirectPath;
    if (m.isMedia) {
      m.mime = m.msg?.mimetype;
      m.size = m.msg?.fileLength;
      m.height = m.msg?.height || '';
      m.width = m.msg?.width || '';
      if (/webp/i.test(m.mime)) {
        m.isAnimated = m.msg?.isAnimated;
      }
    }
    m.quoted = m.msg?.contextInfo?.quotedMessage || null;
    if (m.quoted) {
      m.quoted.message = extractMessageContent(m.msg?.contextInfo?.quotedMessage);
      m.quoted.type = getContentType(m.quoted.message) || Object.keys(m.quoted.message)[0];
      m.quoted.id = m.msg.contextInfo.stanzaId;
      m.quoted.device = getDevice(m.quoted.id);
      m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat;

      const messageTimestamps = new Map();
      m.quoted.isBot = (() => {
        if (!m.quoted || !m.quoted.id) return { isBot: false, reasons: [], ruleDetails: [] };
        const normalizedSender = normalizeJid(m.sender);
        const normalizedQuotedSender = m.quoted.sender ? normalizeJid(m.quoted.sender) : (m.sender ? normalizeJid(m.sender) : '');
        const normalizedContextParticipant = m.msg.contextInfo?.participant ? normalizeJid(m.msg.contextInfo.participant) : '';
        const normalizedBotNumber = normalizeJid(botNumber);

        const timestamp = m.quoted.msg?.messageTimestamp ? m.quoted.msg.messageTimestamp * 1000 : Date.now();
        if (normalizedQuotedSender && !messageTimestamps.has(normalizedQuotedSender)) {
          messageTimestamps.set(normalizedQuotedSender, []);
        }
        if (normalizedQuotedSender) {
          messageTimestamps.get(normalizedQuotedSender).push(timestamp);
        }

        const isBotFlags = [];
        const reasons = [];
        const ruleDetails = [];

        const isSelfQuoted =
          (m.quoted.key?.fromMe || m.quoted.fromMe) ||
          (normalizedQuotedSender && normalizedQuotedSender === normalizedBotNumber) ||
          (m.quoted.isGroup && (normalizedContextParticipant === normalizedBotNumber || normalizedQuotedSender === normalizedBotNumber)) ||
          (m.quoted.key?.remoteJid === m.key.remoteJid && normalizedSender === normalizedBotNumber);
        isBotFlags.push(isSelfQuoted);
        if (isSelfQuoted) {
          reasons.push("Bot Sendiri: Pesan dari bot sendiri");
          ruleDetails.push("[Bot Sendiri] : true - Pesan dari bot sendiri");
        } else {
          ruleDetails.push("[Bot Sendiri] : false - Bukan pesan dari bot sendiri");
        }

        const device = getDevice(m.quoted.id);
        const isValidDeviceId = device === 'ios' || device === 'web' || device === 'android';
        const isDeviceInvalid = !isValidDeviceId;
        isBotFlags.push(isDeviceInvalid);
        if (isDeviceInvalid) {
          reasons.push(`Device Invalid: Device unknown (panjang ${m.quoted.id.length}, bukan iOS/Web/Android)`);
          ruleDetails.push(`[Device Invalid] : true - Device unknown (panjang ${m.quoted.id.length}, bukan iOS/Web/Android)`);
        } else {
          ruleDetails.push(`[Device Invalid] : false - Device valid (${device})`);
        }

        const hasLowercase = /[a-z]/.test(m.quoted.id);
        const hasSymbol = /[^A-Za-z0-9]/.test(m.quoted.id);
        const invalidHexChars = m.quoted.id.match(/[^0-9A-F]/g);
        const isInvalidFormat = hasLowercase || hasSymbol || !!invalidHexChars;
        isBotFlags.push(isInvalidFormat);
        if (isInvalidFormat) {
          const formatReasons = [];
          if (hasLowercase) formatReasons.push("huruf kecil");
          if (hasSymbol) formatReasons.push("simbol");
          if (invalidHexChars) formatReasons.push(`karakter di luar heksadesimal (${invalidHexChars.join(', ')})`);
          reasons.push(`Format Invalid: ID mengandung ${formatReasons.join(', ')}`);
          ruleDetails.push(`[Format Invalid] : true - ID mengandung ${formatReasons.join(', ')}`);
        } else {
          ruleDetails.push("[Format Invalid] : false - ID sesuai format (hanya 0-9 dan A-F, tanpa huruf kecil/simbol)");
        }

        const botPrefixes = ['BAE5', 'WOLE', 'B1EY', '3EB0', 'HSK', 'FMSG', 'MSG'];
        const startsWithBotPrefix = botPrefixes.some(prefix => m.quoted.id.startsWith(prefix));
        isBotFlags.push(startsWithBotPrefix);
        if (startsWithBotPrefix) {
          reasons.push(`Prefix Bot: ID diawali prefix bot: ${m.quoted.id.slice(0, 4)}`);
          ruleDetails.push(`[Prefix Bot] : true - ID diawali prefix bot: ${m.quoted.id.slice(0, 4)}`);
        } else {
          ruleDetails.push("[Prefix Bot] : false - ID tidak diawali prefix bot");
        }

        const hasBotStructure =
          (m.quoted.msg?.protocolMessage && m.quoted.msg.protocolMessage.type !== 'REVOKE') ||
          (m.quoted.msg?.messageStubType && m.quoted.msg.messageStubType !== 'REVOKE') ||
          m.quoted.msg?.senderKeyDistributionMessage;
        isBotFlags.push(hasBotStructure);
        if (hasBotStructure) {
          reasons.push("Struktur Bot: Struktur pesan khas bot (protocolMessage, stub, atau senderKey)");
          ruleDetails.push("[Struktur Bot] : true - Struktur pesan khas bot (protocolMessage, stub, atau senderKey)");
        } else {
          ruleDetails.push("[Struktur Bot] : false - Tidak ada struktur pesan khas bot");
        }

        const senderTimestamps = normalizedQuotedSender ? messageTimestamps.get(normalizedQuotedSender) : [];
        const hasFastTiming =
          senderTimestamps.length > 1 &&
          (senderTimestamps[senderTimestamps.length - 1] - senderTimestamps[senderTimestamps.length - 2]) < 100;
        isBotFlags.push(hasFastTiming);
        if (hasFastTiming) {
          reasons.push("Timing Cepat: Waktu kirim sangat cepat (<100ms dari pesan sebelumnya)");
          ruleDetails.push("[Timing Cepat] : true - Waktu kirim sangat cepat (<100ms dari pesan sebelumnya)");
        } else {
          ruleDetails.push("[Timing Cepat] : false - Waktu kirim tidak terlalu cepat (>=100ms)");
        }

        const recentMessages = senderTimestamps.filter(ts => Date.now() - ts < 10000);
        const hasHighFrequency = recentMessages.length > 2;
        isBotFlags.push(hasHighFrequency);
        if (hasHighFrequency) {
          reasons.push(`Frekuensi Tinggi: Frekuensi sangat tinggi: ${recentMessages.length} pesan dalam 10 detik`);
          ruleDetails.push(`[Frekuensi Tinggi] : true - Frekuensi sangat tinggi: ${recentMessages.length} pesan dalam 10 detik`);
        } else {
          ruleDetails.push(`[Frekuensi Tinggi] : false - Frekuensi rendah: ${recentMessages.length} pesan dalam 10 detik`);
        }

        const hasBotContext = m.quoted.msg?.contextInfo?.isBotMessage === true;
        isBotFlags.push(hasBotContext);
        if (hasBotContext) {
          reasons.push("ContextInfo Bot: ContextInfo menunjukkan tanda bot");
          ruleDetails.push("[ContextInfo Bot] : true - ContextInfo menunjukkan tanda bot");
        } else {
          ruleDetails.push("[ContextInfo Bot] : false - Tidak ada tanda bot di ContextInfo");
        }

        const hasButtonMessage =
          m.quoted?.interactiveMessage?.nativeFlowMessage?.buttons?.length > 0 ||
          m.quoted?.buttonsMessage?.buttons?.length > 0;
        isBotFlags.push(hasButtonMessage);
        if (hasButtonMessage) {
          reasons.push("Button Message: Pesan berisi tombol interaktif (buttonsMessage atau nativeFlowMessage)");
          ruleDetails.push("[Button Message] : true - Pesan berisi tombol interaktif (buttonsMessage atau nativeFlowMessage)");
        } else {
          ruleDetails.push("[Button Message] : false - Pesan tidak berisi tombol interaktif");
        }

        const isBot = isBotFlags.some(flag => flag === true);
        return { isBot, reasons, ruleDetails };
      })();
	 m.quoted.sender = naze.decodeJid(m.msg.contextInfo.participant || m.msg.contextInfo.stanzaId.split('@')[0] + '@s.whatsapp.net');
     m.quoted.sender1 = naze.decodeJid(m.msg.contextInfo.participant || m.msg.contextInfo.stanzaId.split('@')[0] + '@s.whatsapp.net');
      m.quoted.pushName = getUserPushname(m.quoted.sender1);
      m.quoted.fromMe = m.quoted.sender === naze.decodeJid(naze.user.id);
      m.quoted.text = m.quoted.caption || m.quoted.conversation || m.quoted.contentText || m.quoted.selectedDisplayText || m.quoted.title || '';
      m.quoted.msg = extractMessageContent(m.quoted.message[m.quoted.type]) || m.quoted.message[m.quoted.type];
      m.quoted.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];
      m.quoted.body = m.quoted.msg?.text || m.quoted.msg?.caption || m.quoted?.message?.conversation || m.quoted.msg?.selectedButtonId || m.quoted.msg?.singleSelectReply?.selectedRowId || m.quoted.msg?.selectedId || m.quoted.msg?.contentText || m.quoted.msg?.selectedDisplayText || m.quoted.msg?.title || m.quoted?.msg?.name || '';
      m.getQuotedObj = async () => {
        if (!m.quoted.id) return false;
        let q = await store.loadMessage(m.chat, m.quoted.id, naze);
        return await Serialize(naze, q, store, groupCache); // Teruskan groupCache
      };
      m.quoted.key = {
        remoteJid: m.msg?.contextInfo?.remoteJid || m.chat,
        participant: m.quoted.sender,
        fromMe: areJidsSameUser(naze.decodeJid(m.msg?.contextInfo?.participant), naze.decodeJid(naze?.user?.id)),
        id: m.msg?.contextInfo?.stanzaId
      };
      m.quoted.isGroup = m.quoted.chat.endsWith('@g.us');
      m.quoted.mentions = m.quoted.msg?.contextInfo?.mentionedJid || [];
      m.quoted.body = m.quoted.msg?.text || m.quoted.msg?.caption || m.quoted?.message?.conversation || m.quoted.msg?.selectedButtonId || m.quoted.msg?.singleSelectReply?.selectedRowId || m.quoted.msg?.selectedId || m.quoted.msg?.contentText || m.quoted.msg?.selectedDisplayText || m.quoted.msg?.title || m.quoted?.msg?.name || '';
      m.quoted.prefix = /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(m.quoted.body) ? m.quoted.body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0] : /[\uD800-\uDBFF][\uDC00-\uDFFF]/gi.test(m.quoted.body) ? m.quoted.body.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/gi)[0] : '';
      m.quoted.command = m.quoted.body && m.quoted.body.replace(m.quoted.prefix, '').trim().split(/ +/).shift();
      m.quoted.isMedia = !!m.quoted.msg?.mimetype || !!m.quoted.msg?.thumbnailDirectPath;
      if (m.quoted.isMedia) {
        m.quoted.mime = m.quoted.msg?.mimetype;
        m.quoted.size = m.quoted.msg?.fileLength;
        m.quoted.height = m.quoted.msg?.height || '';
        m.quoted.width = m.quoted.msg?.width || '';
        if (/webp/i.test(m.quoted.mime)) {
          m.quoted.isAnimated = m?.quoted?.msg?.isAnimated || false;
        }
      }
      m.quoted.fakeObj = proto.WebMessageInfo.fromObject({
        key: {
          remoteJid: m.quoted.chat,
          fromMe: m.quoted.fromMe,
          id: m.quoted.id
        },
        message: m.quoted,
        ...(m.isGroup ? { participant: m.quoted.sender } : {})
      });
      m.quoted.download = async () => {
        const quotednya = m.quoted.msg || m.quoted;
        const mimenya = quotednya.mimetype || '';
        const messageType = (m.quoted.type || mimenya.split('/')[0]).replace(/Message/gi, '');
        const stream = await downloadContentFromMessage(quotednya, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
      };
      m.quoted.delete = () => {
        naze.sendMessage(m.quoted.chat, {
          delete: {
            remoteJid: m.quoted.chat,
            fromMe: m.isBotAdmins ? false : true,
            id: m.quoted.id,
            participant: m.quoted.sender
          }
        });
      };
    }
  }

  m.download = async () => {
    const quotednya = m.msg || m.quoted;
    const mimenya = quotednya.mimetype || '';
    const messageType = (m.type || mimenya.split('/')[0]).replace(/Message/gi, '');
    const stream = await downloadContentFromMessage(quotednya, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
  };

  m.copy = () => Serialize(naze, proto.WebMessageInfo.fromObject(proto.WebMessageInfo.toObject(m)));

  m.reply = async (text, options = {}) => {
    const chatId = options?.chat ? options.chat : m.chat;
    const caption = options.caption || '';
    const quoted = options?.quoted ? options.quoted : m;

    try {
      if (typeof text === 'object' && text.text) {
        return naze.sendMessage(chatId, {
          text: text.text,
          ...text.contextInfo,
          mentions: [...text.text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'),
          ...options
        }, { quoted });
      }

      if (typeof text === 'string' && /^https?:\/\//.test(text)) {
        const data = await axios.get(text, { responseType: 'arraybuffer' });
        const mime = data.headers['content-type'] || (await FileType.fromBuffer(data.data)).mime;
        if (/gif|image|video|audio|pdf/i.test(mime)) {
          return naze.sendFileUrl(chatId, text, caption, quoted, options);
        }
      }

      return naze.sendMessage(chatId, {
        text: text,
        mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'),
        ...options
      }, { quoted });

    } catch (e) {
      console.error(e);
      const finalText = typeof text === 'string' ? text : text.text || 'Terjadi kesalahan';
      return naze.sendMessage(chatId, {
        text: finalText,
        mentions: [...finalText.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'),
        ...options
      }, { quoted });
    }
  };

  return m;
}

module.exports = { GroupUpdate,GroupCacheUpdate, GroupParticipantsUpdate, LoadDataBase,MessagesUpsert, blockChat, listBlockChat, Solving, messageHandler};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
	fs.unwatchFile(file);
	console.log(chalk.redBright(`Update ${__filename}`));
	delete require.cache[file];
	require(file);
});
