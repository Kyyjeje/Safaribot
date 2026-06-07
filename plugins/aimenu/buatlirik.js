const axios = require('axios');

module.exports = {
    name: 'generatelirik',
    alias: ['createlirik', 'buatlirik', 'lyricgenerator'],
    description: '<judul lagu>',
    run: async ({ naze, m, text }) => {
        if (!text) {
            return m.reply(`Harap masukkan judul lagu.\n\nContoh:\n\`${m.prefix}${m.command} Cinta Abadi\``);
        }

        // Mulai tampilkan status "sedang mengetik"
        await naze.sendPresenceUpdate('composing', m.chat);

        try {
            const apiKey = global.key_gemini?.[0];
            if (!apiKey) return m.reply('API Key Gemini tidak ditemukan!');

            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    contents: [{
                        parts: [{
                            text: `Buatkan saya lirik lagu berjudul "${text}". 
Berikan hanya judul lagu dan liriknya saja, tanpa kata pengantar, penutup, atau penjelasan apapun. 
Format rapi dengan enter yang jelas agar mudah dibaca.`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1024
                    }
                },
                { timeout: 60000 }
            );

            const candidates = response.data.candidates;
            if (!candidates || !candidates[0]?.content?.parts?.[0]?.text) {
                return m.reply('Gemini tidak memberikan hasil lirik. Coba lagi dengan judul lain ya!');
            }

            let lirik = candidates[0].content.parts[0].text.trim();

            // Bersihkan format Gemini yang suka pakai **
            lirik = lirik
                .replace(/\*\*(.*?)\*\*/g, '*$1*')   // **Judul** → *Judul*
                .replace(/\*\*(.*?)\*\*/g, '*$1*');  // dobel biar aman

            // Kirim hasil dengan reply
            await naze.sendMessage(m.chat, {
                text: lirik
            }, { quoted: m });

        } catch (err) {
            console.error('GenerateLirik Error:', err.message);
            let pesanError = 'Gagal membuat lirik lagu';

            if (err.response?.data?.error?.message) {
                pesanError += `\n\`${err.response.data.error.message}\``;
            } else if (err.message.includes('429')) {
                pesanError += '\nKuota Gemini habis, coba lagi besok ya!';
            }

            await m.reply(pesanError);
        } finally {
            // Pastikan status typing mati walau error sekalipun
            naze.sendPresenceUpdate('available', m.chat);
        }
    }
};