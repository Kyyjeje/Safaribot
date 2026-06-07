module.exports = {
    name: "rekeningcek",
    description: '<reply/@tag>',
    run: async ({ naze, m, text }) => {
        let target = text ? text.replace(/@/g, '') : `@${m.sender.split('@')[0]}`;
        let mataUang = ['IDR (Rupiah)', 'USD (Dollar)', 'EUR (Euro)', 'GBP (Poundsterling)', 'JPY (Yen)', 'CNY (Yuan)', 'INR (Rupee)', 'ZWD (Zimbabwe Dollar)', 'BTC (Bitcoin)', 'ETH (Ethereum)'];
        let randomMataUang = mataUang[Math.floor(Math.random() * mataUang.length)];

        let rand = Math.random();
        let saldo;
        if (rand < 0.75) saldo = Math.floor(Math.random() * 1_000_001);
        else if (rand < 0.90) saldo = Math.floor(Math.random() * 999_000_001) + 1_000_000;
        else if (rand < 0.99) saldo = Math.floor(Math.random() * 999_000_000_001) + 1_000_000_000;
        else saldo = Math.floor(Math.random() * 999_000_000_000_001) + 1_000_000_000_000;

        let saldoFormatted = randomMataUang.includes('IDR') || randomMataUang.includes('INR') ? saldo.toLocaleString('id-ID') : saldo.toLocaleString('en-US');

        let statusKeuangan;
        if (saldo < 10_000) statusKeuangan = ['Miskin banget woy 🤣', 'Lagi krisis ekonomi wkwk', 'Cuma bisa beli permen 😭'][Math.floor(Math.random() * 3)];
        else if (saldo < 1_000_000) statusKeuangan = ['Lumayan buat beli nasi padang 😋', 'Jangan boros bro! 🤑', 'Bisa buat traktir temen 🥳'][Math.floor(Math.random() * 3)];
        else if (saldo < 1_000_000_000) statusKeuangan = ['Kaya tapi nggak banget 🤔', 'Bisa beli motor nih! 🏍️', 'Hampir sultan! 😏'][Math.floor(Math.random() * 3)];
        else if (saldo < 1_000_000_000_000) statusKeuangan = ['Ini baru tajir melintir! 💰', 'Sultan kelas menengah! 🏦', 'Bisa beli rumah nih! 🏠'][Math.floor(Math.random() * 3)];
        else statusKeuangan = ['SULTAN SEJAGAD! 🏆', 'Uangnya nggak abis-abis! 🤯', 'Orang kaya mah bebas! 😎'][Math.floor(Math.random() * 3)];

        let hasil = `🏦 *Cek Rekening Bank* 🏦\n\n` +
                    `👤 *Nama                :* ${target}\n` +
                    `💰 *Jumlah Saldo  :* ${saldoFormatted} ${randomMataUang}\n\n` +
                    `📌 *Status Keuangan :* ${statusKeuangan}`;

        naze.sendMessage(m.chat, { text: hasil, mentions: [m.sender] }, { quoted: m });
    }
};
