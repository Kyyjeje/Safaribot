require('../../settings');
const axios = require('axios');

async function tiktokDl(url) {
  return new Promise(async (resolve, reject) => {
    try {
      let data = [];
      function formatNumber(integer) {
        let numb = parseInt(integer);
        return Number(numb).toLocaleString().replace(/,/g, '.');
      }

      function formatDate(n, locale = 'en') {
        let d = new Date(n);
        return d.toLocaleDateString(locale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric'
        });
      }

      let domain = 'https://www.tikwm.com/api/';
      let res = await (await axios.post(domain, {}, {
        headers: {
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Origin': 'https://www.tikwm.com',
          'Referer': 'https://www.tikwm.com/',
          'Sec-Ch-Ua': '"Not)A;Brand" ;v="24" , "Chromium" ;v="116"',
          'Sec-Ch-Ua-Mobile': '?1',
          'Sec-Ch-Ua-Platform': 'Android',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
          'X-Requested-With': 'XMLHttpRequest'
        },
        params: {
          url: url,
          count: 12,
          cursor: 0,
          web: 1,
          hd: 1
        },
        timeout: 20000
      })).data.data;
      if (res && !res.size && !res.wm_size && !res.hd_size) {
        res.images.map(v => {
          data.push({ type: 'photo', url: v });
        });
      } else {
        if (res && res.wmplay) {
          data.push({ type: 'watermark', url: 'https://www.tikwm.com' + res.wmplay });
        }
        if (res && res.play) {
          data.push({ type: 'nowatermark', url: 'https://www.tikwm.com' + res.play });
        }
        if (res && res.hdplay) {
          data.push({ type: 'nowatermark_hd', url: 'https://www.tikwm.com' + res.hdplay });
        }
      }
      let json = {
        status: true,
        title: res.title,
        taken_at: formatDate(res.create_time).replace('1970', ''),
        region: res.region,
        id: res.id,
        durations: res.duration,
        duration: res.duration + ' Seconds',
        cover: 'https://www.tikwm.com' + res.cover,
        size_wm: res.wm_size,
        size_nowm: res.size,
        size_nowm_hd: res.hd_size,
        data: data,
        music_info: {
          id: res.music_info.id,
          title: res.music_info.title,
          author: res.music_info.author,
          album: res.music_info.album ? res.music_info.album : null,
          url: 'https://www.tikwm.com' + (res.music || res.music_info.play)
        },
        stats: {
          views: formatNumber(res.play_count),
          likes: formatNumber(res.digg_count),
          comment: formatNumber(res.comment_count),
          share: formatNumber(res.share_count),
          download: formatNumber(res.download_count)
        },
        author: {
          id: res.author.id,
          fullname: res.author.unique_id,
          nickname: res.author.nickname,
          avatar: 'https://www.tikwm.com' + res.author.avatar
        }
      };
      resolve(json);
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  name: 'ttmp3',
  alias: ['ttmp3', '.ttmp3', 'tiktokmp3', 'tiktokaudio'],
  description: '<URL tiktok>',
  run: async ({ naze, m, text }) => {
    //await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
    const body = (m.type === 'conversation') ? m.message.conversation :
                 (m.type === 'imageMessage') ? m.message.imageMessage.caption :
                 (m.type === 'videoMessage') ? m.message.videoMessage.caption :
                 (m.type === 'extendedTextMessage') ? m.message.extendedTextMessage.text :
                 (m.type === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId :
                 (m.type === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                 (m.type === 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId :
                 (m.type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) :
                 (m.type === 'editedMessage') ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage ? m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage.text : m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';

    const args = body.trim().split(/ +/).slice(1);
    let urlToDownload = text || args[0];
    if (!urlToDownload) {
      
      return m.reply(`Contoh: ${m.prefix}${m.command} <url_tiktok>`);
    }
    if (!urlToDownload.includes('tiktok.com')) {
      
      return m.reply(`URL tidak valid! Pastikan URL berasal dari TikTok.\nContoh: ${m.prefix}${m.command} https://www.tiktok.com/@username/video/123456789`);
    }
    await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
    try {
      const hasil = await tiktokDl(urlToDownload);
      

      if (hasil.music_info && hasil.music_info.url) {
        await naze.sendMessage(m.chat, {
          audio: { url: hasil.music_info.url },
          mimetype: 'audio/mpeg',
          fileName: `${hasil.music_info.title || 'tiktok_audio'}.mp3`,
          contextInfo: {
            externalAdReply: {
              title: 'TikTok Audio • ' + hasil.author.nickname,
              body: hasil.stats.likes + ' suka, ' + hasil.stats.comment + ' komentar. ' + hasil.title,
              previewType: 'PHOTO',
              thumbnailUrl: hasil.cover,
              mediaType: 1,
              renderLargerThumbnail: true,
              sourceUrl: urlToDownload
            }
          }
        }, { quoted: m });
        

        await naze.sendMessage(m.chat, {
          document: { url: hasil.music_info.url },
          mimetype: 'audio/mpeg',
          fileName: `${hasil.music_info.title || 'tiktok_audio'}.mp3`,
          contextInfo: {
            externalAdReply: {
              title: 'TikTok Audio • ' + hasil.author.nickname,
              body: hasil.stats.likes + ' suka, ' + hasil.stats.comment + ' komentar. ' + hasil.title,
              previewType: 'PHOTO',
              thumbnailUrl: hasil.cover,
              mediaType: 1,
              renderLargerThumbnail: true,
              sourceUrl: urlToDownload
            }
          }
        }, { quoted: m });
        
      } else {
        
        await m.reply('Gagal mengunduh audio: Tidak ada audio yang tersedia di URL ini.');
      }
    } catch (e) {
      
      if (e.name === 'AbortError' || e.message.includes('timeout')) {
        await m.reply('Gagal mengambil data: Permintaan melebihi 20 detik. Silakan coba lagi.');
      } else if (e.code === 'ETIMEDOUT' || e.code === 'ENETUNREACH') {
        await m.reply('Gagal mengunduh audio: Masalah koneksi jaringan.');
      } else {
        await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        await m.reply(`Gagal mengambil data: ${e.message}`);
      }
      await global.sendMessageWithThumbnail(naze, m.chat, 'error', m);
    }
  }
};