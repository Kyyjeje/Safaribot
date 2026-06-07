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
        let d = new Date(n * 1000);
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

      const domain = 'https://www.tikwm.com/api/';
      const params = {
        url: url,
        hd: 1  
      };

      console.log('[TIKTOK DL] Mulai request ke TikWM API (GET sederhana)');
      console.log('[TIKTOK DL] URL:', domain + '?' + new URLSearchParams(params).toString());

      let axiosRes;
      try {
       
        axiosRes = await axios.get(domain, {
          params,
          timeout: 20000
          
        });
      } catch (axiosErr) {
        console.error('[TIKTOK DL] Axios Request Gagal:', axiosErr.message);
        return reject(axiosErr);
      }

      console.log('[TIKTOK DL] Response Status:', axiosRes.status);
      console.log('[TIKTOK DL] Full Response Raw:', JSON.stringify(axiosRes.data, null, 2));

      const apiResponse = axiosRes.data;

      // Tangani error dari API TikWM (code !== 0)
      if (apiResponse.code !== 0) {
        console.log('[TIKTOK DL] API TikWM Error:', apiResponse.msg || 'Unknown error');
        let userMsg = 'Link TikTok tidak valid atau tidak didukung!\n\n';
        userMsg += 'Pastikan link adalah video TikTok biasa (bukan Live).\n';
        userMsg += 'Contoh link benar:\nhttps://www.tiktok.com/@username/video/123456789';
        return reject(new Error(userMsg));
      }

      const res = apiResponse.data;
      if (!res) {
        console.log('[TIKTOK DL] Tidak ada data meskipun code 0');
        return reject(new Error('Data TikTok tidak ditemukan. Mungkin video private atau dihapus.'));
      }

      
      if (res.images && res.images.length > 0) {
        res.images.forEach(v => {
          data.push({ type: 'photo', url: v });  
        });
      } else {
        
        if (res.hdplay) data.push({ type: 'nowatermark_hd', url: res.hdplay });
        if (res.play) data.push({ type: 'nowatermark', url: res.play });
        if (res.wmplay) data.push({ type: 'watermark', url: res.wmplay });
      }

      const json = {
        status: true,
        title: res.title || 'No Title',
        taken_at: formatDate(res.create_time || 0).replace('1970', ''),
        region: res.region || 'Unknown',
        id: res.id,
        durations: res.duration,
        duration: res.duration + ' Seconds',
        cover: res.cover || '',  
        size_wm: res.wm_size,
        size_nowm: res.size,
        size_nowm_hd: res.hd_size,
        data: data,
        music_info: {
          id: res.music_info?.id || '',
          title: res.music_info?.title || 'Unknown',
          author: res.music_info?.author || 'Unknown',
          album: res.music_info?.album || null,
          
          url: res.music || res.music_info?.play || ''
        },
        stats: {
          views: formatNumber(res.play_count || 0),
          likes: formatNumber(res.digg_count || 0),
          comment: formatNumber(res.comment_count || 0),
          share: formatNumber(res.share_count || 0),
          download: formatNumber(res.download_count || 0)
        },
        author: {
          id: res.author?.id || '',
          fullname: res.author?.unique_id || '',
          nickname: res.author?.nickname || 'Unknown',
          avatar: res.author?.avatar || ''  
        }
      };

      console.log('[TIKTOK DL] Parsing selesai, mengirim json sukses');
      resolve(json);
    } catch (e) {
      console.error('[TIKTOK DL] Error fatal di tiktokDl:', e.message);
      reject(e);
    }
  });
}

module.exports = {
  name: 'tiktok',
  alias: ['ttmp3', '.ttmp3', 'tiktokdown', 'ttdown', 'ttdl', 'tt', 'ttmp4', 'ttvideo', 'tiktokmp4', 'tiktokvideo',
    '.tiktok', '.tiktokdown', '.ttdown', '.ttdl', '.tt', '.ttmp4', '.ttvideo', '.tiktokmp4', '.tiktokvideo'
  ],
  description: '<URL tiktok>',
  run: async ({ naze, m, text }) => {
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
     
      const createButtons = (tiktokUrl, mediaUrl) => [
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: "🔗 Lihat di TikTok",
            url: tiktokUrl
          })
        },
        {
          name: "cta_copy",
          buttonParamsJson: JSON.stringify({
            display_text: "📥 Salin URL Download",
            id: mediaUrl,
            copy_code: mediaUrl
          })
        }
      ];
      if (hasil && hasil.size_nowm) {
        await naze.sendMessage(m.chat, {
          video: { url: hasil.data[1].url },
          caption: `🎥 *TikTok Video*\n\n👤 *Username*: ${hasil.author.nickname}\n📝 *Judul*: ${hasil.title}\n❤️ *Likes*: ${hasil.stats.likes}\n📅 *Tanggal Posting*: ${hasil.taken_at}`
        }, { quoted: m });
       
      } else if (hasil.data.length > 1) {
        const carouselCards = hasil.data.map((item, index) => {
          return {
            url: item.url,
            body: `📸 *TikTok Image*\n\n🖼️ *Gambar ${index + 1}/${hasil.data.length}*\n👤 *Username*: ${hasil.author.nickname}\n❤️ *Likes*: ${hasil.stats.likes}\n📅 *Tanggal Posting*: ${hasil.taken_at}`,
            footer: "Powered by TikTok API",
            buttons: createButtons(urlToDownload, item.url)
          };
        });
        await naze.sendCarouselMsg(
          m.chat,
          "Hasil TikTok (Multiple Images)",
          "Geser untuk melihat gambar lainnya",
          carouselCards,
          undefined,
          { quoted: m }
        );
       
      } else {
        await naze.sendMessage(m.chat, {
          image: { url: hasil.data[0].url },
          caption: `📸 *TikTok Image*\n\n👤 *Username*: ${hasil.author.nickname}\n📝 *Judul*: ${hasil.title}\n❤️ *Likes*: ${hasil.stats.likes}\n📅 *Tanggal Posting*: ${hasil.taken_at}`,
          contextInfo: {
            externalAdReply: {
              title: 'TikTok • ' + hasil.author.nickname,
              body: hasil.stats.likes + ' suka, ' + hasil.stats.comment + ' komentar. ' + hasil.title,
              previewType: 'PHOTO',
              thumbnailUrl: hasil.cover,
              mediaType: 1,
              renderLargerThumbnail: true,
              sourceUrl: urlToDownload
            }
          }
        }, { quoted: m });
       
      }
      if (hasil.music_info && hasil.music_info.url) {
        await naze.sendMessage(m.chat, {
          audio: { url: hasil.music_info.url },
          mimetype: 'audio/mpeg',
          fileName: `${hasil.music_info.title || 'tiktok_audio'}.mp3`,
          contextInfo: {
            externalAdReply: {
              title: 'TikTok • ' + hasil.author.nickname,
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
              title: 'TikTok • ' + hasil.author.nickname,
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
       
        await m.reply('Gagal mengunduh audio!');
      }
        } catch (e) {
      console.error('[TIKTOK RUN] Error:', e.message);
     
      if (e.message.includes('Url parsing is failed') ||
          e.message.includes('tidak valid') ||
          e.message.includes('tidak didukung') ||
          e.message.includes('Pastikan link adalah video TikTok')) {
       
       
        return m.reply(e.message);
      }
      
      if (e.name === 'AbortError' || e.message.includes('timeout')) {
        return m.reply('Gagal mengambil data: Permintaan melebihi waktu (20 detik). Coba lagi atau linknya bermasalah.');
      }
      if (e.code === 'ETIMEDOUT' || e.code === 'ENETUNREACH') {
        return m.reply('Gagal mengunduh: Masalah koneksi jaringan. Coba lagi nanti.');
      }
      
      await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
      await m.reply(`Gagal mengambil data: ${e.message}`);
      await global.sendMessageWithThumbnail(naze, m.chat, 'error', m);
    }
  }
};