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

const verifyUrl = async (url, referer = 'https://www.instagram.com') => {
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

const fetchWithApiKey = async (apiUrl, apiKey, cleanUrl, cookie = null) => {
  const options = {
    method: 'POST',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'zm-api.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: cleanUrl,
      ...(cookie && { cookie })
    })
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
  name: "igdownload",
  alias: ["igdownload", "igdl", "instagram", "ig", "keterangan|instagram"],
  description: '<URL Instagram>',
  run: async ({ naze, m, text }) => {
   

    const keterangan = `*Fitur Instagram Downloader* 📥\n\n` +
                      `*Fungsi* 📊:\nMengunduh media (video, gambar, audio) dari Instagram dengan kualitas terbaik (HD atau tanpa watermark jika tersedia).\n\n` +
                      `*Prioritas Kualitas* ⭐:\n- Video: HD No Watermark, HD, No Watermark, atau Watermark\n- Gambar: Kualitas terbaik yang tersedia\n- Audio: Format asli (biasanya MP3)\n\n` +
                      `*Manfaat* 🚀:\nMengunduh konten Instagram dengan cepat dan mudah.\n\n` +
                      `*Cara Penggunaan* 🛠️:\n- Untuk mengunduh: \n\`${m.prefix}${m.command} <URL> [cookie]\`\n\n- Untuk info: \n\`${m.prefix}keterangan instagram\`\n\n` +
                      `*Alias* 🔁:\n\`igdownload\`, \`igdl\`, \`instagram\`, \`ig\`\n\n` +
                      `*Catatan* ⚠️:\n- Secara default, tidak ada cookie yang digunakan. Jika konten privat, masukkan cookie setelah URL.\n- Fitur ini mengutamakan kualitas terbaik yang tersedia.`;

    if (m.text?.toLowerCase().startsWith('keterangan|')) {
      const cmd = m.text.split('|')[1].toLowerCase();
      if (cmd === 'instagram') {
        await naze.sendMessage(m.chat, { text: keterangan }, { quoted: m });
        
        return;
      }
    }

    const parts = text.split(' ').filter(part => part.trim());
    const urlMatch = isUrl(parts[0]);
    let cookie = null;
    if (parts.length > 1) {
      cookie = parts.slice(1).join(' ').trim();
    }
    if (!urlMatch || !urlMatch.includes('instagram')) {
      
      return m.reply(`Masukkan URL Instagram yang valid!\nGunakan \`${m.prefix}keterangan instagram\` untuk melihat info lebih lanjut.`);
    }
await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);
    const cleanUrl = urlMatch;
    try {
      

      const apiUrl = `https://zm-api.p.rapidapi.com/v1/social/autolink`;
      let data;

      try {
        data = await fetchWithApiKey(apiUrl, global.rapid_api[0], cleanUrl, cookie);
      } catch (e) {
        try {
          data = await fetchWithApiKey(apiUrl, global.rapid_api[1], cleanUrl, cookie);
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
          if (await verifyUrl(url)) {
            let caption = `Video dari postingan (${quality || 'default'})\nSource: Instagram`;
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
          if (!await verifyUrl(img.url)) {
            
            await m.reply("Gagal mengunduh gambar: URL tidak dapat diakses atau kadaluarsa.");
          } else {
            let caption = `Foto dari postingan\nSource: Instagram`;
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
            if (await verifyUrl(img.url)) {
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
                footer: `Powered by Instagram API`,
                buttons: [
                  { name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "🌐 Kunjungi URL", url: cleanUrl }) },
                  { name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "🔗 Salin URL Gambar", url: shortened }) }
                ]
              };
            }));

            if (typeof naze.sendCarouselMsg === 'function') {
              try {
                let carouselCaption = `Hasil Instagram (Multiple Images)\nSource: Instagram`;
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
                  let caption = `Foto ${i + 1} dari ${validImages.length}\nSource: Instagram`;
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
                let caption = `Foto ${i + 1} dari ${validImages.length}\nSource: Instagram`;
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
        if (await verifyUrl(audioMedia.url)) {
          let caption = `Audio dari postingan (${audioMedia.quality || 'audio'})\nSource: Instagram`;
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