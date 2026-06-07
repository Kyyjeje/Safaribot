const fetch = require('node-fetch');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const util = require('util');

const isUrl = (str) => {
  const regex = /^(https?:\/\/[^\s]+)/;
  return regex.exec(str)?.[0] || null;
};

const shortenUrl = async (url) => {
  try {
    const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, { timeout: 10000 });
    return response.data;
  } catch {
    return url;
  }
};

const shortenUrlsInJson = async (obj) => {
  const result = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === 'string' && isUrl(value)) {
        result[key] = await shortenUrl(value);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = await shortenUrlsInJson(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
};

const verifyUrl = async (url, referer = 'https://www.tiktok.com') => {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Node.js)',
        'Referer': referer
      }
    });
    if (response.status === 200) return true;

    const getResponse = await fetch(url, {
      method: 'GET',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Node.js)',
        'Referer': referer
      }
    });
    return getResponse.status === 200;
  } catch {
    return false;
  }
};

const fetchWithApiKey = async (apiUrl, apiKey, cleanUrl) => {
  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'zm-api.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: cleanUrl })
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch(apiUrl, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
};

module.exports = {
  name: "download",
  alias: ["download", "dl", ".download", "keterangan|downloader", "keterangan|download", "cc", "capcut", "fbdl", "facebook", "fb", "twitter", "twdl", "twitterdl"],
  description: '<URL all Sosmed>',
  run: async ({ naze, m, text }) => {
    

    const supportedPlatforms = [
      "9GAG", "Bandcamp", "Bilibili", "BitChute", "Bluesky", "CapCut", "Dailymotion", "Douyin",
      "ESPN", "FebSpot", "GetStickerPack", "Hipi", "IMDb", "Imgur", "iFunny", "Izlesene",
      "Kuaishou", "Likee", "LinkedIn", "Meipai", "Miaopai", "MixCloud", "National Video",
      "OK.ru", "Pinterest", "PornBox", "Reddit", "Rumble", "ShareChat", "Sina", "Snapchat",
      "SohuTV", "SoundCloud", "Spotify", "Streamable", "TED", "Telegram", "Threads", "TikTok",
      "Tumblr", "Twitter", "Vimeo", "Weibo", "XNXX", "XVideos", "Xiaohongshu", "Xiaoying",
      "Yingke", "ZingMP3"
    ];

    const keterangan = `*Fitur Downloader* 📥\n\n` +
                      `*Fungsi* 📊:\nMengunduh media (video, gambar, audio) dari berbagai platform sosial media dengan kualitas terbaik (HD atau tanpa watermark jika tersedia).\n\n` +
                      `*Platform yang Didukung* 🌐:\n - ${supportedPlatforms.join("\n- ")}\n\n` +
                      `*Prioritas Kualitas* ⭐:\n- Video: HD No Watermark, HD, No Watermark, atau Watermark\n- Gambar: Kualitas terbaik yang tersedia\n- Audio: Format asli (biasanya MP3)\n\n` +
                      `*Manfaat* 🚀:\nMengunduh konten sosial media dengan cepat dan mudah.\n\n` +
                      `*Cara Penggunaan* 🛠️:\n- Untuk mengunduh: \n\`${m.prefix}${m.command} <URL>\`\n\n- Untuk info: \n\`${m.prefix}keterangan downloader\`\n\n` +
                      `*Alias* 🔁:\n\`download\`, \`dl\`, \`.download\`\n\n` +
                      `*Catatan* ⚠️:\n- Fitur ini mengutamakan kualitas terbaik yang tersedia.`;

    if (m.text?.toLowerCase().startsWith('keterangan|')) {
      const cmd = m.text.split('|')[1].toLowerCase();
      if (cmd === 'downloader' || cmd === 'download') {
        await naze.sendMessage(m.chat, { text: keterangan }, { quoted: m });
        
        return;
      }
    }

    const urlMatch = isUrl(text.split(' ')[0]);
    if (!urlMatch) {
      
      return m.reply(`Masukkan URL media sosial yang valid!\nFitur ini bisa mengunduh berbagai macam Sosial Media.\nGunakan \`${m.prefix}keterangan downloader\` untuk melihat daftar platform yang didukung.`);
    }
    await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
    const cleanUrl = urlMatch;
    try {
      

      const apiUrl = `https://zm-api.p.rapidapi.com/v1/social/autolink`;
      let data;

      try {
        data = await fetchWithApiKey(apiUrl, global.rapid_api[0], cleanUrl);
      } catch (e) {
        try {
          data = await fetchWithApiKey(apiUrl, global.rapid_api[1], cleanUrl);
        } catch (e) {
          
          if (e.name === 'AbortError' || e.message.includes('timeout')) {
            return m.reply('Gagal mengambil data: Permintaan melebihi 20 detik. Silakan coba lagi.');
          } else if (e.code === 'ETIMEDOUT' || e.code === 'ENETUNREACH') {
            return m.reply('Gagal mengunduh media: Masalah koneksi jaringan.');
          }
          throw new Error(`Gagal mengambil data: ${e.message}`);
        }
      }

      if (data.error) {
        
        return m.reply(`Gagal mengambil konten: ${data.message || "Unknown error"}`);
      }

      const medias = data.medias || [];
      const additionalInfo = `Username: ${data.unique_id || 'Unknown'}\nAuthor: ${data.author || 'Unknown'}\nTitle/Caption: ${data.title || 'No caption'}`;
      const refererMap = {
        'tiktok': 'https://www.tiktok.com',
        'douyin': 'https://www.douyin.com',
        'capcut': 'https://www.capcut.com',
        'instagram': 'https://www.instagram.com',
        'youtube': 'https://www.youtube.com',
        'twitter': 'https://www.twitter.com',
        'threads': 'https://www.threads.net',
        'kuaishou': 'https://www.kuaishou.com',
        'espn': 'https://www.espn.com',
        'pinterest': 'https://www.pinterest.com',
        'imdb': 'https://www.imdb.com',
        'imgur': 'https://www.imgur.com',
        'ifunny': 'https://www.ifunny.co',
        'izlesene': 'https://www.izlesene.com',
        'reddit': 'https://www.reddit.com',
        'vimeo': 'https://www.vimeo.com',
        'snapchat': 'https://www.snapchat.com',
        'bilibili': 'https://www.bilibili.com',
        'dailymotion': 'https://www.dailymotion.com',
        'sharechat': 'https://www.sharechat.com',
        'likee': 'https://www.likee.com',
        'linkedin': 'https://www.linkedin.com',
        'tumblr': 'https://www.tumblr.com',
        'hipi': 'https://www.hipi.co.in',
        'telegram': 'https://www.telegram.org',
        'getstickerpack': 'https://www.getstickerpack.com',
        'bitchute': 'https://www.bitchute.com',
        'febspot': 'https://www.febspot.com',
        '9gag': 'https://www.9gag.com',
        'ok.ru': 'https://www.ok.ru',
        'rumble': 'https://www.rumble.com',
        'streamable': 'https://www.streamable.com',
        'ted': 'https://www.ted.com',
        'sohutv': 'https://tv.sohu.com',
        'pornbox': 'https://www.pornbox.com',
        'xvideos': 'https://www.xvideos.com',
        'xnxx': 'https://www.xnxx.com',
        'xiaohongshu': 'https://www.xiaohongshu.com',
        'ixigua': 'https://www.ixigua.com',
        'weibo': 'https://www.weibo.com',
        'miaopai': 'https://www.miaopai.com',
        'meipai': 'https://www.meipai.com',
        'xiaoying': 'https://www.xiaoying.tv',
        'nationalvideo': 'https://www.nationalvideo.com',
        'yingke': 'https://www.yingke.com',
        'sina': 'https://www.sina.com.cn',
        'bluesky': 'https://www.bluesky.app',
        'soundcloud': 'https://www.soundcloud.com',
        'mixcloud': 'https://www.mixcloud.com',
        'spotify': 'https://www.spotify.com',
        'zingmp3': 'https://www.zingmp3.vn',
        'bandcamp': 'https://www.bandcamp.com'
      };
      const referer = refererMap[data.source.toLowerCase()] || 'https://www.tiktok.com';

      let selectedMedia = medias.find(media => media.quality === "hd_no_watermark") ||
                         medias.find(media => media.quality === "HD No Watermark") ||
                         medias.find(media => media.quality === "HD") ||
                         medias.find(media => media.quality === "no_watermark") ||
                         medias.find(media => media.quality === "No Watermark") ||
                         medias.find(media => media.quality === "watermark");

      if (!selectedMedia && medias.length > 0) {
        const firstVideo = medias.find(media => media.type === 'video');
        if (firstVideo) {
          selectedMedia = firstVideo;
        }
      }

      if (selectedMedia) {
        const { url, type, quality } = selectedMedia;
        if (type === 'video') {
          if (await verifyUrl(url, referer)) {
            let caption = `Video dari postingan (${quality || 'default'})\nSource: ${data.source}`;
            caption += `\n\n${additionalInfo}`;
            await naze.sendMessage(m.chat, {
              video: { url },
              mimetype: 'video/mp4',
              caption
            }, { quoted: m });
            
          } else {
            
            await m.reply(`Gagal mengunduh video (${quality || 'default'}): URL tidak dapat diakses atau kadaluarsa.`);
          }
        } else if (type === 'other') {
          
          await m.reply(`Media dengan tipe "other" tidak didukung untuk dikirim: ${url}`);
        }
      }

      const images = medias.filter(media => media.type === 'image');
      if (images.length > 0) {
        if (images.length === 1) {
          const img = images[0];
          if (!await verifyUrl(img.url, referer)) {
            
            await m.reply("Gagal mengunduh gambar: URL tidak dapat diakses atau kadaluarsa.");
          } else {
            let caption = `Foto dari postingan\nSource: ${data.source}`;
            caption += `\n\n${additionalInfo}`;
            await naze.sendMessage(m.chat, {
              image: { url: img.url },
              caption
            }, { quoted: m });
            
          }
        } else {
          const validImages = [];
          for (let i = 0; i < Math.min(images.length, 30); i++) {
            const img = images[i];
            if (await verifyUrl(img.url, referer)) {
              validImages.push(img);
            } else {
              
              await m.reply(`Gagal mengunduh gambar ${i + 1} (${img.url}): URL tidak dapat diakses atau kadaluarsa.`);
            }
          }

          if (validImages.length > 0) {
            const carouselCards = await Promise.all(validImages.map(async (img, index) => {
              const shortened = await shortenUrl(img.url);
              return {
                url: img.url,
                body: `📸 Foto ${index + 1} dari ${validImages.length}`,
                footer: `Powered by ${data.source} API`,
                buttons: [
                  { name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "🌐 Kunjungi URL", url: cleanUrl }) },
                  { name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "🔗 Salin URL Gambar", url: shortened }) }
                ]
              };
            }));

            if (typeof naze.sendCarouselMsg === 'function') {
              try {
                let carouselCaption = `Hasil ${data.source} (Multiple Images)\nSource: ${data.source}`;
                carouselCaption += `\n\n${additionalInfo}`;
                await naze.sendCarouselMsg(
                  m.chat,
                  carouselCaption,
                  "Geser untuk melihat gambar lainnya",
                  carouselCards,
                  null,
                  { quoted: m }
                );
                
              } catch {
                
                await m.reply("Gagal mengirim carousel, mengirim gambar satu per satu.");
                for (let i = 0; i < validImages.length; i++) {
                  let caption = `Foto ${i + 1} dari ${validImages.length}\nSource: ${data.source}`;
                  caption += `\n\n${additionalInfo}`;
                  await naze.sendMessage(m.chat, {
                    image: { url: validImages[i].url },
                    caption
                  }, { quoted: m });
                  
                }
              }
            } else {
              
              await m.reply("Fitur carousel tidak tersedia di bot kamu. Gambar dikirim satu per satu.");
              for (let i = 0; i < validImages.length; i++) {
                let caption = `Foto ${i + 1} dari ${validImages.length}\nSource: ${data.source}`;
                caption += `\n\n${additionalInfo}`;
                await naze.sendMessage(m.chat, {
                  image: { url: validImages[i].url },
                  caption
                }, { quoted: m });
                
              }
            }
          } else {
            
            await m.reply("Tidak ada gambar valid untuk dikirim.");
          }
        }
      }

      const audioMedia = medias.find(media => media.type === 'audio');
      if (audioMedia) {
        if (await verifyUrl(audioMedia.url, referer)) {
          let caption = `Audio dari postingan (${audioMedia.quality || 'audio'})\nSource: ${data.source}`;
          caption += `\n\n${additionalInfo}`;
          await naze.sendMessage(m.chat, {
            audio: { url: audioMedia.url },
            mimetype: 'audio/mpeg',
            caption
          }, { quoted: m });
          
        } else {
          
          await m.reply(`Gagal mengunduh audio: URL tidak dapat diakses atau kadaluarsa.`);
        }
      }

      const otherMedia = medias.filter(media => media.type === 'other');
      if (otherMedia.length > 0 && !selectedMedia && images.length === 0 && !audioMedia) {
        let message = "Media berikut tidak didukung untuk dikirim langsung:\n";
        otherMedia.forEach((media, index) => {
          message += `- Media ${index + 1}: ${media.url} (Quality: ${media.quality})\n`;
        });
        
        await m.reply(message);
      }

      if (medias.length === 0) {
        
        await m.reply(`Tidak ditemukan media yang valid di URL ini.`);
      }
    } catch (e) {
      
      if (e.name === 'AbortError' || e.message.includes('timeout')) {
        await m.reply('Gagal mengambil data: Permintaan melebihi 20 detik. Silakan coba lagi.');
      } else if (e.code === 'ETIMEDOUT' || e.code === 'ENETUNREACH') {
        await m.reply('Gagal mengunduh media: Masalah koneksi jaringan.');
      } else {
        await global.handleError(naze, m, e, { sendRawError: false, useGemini: true });
        await m.reply(`Gagal mengambil data: ${e.message}`);
      }
      await global.sendMessageWithThumbnail(naze, m.chat, 'error', m);
    }
  }
};