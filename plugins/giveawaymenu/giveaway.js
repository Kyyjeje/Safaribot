require('../../settings');
const fs = require('fs');
const path = require('path');
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = require('baileys');

// Lokasi file database menggunakan __dirname
const dbPath = path.join(__dirname, '../../database/giveaways.json');

// Fungsi untuk memastikan folder database ada
const ensureDatabaseDir = () => {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Fungsi untuk membaca database dengan penanganan error
const loadGiveaways = () => {
    ensureDatabaseDir();
    try {
        if (!fs.existsSync(dbPath)) {
            fs.writeFileSync(dbPath, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(dbPath, 'utf8');
        if (!data || data.trim() === '') {
            fs.writeFileSync(dbPath, JSON.stringify([]));
            return [];
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('Error parsing giveaways.json:', error.message);
        fs.writeFileSync(dbPath, JSON.stringify([]));
        return [];
    }
};

// Fungsi untuk menyimpan ke database
const saveGiveaways = (data) => {
    ensureDatabaseDir();
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving giveaways.json:', error.message);
    }
};

module.exports = {
    name: "giveaway",
    alias: ["giveaway", ".giveaway"],
    run: async ({ naze, m }) => {
        const body = (m.type === 'conversation') ? m.message.conversation : (m.type == 'imageMessage') ? m.message.imageMessage.caption : (m.type == 'videoMessage') ? m.message.videoMessage.caption : (m.type == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.type == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.type == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.type == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.type === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : (m.type === 'editedMessage') ? (m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage ? m.message.editedMessage.message.protocolMessage.editedMessage.extendedTextMessage.text : m.message.editedMessage.message.protocolMessage.editedMessage.conversation) : '';
        const args = body.trim().split(/ +/).slice(1);
        const text = args.join(' ');

        if (!m.isGroup) return naze.sendMessage(m.chat, { text: "❌ Fitur ini hanya bisa digunakan di grup." }, { quoted: m });

        let groupMetadata = await naze.groupMetadata(m.chat).catch(() => null);
        if (!groupMetadata) return m.reply("❌ Gagal mengambil data grup.");

        let isAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin || m.sender === groupMetadata.owner;
        if (!isAdmin) return naze.sendMessage(m.chat, { text: "❌ Fitur ini hanya bisa digunakan oleh admin/owner grup." }, { quoted: m });

        if (!text) return m.reply('❌ Format salah! \nContoh:\n`.giveaway <jumlah pemenang> <teks>`\n\ncontoh penggunaan:\n`.giveaway 5 bagi bagi iphone untuk 5 orang pemenang`');

        const jumlahPemenang = parseInt(args[0]);
        const giveawayText = args.slice(1).join(' ');

        if (isNaN(jumlahPemenang) || jumlahPemenang <= 0 || !giveawayText) {
            return naze.sendMessage(m.chat, { text: "❌ Format salah! Contoh: `.giveaway 5 Hadiah 10 panel gratis`" }, { quoted: m });
        }

        // Load data giveaway dari database
        let giveaways = loadGiveaways();

        // Cek apakah sudah ada giveaway aktif di grup ini
        const existingGiveaway = giveaways.find(g => g.groupId === m.chat && g.status === 'active');
        if (existingGiveaway) {
            return naze.sendMessage(m.chat, { text: "❌ Sudah ada giveaway aktif di grup ini!\nGunakan `.list_giveaway` untuk melihat detail atau `.delete_giveaway` untuk menghapusnya." }, { quoted: m });
        }

        // Simpan data giveaway baru ke database
        const newGiveaway = {
            groupId: m.chat,
            groupName: groupMetadata.subject,
            winners: jumlahPemenang,
            prize: giveawayText,
            status: 'active',
            createdAt: new Date().toISOString(),
            participants: []
        };
        giveaways.push(newGiveaway);
        saveGiveaways(giveaways);

        // Teks untuk list message dengan desain menarik
        let teks = `
🎉✨ *GIVEAWAY SPECTACULAR!* ✨🎉
----------------------------------------
🎁 *Hadiah*: ${giveawayText}
🏆 *Jumlah Pemenang*: ${jumlahPemenang} Orang
----------------------------------------
Yuk, ikutan sekarang juga dan jadilah salah satu pemenang beruntung! Pilih opsi di bawah untuk memulai! 🌟`;

        // Definisikan sections untuk list message dengan tampilan lebih menarik
        const listOptions = {
            title: "🎊 Menu Giveaway 🎊",
            sections: [
                {
                    title: "🔥 Aksi Utama 🔥",
                    highlight_label: "⭐ Paling Populer ⭐",
                    rows: [
                        { 
                            title: "🎉 IKUT SEKARANG", 
                            description: "Gabung dan menangkan hadiah keren!", 
                            id: ".join_giveaway" 
                        },
                        { 
                            title: "❌ BATAL IKUT", 
                            description: "Mundur dari giveaway", 
                            id: ".cancel_giveaway" 
                        }
                    ]
                },
                {
                    title: "⚙️ Kelola Giveaway ⚙️",
                    highlight_label: "🛠️ Opsi Lain 🛠️",
                    rows: [
                        { 
                            title: "📋 LIHAT GIVEAWAY", 
                            description: "Cek detail giveaway (Admin Only)", 
                            id: ".list_giveaway" 
                        },
                        { 
                            title: "🗑️ HAPUS GIVEAWAY", 
                            description: "Hapus giveaway (Admin Only)", 
                            id: ".delete_giveaway" 
                        },
                        { 
                            title: "🎲 ACAK PEMENANG", 
                            description: "Pilih pemenang secara acak (Admin Only)", 
                            id: ".pick_winner" 
                        }
                    ]
                }
            ]
        };

        // Fungsi untuk mengirim list message
        async function sendListMessage(chat, teks, listnye, m) {
            let mediaAttachment;
            try {
                mediaAttachment = await prepareWAMessageMedia(
                    { image: { url: `${global.thumbnailgiveaway}` } },
                    { upload: naze.waUploadToServer }
                );
            } catch (err) {
                console.error('Gagal load gambar:', err.message);
                return naze.sendMessage(m.chat, { text: "❌ Gagal memuat gambar giveaway." }, { quoted: m });
            }

            let msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        interactiveMessage: proto.Message.InteractiveMessage.create({
                            contextInfo: {
                                mentionedJid: [m.sender],
                            },
                            body: proto.Message.InteractiveMessage.Body.create({
                                text: teks
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.create({
                                text: "Dikelola oleh Admin dengan Cinta ✨"
                            }),
                            header: proto.Message.InteractiveMessage.Header.create({
                                title: "🎇 Giveaway Extravaganza 🎇",
                                subtitle: "",
                                hasMediaAttachment: true,
                                ...mediaAttachment
                            }),
                            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                buttons: [
                                    { 
                                        name: "single_select", 
                                        buttonParamsJson: JSON.stringify(listnye) 
                                    }
                                ]
                            })
                        })
                    }
                }
            }, { quoted: m });

            await naze.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
        }

        // Kirim list message
        await sendListMessage(m.chat, teks, listOptions, m);
    }
};