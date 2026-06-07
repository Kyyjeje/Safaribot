const axios = require('axios');

module.exports = {
    name: 'comodityprice',
    run: async ({ naze, m, text, prefix, command }) => {
        try {
            
            const daftarKomoditas = [
                'gold', 'soybean_oil', 'wheat', 'platinum', 'micro_silver', 'lean_hogs',
                'corn', 'oat', 'aluminum', 'soybean_meal', 'silver', 'soybean',
                'lumber', 'live_cattle', 'sugar', 'natural_gas', 'crude_oil',
                'orange_juice', 'coffee', 'cotton', 'copper', 'micro_gold',
                'feeder_cattle', 'rough_rice', 'palladium', 'cocoa', 'brent_crude_oil',
                'gasoline_rbob', 'heating_oil', 'class_3_milk'
            ];
            if (!text) {
                let daftarTersedia = `📌 *List Komoditas yang Tersedia:*\n\n`;
                daftarKomoditas.forEach((item, index) => {
                    daftarTersedia += `🔹 ${index + 1}. ${item}\n`;
                });
                await naze.sendMessage(m.chat, { 
                    text: `Masukkan nama komoditas!\n\n${daftarTersedia}\nContoh: ${m.prefix}${m.command} gold`
                }, { quoted: m });
                
                return;
            }
            const namaKomoditas = text.trim().toLowerCase();
            if (!daftarKomoditas.includes(namaKomoditas)) {
                await naze.sendMessage(m.chat, { 
                    text: `Komoditas *${text}* tidak ditemukan!\nGunakan nama komoditas yang tersedia.\nContoh: ${m.prefix}${m.command} gold`
                }, { quoted: m });
                
                return;
            }
            const apiKey = 'A50K0DsP6NRbwd8Dsro7Yg==7rpgFFwtSv687zai';
            const response = await axios.get(`https://api.api-ninjas.com/v1/commodityprice?name=${encodeURIComponent(namaKomoditas)}`, {
                headers: { 'X-Api-Key': apiKey }
            });
            if (response.status !== 200 || !response.data) {
                throw new Error('Tidak ada informasi harga untuk komoditas tersebut.');
            }
            const data = response.data;
            const hasil = `📈 *Informasi Harga Komoditas*\n\n` +
                          `📌 *Nama Komoditas*: ${data.name || 'Tidak diketahui'}\n` +
                          `💰 *Harga Saat Ini*: $${data.price ? data.price.toLocaleString('id-ID') : 'Tidak diketahui'}\n` +
                          `🏛️ *Bursa*: ${data.exchange || 'Tidak diketahui'}\n` +
                          `🕒 *Terakhir Diperbarui*: ${data.updated ? new Date(data.updated * 1000).toLocaleString('id-ID') : 'Tidak diketahui'}`;
            await naze.sendMessage(m.chat, { text: hasil }, { quoted: m });
            
        } catch (e) {
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};