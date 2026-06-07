const axios = require('axios');

module.exports = {
    name: 'apicheck',
    alias: ['cekapi', 'testapi', 'apistatus'],
    description: '<url API>',
    run: async ({ naze, m, text }) => {
        if (!text) return m.reply(`Mohon berikan URL API yang ingin diperiksa. Contoh: \n\`${m.prefix}${m.command} https://api.example.com\``);
        
         
        await global.sendMessageWithThumbnail(naze, m.chat, 'wait', m);

        try {
            const response = await axios.get(text, {
                timeout: 20000 
            });
            
            let result;
            if (typeof response.data === 'object') {
                result = JSON.stringify(response.data, null, 2); 
            } else {
                result = response.data.toString();
            }
            
            m.reply(`✅ API BERHASIL DIAMBIL!
🌐 URL: ${text}
📥 Respons:
\`\`\`
${result.slice(0, 4000)}
\`\`\``); 
            
        } catch (error) {
            let errMsg = error.response ? error.response.status + ' ' + error.response.statusText : error.message;
            m.reply(`⚠️ Gagal mengambil API
🌐 URL: ${text}
❌ Error: ${errMsg}`);
            
        }
    }
};
