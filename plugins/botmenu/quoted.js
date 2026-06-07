require('../../settings');

module.exports = {
    name: 'quoted',
    alias: ['q'],
    description: '<reply pesan>',
    run: async ({ naze, m }) => {
        try {
            
            if (!m.quoted) throw new Error('Reply pesannya!');
            const anu = await m.getQuotedObj();
            if (!anu) throw new Error('Format pesan tidak tersedia!');
            if (!anu.quoted) {
                console.log('Debug: anu.quoted is null. m.quoted:', JSON.stringify(m.quoted, null, 2));
                throw new Error('Pesan yang Anda reply tidak mengandung quoted message! Pastikan pesan yang di-reply memiliki reply yang valid.');
            }
            await naze.relayMessage(m.chat, { [anu.quoted.type]: anu.quoted.msg }, {});
            
        } catch (e) {
            
            await global.handleError(naze, m, e, { sendRawError: true, useGemini: true });
        }
    }
};