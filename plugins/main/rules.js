"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinassetmanagerjs = require('../../src/lib/ourin-asset-manager.js');

const pluginConfig = {
    name: "rules",
    alias: ["aturanbot", "botrules", "peraturanbot"],
    category: "main",
    description: "Menampilkan rules dan aturan penggunaan bot secara lengkap",
    usage: ".rules",
    example: ".rules",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
}

function buildDefaultRules(botName, prefix) {
    return `📜 *PERATURAN ${botName.toUpperCase()}*

Hai! Sebelum kamu menggunakan semua fitur yang tersedia, pastikan kamu memahami dan mematuhi peraturan berikut ini ya. Peraturan ini dibuat supaya semua pengguna bisa nyaman dan bot bisa berjalan dengan lancar.

🔹 *ATURAN UMUM*

- Dilarang keras melakukan *spam command* secara berulang-ulang dalam waktu singkat. Sistem anti-spam aktif dan pelanggar bisa langsung dibanned otomatis oleh bot.
- Gunakan semua fitur bot dengan *bijak dan bertanggung jawab*. Jangan menyalahgunakan fitur untuk hal-hal yang merugikan orang lain.
- Dilarang menggunakan bot untuk menyebarkan *konten SARA, ujaran kebencian, atau konten ilegal* dalam bentuk apapun.
- *Hormati sesama pengguna* bot. Jangan menggunakan fitur untuk mengganggu, membully, atau merugikan pengguna lain.
- Jangan mengirimkan *konten NSFW* di grup tanpa persetujuan admin grup terlebih dahulu.

🔹 *ATURAN PENGGUNAAN FITUR*

- Setiap penggunaan command membutuhkan *energi*. Gunakan energi kamu dengan bijak supaya tidak cepat habis.
- Fitur *premium* hanya bisa diakses oleh pengguna yang sudah berlangganan. Ketik *${prefix}benefitpremium* untuk info lengkap.
- Jika menemukan *bug atau error*, segera laporkan ke owner bot melalui *${prefix}owner*. Jangan disalahgunakan.
- Dilarang melakukan *request fitur yang tidak masuk akal* atau memaksa owner untuk menambahkan fitur tertentu.

🔹 *KONSEKUENSI PELANGGARAN*

- Pelanggaran ringan akan mendapat *peringatan* dari admin atau owner
- Pelanggaran berat atau berulang dapat mengakibatkan *banned permanen* dari penggunaan bot
- Owner berhak memutuskan sanksi tanpa pemberitahuan terlebih dahulu

_Dengan menggunakan bot ini, kamu dianggap sudah membaca dan menyetujui seluruh peraturan di atas._`
}

async function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const botName = _optionalChain([_configjs2.default, 'access', _ => _.bot, 'optionalAccess', _2 => _2.name]) || "Ourin-AI"
    const customRules = db.setting("botRules")

    let rulesText
    if (customRules && typeof customRules === "string" && customRules.trim().length > 0) {
        rulesText = customRules
    } else if (Array.isArray(customRules) && customRules.length > 0) {
        rulesText = `📜 *PERATURAN ${botName.toUpperCase()}*\n\n`
        customRules.forEach((rule, i) => {
            rulesText += `${i + 1}. ${rule}\n`
        })
    } else {
        rulesText = buildDefaultRules(botName, m.prefix)
    }

    const imageBuffer = _ourinassetmanagerjs.getAssetBuffer.call(void 0, "ourin-rules")

    if (imageBuffer) {
        await sock.sendMessage(m.chat, {
            image: imageBuffer,
            caption: rulesText,
        }, { quoted: m })
    } else {
        await m.reply(rulesText)
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
