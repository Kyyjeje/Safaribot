require('../../settings');

module.exports = {
    name: 'fakenomor-indo',
    alias: ['fakenomor'],
    run: async ({ naze, m }) => {
        try {
            

            const providers = {
                Telkomsel: ['0811', '0812', '0813', '0821', '0822', '0823', '0852', '0853'],
                Indosat: ['0814', '0815', '0816', '0855', '0856', '0857', '0858'],
                'XL Axiata': ['0817', '0818', '0819', '0859', '0877', '0878'],
                Axis: ['0831', '0832', '0833', '0838'],
                'Tri (3)': ['0895', '0896', '0897', '0898', '0899'],
                Smartfren: ['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888', '0889']
            };

            let message = '📱 *10 Nomor Indonesia Acak:*\n\n';
            for (let i = 0; i < 10; i++) {
                const providerNames = Object.keys(providers);
                const randomProvider = providerNames[Math.floor(Math.random() * providerNames.length)];
                const randomPrefix = providers[randomProvider][Math.floor(Math.random() * providers[randomProvider].length)];
                const middleDigits = Math.floor(1000 + Math.random() * 9000);
                const lastDigits = Math.floor(1000 + Math.random() * 9000);
                const prefix = randomPrefix.slice(1);
                const fakeNumber = `+62 ${prefix}-${middleDigits}-${lastDigits}`;
                message += `📌 *${randomProvider}*\n   ┗ 📞 ${fakeNumber}\n\n`;
            }

            
            return naze.sendMessage(m.chat, { text: message }, { quoted: m });
        } catch (err) {
            console.error(`Gagal menghasilkan nomor: ${err.message}`);
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};