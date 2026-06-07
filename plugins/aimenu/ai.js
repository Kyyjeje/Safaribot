const axios = require('axios');

module.exports = {
    name: 'ai',
    alias: ['gpt', 'openai', 'gpt4'],
    description: '<pertanyaan>',
    run: async ({ naze, m, text }) => {
        if (!text) {
            return m.reply(`Hai, ada yang bisa dibantu?\n\nContoh:\n\`${m.prefix}${m.command} Jelaskan cara membuat bot WhatsApp\``);
        }

        // Mulai typing
        await naze.sendPresenceUpdate('composing', m.chat);

        try {
            console.log('Mengirim ke OpenAI...');
            const response = await axios.post("https://chateverywhere.app/api/chat/", {
                model: {
                    id: "gpt-4",
                    name: "GPT-4",
                    maxLength: 32000,
                    tokenLimit: 8000,
                },
                messages: [{ role: "user", content: text }],
                prompt: "jawab lah dengan bahasa yang natural dan humor manusia, jangan terlalu kaku dan jawab lah to the point, ga begitu basa basi, okeey. sertakan reaksi seperti manusia, bisa sedih bisa senang dan reaksi lain nya. boleh kok tambah beberapa emoji tapi ga spam. hanya seperlu nya aja, supaya menampilkan reaksi seperti nyata. pakai gaya bahasa seperti logat bahasa indonesia yaaa",
                temperature: 0.5
            }, {
                headers: {
                    "Accept": "*/*",
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36"
                },
                timeout: 60000
            });

            let result = response.data || '';
            if (typeof result === 'object') result = JSON.stringify(result);

            const cleanText = result
                .replace(/\*\*(.*?)\*\*/g, '*$1*')  // **teks** → *teks*
                .trim();

            await m.reply(cleanText || 'Tidak ada jawaban dari AI.');

        } catch (err) {
            console.error('OpenAI Error:', err.message);
            const msg = err.response?.data?.error || err.message || 'Terjadi kesalahan';
            await m.reply(`Gagal terhubung ke AI:\n\`${msg}\``);
        } finally {
            // Matikan typing
            naze.sendPresenceUpdate('available', m.chat);
        }
    }
};