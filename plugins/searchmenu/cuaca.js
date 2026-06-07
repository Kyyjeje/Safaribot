require('../../settings');
const axios = require('axios');

module.exports = {
    name: 'cuaca',
    alias: ['weather'],
    description: '<daerah>',
    run: async ({ naze, m, args, text }) => {
        try {
            
          
            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Silakan masukkan nama kota yang ingin Anda cek cuacanya.\nContoh: ${m.prefix}${m.command} Jakarta` }, { quoted: m });
            }
await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            let wdata = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(text)}&units=metric&appid=060a6bcfa19809c2cd4d97a212b19273&lang=id`);
            let data = wdata.data;

            const cuacaUtama = data.weather[0].main;
            const deskripsiCuaca = data.weather[0].description;
            const suhu = data.main.temp;
            const suhuMin = data.main.temp_min;
            const suhuMax = data.main.temp_max;
            const terasaSeperti = data.main.feels_like;
            const tekananUdara = data.main.pressure;
            const tekananLaut = data.main.sea_level || 'N/A';
            const tekananTanah = data.main.grnd_level || 'N/A';
            const kelembaban = data.main.humidity;
            const kecepatanAngin = data.wind.speed;
            const arahAngin = data.wind.deg;
            const jarakPandang = data.visibility / 1000;
            const tutupanAwan = data.clouds.all;
            const volumeHujan = (data.rain && data.rain['1h']) || 0;
            const lintang = data.coord.lat;
            const bujur = data.coord.lon;
            const negara = data.sys.country;
            const zonaWaktu = data.timezone;
            const waktuLocal = new Date().getTimezoneOffset() * 60;
            const offset = zonaWaktu - waktuLocal;
            const sunrise = new Date((data.sys.sunrise + offset) * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
            const sunset = new Date((data.sys.sunset + offset) * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

            let textw = `*Informasi Cuaca untuk Kota ${text.charAt(0).toUpperCase() + text.slice(1)}*\n\n` +
                        `🌤️ *Cuaca Utama*: ${cuacaUtama}\n` +
                        `📖 *Deskripsi*: ${deskripsiCuaca}\n` +
                        `🌡️ *Suhu Rata-rata*: ${suhu} °C\n` +
                        `🔻 *Suhu Minimum*: ${suhuMin} °C\n` +
                        `🔺 *Suhu Maksimum*: ${suhuMax} °C\n` +
                        `🔥 *Terasa Seperti*: ${terasaSeperti} °C\n` +
                        `🌬️ *Kecepatan Angin*: ${kecepatanAngin} m/s\n` +
                        `🧭 *Arah Angin*: ${arahAngin}°\n` +
                        `💧 *Kelembaban*: ${kelembaban}%\n` +
                        `🎈 *Tekanan Udara*: ${tekananUdara} hPa\n` +
                        `🌊 *Tekanan Air Laut*: ${tekananLaut} hPa\n` +
                        `🌍 *Tekanan Tanah*: ${tekananTanah} hPa\n` +
                        `🌫️ *Jarak Pandang*: ${jarakPandang} km\n` +
                        `☁️ *Tutup Awan*: ${tutupanAwan}%\n` +
                        `🌧️ *Volume Hujan*: ${volumeHujan} mm/h\n\n` +
                        `📍 *Koordinat*:\n` +
                        `   - Lintang: ${lintang}\n` +
                        `   - Bujur: ${bujur}\n\n` +
                        `🌅 *Matahari Terbit*: ${sunrise}\n` +
                        `🌇 *Matahari Terbenam*: ${sunset}\n\n` +
                        `🏳️ *Negara*: ${negara}\n`;

            await naze.sendMessage(m.chat, { text: textw }, { quoted: m });
            
        } catch (e) {
            console.error(`Fatal error di cuaca: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};