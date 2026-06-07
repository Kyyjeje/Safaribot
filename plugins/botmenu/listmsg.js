const { globalSettings } = require('../../settings');
const { getContentType } = require('baileys');

module.exports = {
    name: 'listmsg',
    alias: ['listmessage'],
    run: async ({ naze, m }) => {
        try {
            

            const seplit = Object.entries(global.db.database).map(([nama, isi]) => {
                return { nama, message: getContentType(isi) };
            });

            if (seplit.length === 0) {
                
                return m.reply('Database pesan kosong.');
            }

            let teks = `${global.simbol.barisjudul} LIST DATABASE MESSAGE\n${global.simbol.tutupjudul}\n`;
            for (let i of seplit) {
                teks += `${global.simbol.barisfitur} *Name :* \`${i.nama}\`\n${global.simbol.barisfitur} *Type  :* ${i.message?.replace(/Message/i, '')}\n═══════════════\n`;
            }

            await m.reply(teks);
            
        } catch (err) {
            
            await global.handleError(naze, m, err, {
                sendRawError: true,
                useGemini: true
            });
        }
    }
};