require('../../settings');
const axios = require('axios');

module.exports = {
    name: 'negarainfo',
    alias: ['infonegara', 'infocountry', 'countryinfo'],
    description: '<negara>',
    run: async ({ naze, m, args, text }) => {
        try {
            
            

            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Masukkan nama negara yang ingin dicari informasinya!\nContoh: ${m.prefix}${m.command} Indonesia` }, { quoted: m });
            }
            await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            let response = await axios.get(`https://api.siputzx.my.id/api/tools/countryInfo?name=${encodeURIComponent(text)}`);
            let res = response.data;

            if (!res.status || !res.data) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Negara tidak ditemukan atau terjadi kesalahan dalam mengambil data.` }, { quoted: m });
            }

            let negara = res.data;
            let luasKm = negara.area?.squareKilometers ? negara.area.squareKilometers.toLocaleString() + ' km²' : 'Tidak tersedia';
            let luasMil = negara.area?.squareMiles ? negara.area.squareMiles.toLocaleString() + ' mil²' : 'Tidak tersedia';
            let flagUrl = negara.flag ? negara.flag.replace(/\.webp$/, '') : null;

            let pesan = `🌍 *Informasi Negara: ${negara.name}*\n\n` +
                        `🏛 *Ibukota*: ${negara.capital || 'Tidak tersedia'}\n` +
                        `📍 *Koordinat*: ${negara.coordinates?.latitude}, ${negara.coordinates?.longitude}\n` +
                        `🗺 *Benua*: ${negara.continent?.name} ${negara.continent?.emoji}\n` +
                        `📞 *Kode Telepon*: ${negara.phoneCode || 'Tidak tersedia'}\n` +
                        `💰 *Mata Uang*: ${negara.currency || 'Tidak tersedia'}\n` +
                        `🚗 *Arah Mengemudi*: ${negara.drivingSide ? 'Sebelah ' + negara.drivingSide : 'Tidak tersedia'}\n` +
                        `🌎 *Domain Internet*: ${negara.internetTLD || 'Tidak tersedia'}\n` +
                        `📏 *Luas Wilayah*: ${luasKm} (${luasMil})\n` +
                        `🏛 *Bentuk Pemerintahan*: ${negara.constitutionalForm || 'Tidak tersedia'}\n` +
                        `🍷 *Larangan Alkohol*: ${negara.alcoholProhibition || 'Tidak tersedia'}\n` +
                        `🏝 *Terkenal Karena*: ${negara.famousFor || 'Tidak tersedia'}\n\n` +
                        `📌 *Cek di Google Maps*: \n${negara.googleMapsLink}\n`;

            await naze.sendMessage(m.chat, {
                text: pesan,
                contextInfo: {
                    externalAdReply: {
                        title: `Informasi Negara: ${negara.name}`,
                        thumbnailUrl: flagUrl,
                        mediaType: 1,
                        previewType: 0,
                        renderLargerThumbnail: true,
                        mediaUrl: negara.googleMapsLink,
                        sourceUrl: negara.googleMapsLink
                    }
                }
            }, { quoted: m });
            
        } catch (e) {
            console.error(`Fatal error di negarainfo: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};