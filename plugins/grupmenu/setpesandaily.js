require('../../settings');
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const { placeholderDescriptions } = require('../../database/list_function.js'); // Impor placeholderDescriptions

module.exports = {
    name: 'setpesandaily',
    alias: ['setdailymessage'],
    description: '<reply teks>',
    run: async ({ naze, m }) => {
        try {
            if (!m.isGroup) {
                return global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
            }
            if (!m.isAdmin) {
                return global.sendMessageWithThumbnail(naze, m.chat, 'admin', m);
            }
            if (!m.isBotAdmin) {
                return global.sendMessageWithThumbnail(naze, m.chat, 'botAdmin', m);
            }

            if (!m.quoted || !m.quoted.message || !m.quoted.message.conversation) {
                // Ambil daftar fungsi dari placeholderDescriptions, kecuali @list
                const availableFunctions = { ...placeholderDescriptions };
                delete availableFunctions['@list']; // Hapus @list dari daftar

                const functionList = Object.entries(availableFunctions)
                    .map(([func, desc]) => `- ${func}: ${desc}`)
                    .join('\n');

                return naze.sendMessage(m.chat, {
                    text: `*Format salah!* Reply pesan teks untuk mengatur pesan harian!\nContoh: \n${m.prefix}${m.command} (reply teks)\n\n*Fungsi yang tersedia:*\n${functionList}`
                }, { quoted: m });
            }

            const text = m.quoted.message.conversation;
            const chatId = m.chat;

            // Inisialisasi db jika belum ada
            if (!global.db) global.db = {};
            if (!global.db.groups) global.db.groups = {};
            if (!global.db.groups[chatId]) global.db.groups[chatId] = {};

            // Simpan teks ke db.groups[chatId].dailyMessage
            global.db.groups[chatId].dailyMessage = text;

            return naze.sendMessage(m.chat, {
                text: 'Sukses menyimpan teks pesan harian untuk grup!'
            }, { quoted: m });
        } catch (err) {
            console.error(`Kesalahan saat memproses setpesandaily: ${err.message}`);
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};