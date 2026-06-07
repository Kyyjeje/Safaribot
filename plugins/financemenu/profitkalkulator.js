require('../../settings');

module.exports = {
    name: 'profitkalkulator',
    alias: ['kalkulatorprofit','targetprofit','profittarget'],
    run: async ({ naze, m, text }) => {
        try {
            
            if (!text) {
                await naze.sendMessage(m.chat, { 
                    text: `Format: ${m.prefix}${m.command} <jumlah modal> <persentase keuntungan>\nContoh: ${m.prefix}${m.command} 200000 5`
                }, { quoted: m });
                
                return;
            }
            const args = text.replace(/\./g, '').replace(/,/g, '').split(' ');
            if (args.length !== 2 || isNaN(args[0]) || isNaN(args[1])) {
                await naze.sendMessage(m.chat, { 
                    text: `Format: ${m.prefix}${m.command} <jumlah modal> <persentase keuntungan>\nContoh: ${m.prefix}${m.command} 200000 5`
                }, { quoted: m });
                
                return;
            }
            let modalAwal = parseFloat(args[0]);
            const persenKeuntungan = parseFloat(args[1]);
            let hasil = `💰 *Perhitungan Keuntungan:*\n\n` +
                        `📌 *Modal awal*: Rp ${modalAwal.toLocaleString('id-ID')}\n` +
                        `📈 *Keuntungan per hari*: ${persenKeuntungan}%\n\n`;
            for (let i = 1; i <= 365; i++) {
                const keuntungan = modalAwal * (persenKeuntungan / 100);
                const modalAkhir = modalAwal + keuntungan;
                hasil += `📅 *Hari ke-${i}*\n💲 Modal awal: Rp ${modalAwal.toLocaleString('id-ID')}\n💰 Modal akhir: Rp ${modalAkhir.toLocaleString('id-ID')}\n\n`;
                modalAwal = modalAkhir;
            }
            await naze.sendMessage(m.chat, { text: hasil }, { quoted: m });
            
        } catch (e) {
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};