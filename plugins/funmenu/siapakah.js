module.exports = {
    name: "siapa",
    alias: ["siapakah"],
    run: async ({ naze, m, text, participants }) => {
        if (!m.isGroup) return naze.sendMessage(m.chat, { text: "❌ Fitur ini hanya bisa digunakan di grup." }, { quoted: m });
        
		let groupMetadata = await naze.groupMetadata(m.chat).catch(() => null);
        if (!groupMetadata) return m.reply("Gagal mengambil data grup.");

        let members = groupMetadata.participants.map(a => a.id);
        let orand_random = members[Math.floor(Math.random() * members.length)];

        let question = text ? text.trim() : "orang paling ganteng di grup";
        let questionWithMark = question.endsWith("?") ? question : `${question}?`;
        let answer = questionWithMark.replace(/\?$/, "").replace(/\baku\b/g, "kamu").replace(/ku\b/g, "mu");

        let message = `*⏳ Pertanyaan dari* @${m.sender.split("@")[0]}\n` +
                      `*❓ Pertanyaan :*\n\`siapa ${questionWithMark}\`\n\n` +
                      `*📌 Jawaban       :*\nDia @${orand_random.split("@")[0]} ${answer}`;

        naze.sendMessage(m.chat, { text: message, mentions: [m.sender, orand_random] }, { quoted: m });
    }
};
