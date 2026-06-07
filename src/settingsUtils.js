// src/settingsUtils.js
const fs = require('fs');
const path = require('path');

function updateSettingsPrefixes(newPrefixes) {
    try {
        const settingsPath = path.join(__dirname, '../settings.js');
        let settingsContent = fs.readFileSync(settingsPath, 'utf8');
        const prefixLineRegex = /global\.prefixes\s*=\s*\[[^\]]*]/;
        const newPrefixLine = `global.prefixes = ${JSON.stringify(newPrefixes)}`;

        if (prefixLineRegex.test(settingsContent)) {
            settingsContent = settingsContent.replace(prefixLineRegex, newPrefixLine);
        } else {
            settingsContent += `\n${newPrefixLine}`;
        }

        fs.writeFileSync(settingsPath, settingsContent, 'utf8');
        console.log(`✅ File settings.js berhasil diperbarui dengan prefix baru: ${newPrefixes}`);
        global.prefixes = newPrefixes;

        delete require.cache[require.resolve('../settings')];
        require('../settings');
    } catch (error) {
        console.error(`❌ Gagal memperbarui settings.js:`, error);
        throw error;
    }
}

module.exports = { updateSettingsPrefixes };