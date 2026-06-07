require('../../settings');

function extractText(m) {
    if (!m || !m.message) return '';
    if (m.type === 'conversation') return m.message.conversation || '';
    if (m.type === 'imageMessage') return m.message.imageMessage?.caption || '';
    if (m.type === 'videoMessage') return m.message.videoMessage?.caption || '';
    if (m.type === 'extendedTextMessage') return m.message.extendedTextMessage?.text || '';
    if (m.type === 'buttonsResponseMessage') return m.message.buttonsResponseMessage?.selectedButtonId || '';
    if (m.type === 'listResponseMessage') return m.message.listResponseMessage?.singleSelectReply?.selectedRowId || '';
    if (m.type === 'templateButtonReplyMessage') return m.message.templateButtonReplyMessage?.selectedId || '';
    if (m.type === 'interactiveResponseMessage') {
        const params = m.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
        return params ? JSON.parse(params).id || '' : '';
    }
    if (m.type === 'editedMessage') {
        const edited = m.message.editedMessage?.message?.protocolMessage?.editedMessage;
        return edited?.extendedTextMessage?.text || edited?.conversation || '';
    }
    return m.text || '';
}

module.exports = {
    name: 'kelompokacak',
    alias: ['acakkelompok'],
    run: async ({ naze, m }) => {
        try {
            

            if (!m.isGroup) {
                
                return naze.sendMessage(m.chat, { text: `Perintah hanya untuk grup!` }, { quoted: m });
            }

            const args = extractText(m).trim().split(/ +/).slice(1);
            if (args.length === 0) {
                
                return naze.sendMessage(m.chat, { text: `Masukkan jumlah anggota per kelompok!\nContoh: ${m.prefix}${m.command} 5` }, { quoted: m });
            }

            const jumlahPerKelompok = parseInt(args[0]);
            if (isNaN(jumlahPerKelompok) || jumlahPerKelompok < 1) {
                
                return naze.sendMessage(m.chat, { text: `Masukkan jumlah anggota per kelompok yang benar!\nContoh: ${m.prefix}${m.command} 5` }, { quoted: m });
            }

            const participants = m.metadata.participants.map(a => a.id);
            const totalUser = participants.length;
            if (jumlahPerKelompok >= totalUser) {
                
                return naze.sendMessage(m.chat, { text: `Jumlah per kelompok terlalu besar!\nContoh: ${m.prefix}${m.command} 5` }, { quoted: m });
            }

            const shuffled = participants.sort(() => Math.random() - 0.5);
            let hasilKelompok = [];
            for (let i = 0; i < totalUser; i += jumlahPerKelompok) {
                hasilKelompok.push(shuffled.slice(i, i + jumlahPerKelompok));
            }

            if (hasilKelompok.length > 1 && hasilKelompok[hasilKelompok.length - 1].length < jumlahPerKelompok) {
                const sisa = hasilKelompok.pop();
                hasilKelompok[hasilKelompok.length - 1] = hasilKelompok[hasilKelompok.length - 1].concat(sisa);
            }

            let output = `📌 *Hasil Pembagian Kelompok*\n\n`;
            hasilKelompok.forEach((kelompok, index) => {
                output += `*Kelompok ${index + 1}:*\n`;
                kelompok.forEach(user => {
                    output += `➤ @${user.split('@')[0]}\n`;
                });
                output += '\n';
            });

            const mentionedUsers = hasilKelompok.flat();
            
            await naze.sendMessage(m.chat, { text: output, mentions: mentionedUsers }, { quoted: m });
        } catch (err) {
            console.error(`Gagal memproses kelompokacak: ${err.message}`);
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};