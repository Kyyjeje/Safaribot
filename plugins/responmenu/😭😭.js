module.exports = {
    name: "😭😭",
    alias: ["😭"],
    run: async ({ m }) => {
        let balasanSedih = [
            "Duh duh, siapa yang nyakitin lu? Sini peluk dulu 🤗",
            "Ututuu agi cediih >< jangan nangis dong 😭",
            "Halah nangis doang, elahhh lemah banget 😏",
            "Lu nangis karena utang apa mantan? 🤔",
            "Udah nangis? Sekarang bayarin gua kopi ☕",
            "Eh eh kenapa sih nangis? Jangan galau gitu napa 😢",
            "Air mata itu berharga, jangan buang-buang 😌",
            "Jangan nangis, nanti mata lu bengkak kayak bakpao 🥹",
            "Sedih terus ntar jadi tua lho 😔",
            "Kalau capek, istirahat. Kalau sedih, sini cerita 😢",
            "Coba deh senyum dikit, siapa tau dunia ikut tersenyum 😁",
            "Lu nangis karena nggak dikasih skin ML ya? 😭",
            "Sakit hati tuh emang gak enak, tapi sabar yaa 🥺",
            "Jangan baper mulu napa, ngopi napa dulu ☕",
            "Gua di sini kok, lu gak sendirian 😇",
            "Tenang, semua akan indah pada waktunya 🕊️",
            "Lagi sedih? Coba buka Tiktok, mungkin ketawa 😅",
            "Yaudah yaudah, gua maafin... padahal gua gak salah 😌",
            "Kalau nangis bisa balikin masa lalu, gua udah banjir 😭",
            "Nangisnya pelan-pelan, jangan sampe tetangga denger 😆",
            "Sabar ya, habis badai pasti ada pelangi 🌈",
            "Kalau nangis bisa dapet duit, gua udah kaya sekarang 🤑"
        ];
        m.reply(balasanSedih[Math.floor(Math.random() * balasanSedih.length)]);
    }
};
