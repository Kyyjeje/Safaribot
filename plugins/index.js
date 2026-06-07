const fs = require('fs').promises;
const path = require('path');
const { triggerBackup } = require('../src/backup');

const plugins = new Map();
const pluginsDir = './plugins';
let hasLoggedFolders = false;
const loggedErrors = new Set();

// Debounce untuk mencegah pemanggilan berulang dari fs.watch
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Muat plugin dari direktori
const loadPlugins = async (isInitialLoad = false) => {
    const pluginFolders = await fs.readdir(__dirname, { withFileTypes: true });

    if (isInitialLoad && !hasLoggedFolders) {
        for (const folder of pluginFolders) {
            if (folder.isDirectory()) {
                const pluginFiles = await fs.readdir(path.join(__dirname, folder.name));
                if (pluginFiles.some(file => file.endsWith('.js'))) {
                    console.log(`📂 Folder "${folder.name}" berhasil dimuat.`);
                }
            }
        }
        hasLoggedFolders = true;
    }

    for (const folder of pluginFolders) {
        if (folder.isDirectory()) {
            const pluginFiles = await fs.readdir(path.join(__dirname, folder.name));
            let hasError = false;

            for (const file of pluginFiles.filter(f => f.endsWith('.js'))) {
                const filePath = path.join(__dirname, folder.name, file);
                const errorKey = `${filePath}`;

                try {
                    delete require.cache[require.resolve(filePath)];
                    const plugin = require(filePath);

                    if (typeof plugin.name === 'string' && plugin.name.trim() !== '' && typeof plugin.run === 'function') {
                        plugins.set(plugin.name, plugin);
                        if (plugin.alias && Array.isArray(plugin.alias)) {
                            for (const alias of plugin.alias) {
                                if (typeof alias === 'string' && alias.trim() !== '') {
                                    plugins.set(alias, plugin);
                                } else if (!loggedErrors.has(`alias:${filePath}:${alias}`)) {
                                    console.warn(`⚠️ Alias "${alias}" di plugin "${plugin.name}" tidak valid.`);
                                    loggedErrors.add(`alias:${filePath}:${alias}`);
                                    hasError = true;
                                }
                            }
                        }
                    } else {
                        hasError = true;
                        if (typeof plugin.name !== 'string' || plugin.name.trim() === '' && !loggedErrors.has(`name:${filePath}`)) {
                            console.warn(`❌ Gagal memuat plugin "${filePath}": Properti 'name' tidak valid atau kosong.`);
                            loggedErrors.add(`name:${filePath}`);
                        }
                        if (typeof plugin.run !== 'function' && !loggedErrors.has(`run:${filePath}`)) {
                            console.warn(`❌ Gagal memuat plugin "${filePath}": Fungsi 'run' tidak ditemukan atau tidak valid.`);
                            loggedErrors.add(`run:${filePath}`);
                        }
                    }
                } catch (err) {
                    hasError = true;
                    if (!loggedErrors.has(`error:${filePath}:${err.message}`)) {
                        console.error(`❌ Gagal memuat plugin "${filePath}": ${err.message}`);
                        loggedErrors.add(`error:${filePath}:${err.message}`);
                    }
                }
            }

            if (hasError && pluginFiles.length > 0 && !loggedErrors.has(`folder:${folder.name}`)) {
                console.log(`⚠️ Folder "${folder.name}" tidak dimuat sepenuhnya karena ada kesalahan.`);
                loggedErrors.add(`folder:${folder.name}`);
            }
        }
    }
};

// Auto-reload dan panggil backup saat plugin berubah
const debouncedLoadPlugins = debounce(async (filename, naze) => {
    if (filename && filename.endsWith('.js')) {
        const folderName = path.dirname(filename).split(path.sep).pop();
        console.log(`🔄 Plugin "${filename}" di folder "${folderName}" diperbarui.`);

        const ownerJid = global.owner[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        if (!ownerJid) {
            console.error('Owner tidak ditemukan di global.owner.');
            return;
        }

        await triggerBackup(naze, filename, folderName, ownerJid);
        await loadPlugins(false);
        console.log('✅ Plugin berhasil diperbarui tanpa restart.');
    }
}, 2000);

// Pantau perubahan di direktori plugins
require('fs').watch(pluginsDir, { recursive: true }, (eventType, filename) => {
    debouncedLoadPlugins(filename, global.naze);
});

// Jalankan loadPlugins saat start
loadPlugins(true);

module.exports = { loadPlugins, plugins };