require('../../settings');
const path = require('path');
const { generateCustomKeyId } = require(path.join(__dirname, '../../src/idcustom'));

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getMessageBody(m) {
  const messageHandlers = {
    conversation: () => m.message.conversation,
    imageMessage: () => m.message.imageMessage.caption,
    videoMessage: () => m.message.videoMessage.caption,
    extendedTextMessage: () => m.message.extendedTextMessage.text,
    buttonsResponseMessage: () => m.message.buttonsResponseMessage.selectedButtonId || '',
    listResponseMessage: () => m.message.listResponseMessage.singleSelectReply.selectedRowId || '',
    templateButtonReplyMessage: () => m.message.templateButtonReplyMessage.selectedId || '',
    interactiveResponseMessage: () => {
      const nativeFlowResponse = m.message.interactiveResponseMessage?.nativeFlowResponseMessage;
      return nativeFlowResponse && nativeFlowResponse.paramsJson ? JSON.parse(nativeFlowResponse.paramsJson).id || '' : '';
    },
    messageContextInfo: () => m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text || '',
    editedMessage: () => {
      const edited = m.message.editedMessage.message.protocolMessage.editedMessage;
      return edited.extendedTextMessage ? edited.extendedTextMessage.text : edited.conversation || '';
    }
  };

  return messageHandlers[m.type]?.() || '';
}

module.exports = {
  name: 'grupsetting',
  alias: ['groupsetting', 'grupset', 'grupsettings', 'groupset'],
  run: async ({ naze, m }) => {
    try {
      

      if (!m.isGroup) {
        await global.sendMessageWithThumbnail(naze, m.chat, 'group', m);
        return;
      }

      if (!global.db) global.db = {};
      if (!global.db.groups) global.db.groups = {};
      if (!global.db.groups[m.chat]) global.db.groups[m.chat] = {};

      const anu = global.db.groups[m.chat];
      const urls = [`${global.thumbnailgrupsetting}`];
      const thumbnailUrl = pickRandom(urls);

      const booleanFeatures = [];
      const optionFeatures = [];
      let antiNomorLuar = '';
      let autoGroup = '';

      const ignoredKeys = ['participants'];

      for (const key in anu) {
        if (ignoredKeys.includes(key)) continue;

        if (key === 'antinomor_luar') {
          if (anu[key].active) {
            const exceptions = anu[key].exceptions?.length > 0 ? anu[key].exceptions.map(e => `+${e}`).join(', ') : 'Tidak ada';
            antiNomorLuar = `\`antinomor_luar\`\n> ✅ Aktif\n> Nomor yang dikecualikan: ${exceptions}`;
          } else {
            antiNomorLuar = `\`antinomor_luar\`\n> ❌ Non-Aktif`;
          }
        } else if (key === 'autoGroup') {
          if (anu[key].enabled) {
            autoGroup = `\`autoGroup\`\n> ✅ Aktif\n> Grup dibuka: ${anu[key].openTime}\n> Grup ditutup: ${anu[key].closeTime}`;
          } else {
            autoGroup = `\`autoGroup\`\n> ❌ Non-Aktif`;
          }
        } else if (typeof anu[key] === 'object' && 'enabled' in anu[key]) {
          if (!optionFeatures.includes(key)) optionFeatures.push(key);
        } else if (typeof anu[key] === 'boolean') {
          if (!booleanFeatures.includes(key)) booleanFeatures.push(key);
        }
      }

      booleanFeatures.sort();
      optionFeatures.sort();

      let statusGroupText = `⚙️ *Pengaturan Grup: ${m.metadata.subject}*\n\n`;

      statusGroupText += `✅ *Peraturan Grup* (${optionFeatures.length} fitur)\n`;
      for (const key of optionFeatures) {
        const deleteStatus = anu[key].delete ? '✅' : '❌';
        const kickStatus = anu[key].kick ? '✅' : '❌';
        statusGroupText += `\`${key}\`\n> [${deleteStatus} delete] [${kickStatus} kick]\n`;
      }

      statusGroupText += `\n🌍 *Anti Nomor Luar*\n${antiNomorLuar}\n`;

      if (autoGroup) {
        statusGroupText += `\n⏰ *Grup Otomatis*\n${autoGroup}\n`;
      }

      const activeBoolean = booleanFeatures.filter(f => anu[f]);
      const inactiveBoolean = booleanFeatures.filter(f => !anu[f]);

      statusGroupText += `\n❌ *Settingan Grup* (${booleanFeatures.length} fitur)\n`;
      for (const key of activeBoolean) {
        statusGroupText += `\`${key}\`\n> ✅ Aktif\n`;
      }
      for (const key of inactiveBoolean) {
        statusGroupText += `\`${key}\`\n> ❌ Non-Aktif\n`;
      }
      if (booleanFeatures.length === 0) {
        statusGroupText += `- Tidak ada setting grup\n`;
      }

      statusGroupText += `\n📌 *Ubah Status Grup:*\n` +
                         `- \`.grup-open\` → Membuka grup\n` +
                         `- \`.grup-close\` → Menutup grup\n\n` +
                         `📌 *Ubah Status Grup (Otomatis):*\n` +
                         `\`.grup-auto on <jam:menit-jam:menit>\`\n` +
                         `  Contoh: \`.grup-auto on 07:00-22:00\`\n` +
                         `\`.grup-auto off\``;

      await naze.sendMessage(m.chat, {
        text: statusGroupText,
        contextInfo: {
          externalAdReply: {
            title: `⚙️ Pengaturan Grup`,
            body: `Nama Grup: ${m.metadata.subject}`,
            previewType: "PHOTO",
            thumbnailUrl: thumbnailUrl,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });
      
    } catch (err) {
      
      await m.reply('Gagal menampilkan pengaturan grup.');
      await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
    }
  }
};