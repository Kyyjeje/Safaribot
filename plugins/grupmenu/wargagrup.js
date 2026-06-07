require('../../settings');
const countryCodes = require('../../database/kodenegara');

module.exports = {
  name: 'asalnegara',
  alias: ['wargagrup', 'asalmember', 'negaramember'],
  run: async ({ naze, m }) => {
    try {
      

      if (!m.isGroup) {
        await global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        return;
      }

      const metadata = await naze.groupMetadata(m.chat);
      if (!metadata || !metadata.participants) {
        
        await m.reply('Gagal mengambil data anggota grup.');
        return;
      }

      let countryCount = {};
      let members = metadata.participants.map(a => a.id);

      for (let member of members) {
        let rawNumber = member.split('@')[0];
        let countryCode;
        for (let i = 1; i <= 4; i++) {
          let code = rawNumber.slice(0, i);
          if (countryCodes[code]) {
            countryCode = code;
            break;
          }
        }

        if (!countryCode) continue;

        let countryData = countryCodes[countryCode] || { name: 'Negara Tidak Diketahui', flag: '❓' };
        let formattedCode = `(+${countryCode}) ${countryData.name} ${countryData.flag}`;
        countryCount[formattedCode] = (countryCount[formattedCode] || 0) + 1;
      }

      let sortedCountries = Object.entries(countryCount).sort((a, b) => b[1] - a[1]);
      let result = `*Statistik Asal Negara Anggota Grup*\n\n`;
      let totalMembers = members.length;

      for (let [country, count] of sortedCountries) {
        result += `${country}: ${count} anggota\n`;
      }

      result += `\nTotal Anggota: ${totalMembers}`;

      
      await m.reply(result);
    } catch (err) {
      
      await m.reply('Gagal mengambil data asal negara.');
      await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
    }
  }
};