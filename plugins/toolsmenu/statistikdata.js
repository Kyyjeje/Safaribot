require('../../settings');

function extractText(m) {
    if (!m || !m.message) return '';
    if (m.type === 'conversation') return m.message.conversation || '';
    if (m.type === 'imageMessage') return m.message.imageMessage?.caption || '';
    if (m.type === 'videoMessage') return m.message.videoMessage?.caption || '';
    if (m.type === 'extendedTextMessage') return m.message.extendedTextMessage?.text || '';
    if (m.type === 'buttonsResponseMessage') return m.message.buttonsResponseMessage?.selectedButtonId || '';
    if (m.type === 'listResponseMessage') return m.message.listResponseMessage?.singleSelectReply?.selectedRowId || '';
    if (m.type === 'templateButtonReplyMessage') return m.message.templateButtonReplyMessage?.selectedId || '';
    if (m.type === 'interactiveResponseMessage') {
        const params = m.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson;
        return params ? JSON.parse(params).id || '' : '';
    }
    if (m.type === 'editedMessage') {
        const edited = m.message.editedMessage?.message?.protocolMessage?.editedMessage;
        return edited?.extendedTextMessage?.text || edited?.conversation || '';
    }
    return m.text || '';
}

module.exports = {
    name: 'statistikdata',
    alias: [],
    run: async ({ naze, m }) => {
        try {
            

            const args = extractText(m).trim().split(/ +/).slice(1);
            if (!args.length) {
                
                return naze.sendMessage(m.chat, { text: `Harap masukkan nilai data!\nContoh: ${m.prefix}${m.command} 23 45 65 43 33` }, { quoted: m });
            }

            const data = args.map(arg => Number(arg)).filter(n => !isNaN(n));
            if (!data.length) {
                
                return naze.sendMessage(m.chat, { text: `Semua nilai harus berupa angka!\nContoh: ${m.prefix}${m.command} 23 45 65 43 33` }, { quoted: m });
            }

            const total = data.reduce((sum, value) => sum + value, 0);
            const mean = total / data.length;
            const sorted = [...data].sort((a, b) => a - b);
            const middle = Math.floor(data.length / 2);
            const median = data.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];

            const frequency = {};
            let maxFreq = 0;
            let mode = [];
            for (let num of data) {
                frequency[num] = (frequency[num] || 0) + 1;
                if (frequency[num] > maxFreq) {
                    maxFreq = frequency[num];
                    mode = [num];
                } else if (frequency[num] === maxFreq) {
                    mode.push(num);
                }
            }
            mode = [...new Set(mode)];
            if (mode.length === data.length) mode = ["Tidak ada"];

            const range = Math.max(...data) - Math.min(...data);
            const max = Math.max(...data);
            const min = Math.min(...data);
            const varianceSum = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0);
            const variance = varianceSum / data.length;
            const stdDev = Math.sqrt(variance);

            const output = `📊 *Statistik Data*\n🔢 *Data*: ${data.join(", ")}\n\n` +
                           `1️⃣ *Rata-rata (Mean)*: ${mean.toFixed(2)}\n` +
                           `2️⃣ *Median*: ${median.toFixed(2)}\n` +
                           `3️⃣ *Modus*: ${mode.join(", ")}\n` +
                           `4️⃣ *Range*: ${range}\n` +
                           `5️⃣ *Nilai Tertinggi*: ${max}\n` +
                           `6️⃣ *Nilai Terendah*: ${min}\n` +
                           `7️⃣ *Standar Deviasi (σ)*: ${stdDev.toFixed(2)}`;

            
            await naze.sendMessage(m.chat, { text: output }, { quoted: m });
        } catch (err) {
            console.error(`Kesalahan saat memproses data: ${err.message}`);
            
            await global.handleError(naze, m, err, { sendRawError: true, useGemini: true });
        }
    }
};