require('../../settings');
const axios = require('axios');

module.exports = {
    name: 'cekhewan',
    alias: ['infohewan'],
    description: '<hewan>',
    run: async ({ naze, m, args, text }) => {
        try {
            

            if (!text) {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Masukkan nama hewan yang ingin dicari!\nContoh: ${m.prefix}${m.command} cheetah` }, { quoted: m });
            }

            let namaHewan = encodeURIComponent(text.trim());
            let iniapi = 'A50K0DsP6NRbwd8Dsro7Yg==7rpgFFwtSv687zai';
            let urlhewan = `https://api.api-ninjas.com/v1/animals?name=${namaHewan}`;
await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

            let response = await axios.get(urlhewan, { headers: { 'X-Api-Key': iniapi } });

            if (response.status === 200 && response.data.length > 0) {
                let data = response.data[0];
                let taxonomy = data.taxonomy;
                let characteristics = data.characteristics;
                let locations = data.locations ? data.locations.join(', ') : 'Tidak diketahui';

                let hasil = `🐾 *Informasi Tentang Hewan*\n\n` +
                            `📌 *Nama:* ${data.name || 'Tidak diketahui'}\n` +
                            `🔬 *Nama Ilmiah:* ${taxonomy.scientific_name || 'Tidak diketahui'}\n` +
                            `🌍 *Habitat:* ${characteristics.habitat || 'Tidak diketahui'}\n` +
                            `📍 *Wilayah Persebaran:* ${locations}\n` +
                            `🍽️ *Jenis Makanan:* ${characteristics.diet || 'Tidak diketahui'}\n` +
                            `💨 *Kecepatan Maksimal:* ${characteristics.top_speed ? `${characteristics.top_speed} (mph)` : 'Tidak diketahui'}\n` +
                            `🦴 *Jenis Kulit:* ${characteristics.skin_type || 'Tidak diketahui'}\n` +
                            `👶 *Nama Anak Hewan:* ${characteristics.name_of_young || 'Tidak diketahui'}\n` +
                            `👨‍👩‍👧‍👦 *Pola Sosial:* ${characteristics.group_behavior || 'Tidak diketahui'}\n` +
                            `⚠️ *Ancaman Utama:* ${characteristics.biggest_threat || 'Tidak diketahui'}\n` +
                            `🎯 *Fakta Menarik:* "${characteristics.slogan || 'Tidak ada informasi'}"\n\n` +
                            `📏 *Tinggi:* ${characteristics.height || 'Tidak diketahui'}\n` +
                            `⚖️ *Berat:* ${characteristics.weight || 'Tidak diketahui'}\n` +
                            `🍼 *Masa Menyusui:* ${characteristics.age_of_weaning || 'Tidak diketahui'}\n` +
                            `💑 *Usia Matang untuk Berkembang Biak:* ${characteristics.age_of_sexual_maturity || 'Tidak diketahui'}\n` +
                            `🐣 *Jumlah Anak Sekali Lahir:* ${characteristics.average_litter_size || 'Tidak diketahui'}\n` +
                            `⏳ *Masa Kehamilan:* ${characteristics.gestation_period || 'Tidak diketahui'}\n` +
                            `👴 *Usia Hidup Rata-rata:* ${characteristics.lifespan || 'Tidak diketahui'}\n` +
                            `🔢 *Jumlah Spesies:* ${characteristics.number_of_species || 'Tidak diketahui'}`;

                await naze.sendMessage(m.chat, { text: hasil }, { quoted: m });
                
            } else {
                
                return naze.sendMessage(m.chat, { text: `⚠️ Maaf, tidak ada informasi yang ditemukan untuk hewan tersebut.` }, { quoted: m });
            }
        } catch (e) {
            console.error(`Fatal error di cekhewan: ${e.message}\nStack: ${e.stack}`);
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};