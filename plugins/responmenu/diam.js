module.exports = {
    name: "diam",
    alias: ['dieem','diem'],
    run: async ({m}) => {
        let balasanDiam = [
            "😌 *Iya iya aku diam... tapi bentar doang ya 🥺*",
            "🤔 *Disuruh diam? Hmm... gue pikirin dulu deh*",
            "🤭 *Oke, gua diem... Tapi di dalam hati ngakak loh*",
            "📶 *Gua diem, tapi sinyal tetep jalan dong* 😎",
            "🤣 *Waduh... disuruh diam sama bot, lucu juga nih*",
            "🤐 *Baiklah... mode silent diaktifkan*",
            "🧘 *Tenang... gue udah kayak biksu nih, diem total*",
            "🎧 *Gue diem, tapi lagi dengerin curhatan tetangga*",
            "📵 *Diem sih diem, tapi jangan matiin wifi ya*",
            "📚 *Diem dulu... lagi baca hati kamu nih* 😳",
            "👻 *Gue udah kayak hantu, diem tapi tetap ada*",
            "💤 *Oke, gue tidur aja biar sekalian diem*",
            "🎭 *Diam? Oke, mode patung ON*",
            "🧊 *Sedingin es batu... gue diem...*",
            "🙊 *Ups, ga boleh ngomong... perintah raja*",
            "😴 *Diem sambil ngorok boleh kan?*",
            "💔 *Disuruh diam... padahal aku cuma sayang kamu...*",
            "🕵️ *Diem bukan berarti kalah, tapi lagi nyusun strategi*",
            "⛔ *Gue diem, tapi hati tetep berisik*",
            "🤖 *Bot diem dulu... tapi nanti comeback ya!*"
        ];
        m.reply(balasanDiam[Math.floor(Math.random() * balasanDiam.length)]);
    }
};
