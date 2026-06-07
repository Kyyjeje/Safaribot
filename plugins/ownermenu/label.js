require('../../settings');

module.exports = {
    name: 'label',
    alias: ['setlabel', 'glabel'],
    description: '<jid grup>,<teks> atau <teks> (untuk grup ini)',
    run: async ({ naze, m, text }) => {
        const botNumber = await naze.decodeJid(naze.user.id);
            const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);

            if (!isOwner) {
                
                return global.sendMessageWithThumbnail(naze, m.chat, 'owner', m);
            }

        if (!text) {
            return m.reply(`*Format Salah!*\n\nCara pakai:\n• \`${m.prefix}label <teks>\` → ubah label grup ini\n• \`${m.prefix}label <jid grup>,<teks>\` → ubah label grup lain (owner only)\n\nContoh:\n• ${m.prefix}label Grup Keluarga\n• ${m.prefix}label 120363123456789@g.us,Grup Bisnis`);
        }

        let targetChat = m.chat; // default: grup saat ini
        let labelText = text.trim();

        // Deteksi kalau ada koma → artinya ada jid grup
        if (text.includes(',')) {
            if (!isOwner) {
                return m.reply('Hanya owner yang bisa mengubah label grup lain.');
            }

            const parts = text.split(',');
            if (parts.length < 2) {
                return m.reply('Format salah. Gunakan: <jid grup>,<teks>');
            }

            const jidInput = parts[0].trim();
            labelText = parts.slice(1).join(',').trim();

            if (!jidInput.endsWith('@g.us')) {
                return m.reply('JID grup tidak valid. Harus berakhiran @g.us');
            }

            // Validasi grup ada & bot masih di dalamnya
            try {
                await naze.groupMetadata(jidInput);
                targetChat = jidInput;
            } catch {
                return m.reply('Grup tidak ditemukan atau bot tidak ada di grup tersebut.');
            }
        }

        if (!labelText) {
            return m.reply('Teks label tidak boleh kosong.');
        }

        try {
            await naze.setBotLabel(targetChat, labelText);

            const groupName = targetChat === m.chat 
                ? 'grup ini' 
                : await naze.groupMetadata(targetChat).then(g => g.subject).catch(() => 'Grup');

            await m.reply(`✅ Label berhasil diubah!\n\nGrup: *${groupName}*\nLabel baru: *${labelText}*`);
        } catch (err) {
            
            await m.reply('Gagal mengubah label grup. Pastikan bot adalah admin dan fitur ini didukung.');
            await global.sendMessageWithThumbnail(naze, m.chat, 'eror', m);
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};