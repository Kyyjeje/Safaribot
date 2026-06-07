require('../../settings');

module.exports = {
    name: 'ayotebak',
    alias: ['ayotebak','cobatebak','tebakayo'],
    run: async ({ naze, m }) => {

        try {
            const tebakTebakan = [
                { muji: "\n Aku banyak duit nih, orang paling sultan se Indonesia", ngejek: "\n Aku lhoo bau jigong cok wkwk" },
                { muji: "\n Aku ganteng maksimal, mirip artis ibukota", ngejek: "\n Aku jelek, muka kayak tempe digoreng tiga hari" },
                { muji: "\n Aku jago main bola, dipanggil timnas nih", ngejek: "\n Aku lelet, lari aja kaya orang takut nyanyi" },
                { muji: "\n Aku wangi, orang takut deket saking wanginya", ngejek: "\n Aku bau banget, kayak abis nyemplung di comberan" },
                { muji: "\n Aku pinter, juara olimpiade tiap tahun", ngejek: "\n Aku bego, nulis nama aja salah mulu" },
                { muji: "\n Aku tajir, duitku ga habis tujuh turunan", ngejek: "\n Aku miskin, utangku numpuk, minta seratus ga ada yang kasih" },
                { muji: "\n Aku manis, orang bilang aku gula murni", ngejek: "\n Aku asem, orang bilang muka aku kecut abis" },
                { muji: "\n Aku imut, tiap ketemu orang bilang lucu", ngejek: "\n Aku serem, orang bilang muka aku kaya preman pasar" },
                { muji: "\n Aku pendiam, orang bilang aku cool", ngejek: "\n Aku berisik, mulutku ga bisa diem, orang takut deket" },
                { muji: "\n Aku jago masak, tiap masak orang bilang enak", ngejek: "\n Aku ga bisa masak, goreng telor aja ga mateng" },
                { muji: "\n Aku sopan, orang tua suka sama aku", ngejek: "\n Aku kasar, orang bilang ga punya sopan santun" },
                { muji: "\n Aku sabar, orang bilang hatiku luas", ngejek: "\n Aku ga sabaran, bentar-bentar marah, orang takut deket" },
                { muji: "\n Aku rajin, kerja cepet selesai tiap hari", ngejek: "\n Aku males, ga pernah kerja, tiap hari rebahan" },
                { muji: "\n Aku mulus, orang bilang kulitku kaya sutra", ngejek: "\n Aku dekil, orang bilang kulitku kaya abis mandi lumpur" },
                { muji: "\n Aku hebat, orang bilang aku inspirasi", ngejek: "\n Aku ga guna, orang bilang aku cuma beban" },
                { muji: "\n Aku jujur, orang bilang aku orang baik", ngejek: "\n Aku licik, orang bilang aku ga punya hati" },
                { muji: "\n Aku tenang, hidupku damai tiap hari", ngejek: "\n Aku kacau, hidupku berantakan, tiap hari ribut" },
                { muji: "\n Aku apik, wong Jowo bilang aku ganteng", ngejek: "\n Aku elek, wong Jowo bilang muka aku kaya karung" },
                { muji: "\n Aku ganteng, orang bilang muka aku cerah", ngejek: "\n Aku jelek, orang bilang muka aku kaya abis kebakar" },
                { muji: "\n Aku manis, orang ga bisa lupain aku", ngejek: "\n Aku ga guna, orang ga mau inget aku" }
            ];

            // Pilih pasangan secara acak
            const randomPair = tebakTebakan[Math.floor(Math.random() * tebakTebakan.length)];

            // Buat array teks untuk diacak
            const options = [randomPair.muji, randomPair.ngejek];

            // Acak array menggunakan Fisher-Yates shuffle
            for (let i = options.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [options[i], options[j]] = [options[j], options[i]];
            }

            // Buat tombol dengan teks acak
            const buttons = [
                { buttonId: 'button10', buttonText: { displayText: options[0] }, type: 1 },
                { buttonId: 'button11', buttonText: { displayText: options[1] }, type: 1 }
            ];

            // Teks utama
            const mainText = `Ayo coba tebak yaaah monyet, semoga beruntung!`;

            // Kirim pesan dengan tombol
            await naze.sendMessage(m.chat, {
                text: mainText,
                footer: "Tebak-Tebakan Receh!",
                buttons,
                headerType: 1,
                viewOnce: true
            }, { quoted: m });
        } catch (e) {
            console.error('Error di button:', e);
            await m.reply('Terjadi kesalahan saat menjalankan perintah: ' + e.message);
        }
    }
};