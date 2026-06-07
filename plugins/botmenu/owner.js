require('../../settings');
const axios = require("axios");

module.exports = {
    name: 'owner',
    alias: ['.owner'],
    run: async ({ naze, m }) => {
        await naze.sendContact(m.chat, global.owner, m);
    }
};
