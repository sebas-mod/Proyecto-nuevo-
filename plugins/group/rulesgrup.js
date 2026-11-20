"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinassetmanagerjs = require('../../src/lib/ourin-asset-manager.js');

const pluginConfig = {
    name: "rulesgrup",
    alias: ["grouprules", "aturangrup", "grules"],
    category: "group",
    description: "Menampilkan rules dan aturan grup secara lengkap",
    usage: ".rulesgrup",
    example: ".rulesgrup",
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
}

const DEFAULT_GROUP_RULES = `📜 *ATURAN GRUP*

Selamat datang di grup ini! Supaya suasana tetap nyaman dan kondusif untuk semua anggota, harap patuhi aturan-aturan berikut ini ya.

🔹 *ETIKA BERKOMUNIKASI*

- Gunakan *bahasa yang sopan* dan saling menghargai satu sama lain. Tidak ada toleransi untuk kata-kata kasar atau ujaran kebencian.
- Dilarang melakukan *spam* pesan berulang-ulang, termasuk spam sticker, gambar, dan voice note secara berlebihan.
- Dilarang menyebarkan *konten SARA, pornografi, dan kekerasan* dalam bentuk apapun.
- Jangan *menghina, membully, atau mempermalukan* anggota grup lainnya.

🔹 *KONTEN DAN LINK*

- Dilarang *promosi* produk, jasa, atau akun media sosial tanpa izin admin grup.
- Dilarang *menyebarkan link* apapun tanpa persetujuan admin, termasuk link grup WhatsApp lain.
- Dilarang menyebarkan *berita hoax* atau informasi yang belum terverifikasi kebenarannya.
- Dilarang mengirim *dokumen atau file mencurigakan* yang berpotensi mengandung virus.

🔹 *PENGGUNAAN BOT*

- Gunakan command bot *secukupnya*, jangan spam command berulang-ulang.
- *Patuhi instruksi admin* grup kapan saja. Keputusan admin adalah final.
- Jika ada masalah, sampaikan dengan baik-baik ke admin, bukan di grup.

🔹 *KONSEKUENSI*

- Pelanggaran ringan mendapat *peringatan (warning)* dari admin
- Pelanggaran berat atau berulang akan di-*kick* dari grup
- Admin berhak mengeluarkan member kapan saja tanpa pemberitahuan

_Dengan bergabung di grup ini, kamu dianggap sudah menyetujui semua aturan di atas._`

async function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const groupData = db.getGroup(m.chat) || {}
    const customRules = groupData.groupRules
    const rulesText = customRules || DEFAULT_GROUP_RULES

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

exports.config = pluginConfig; exports.handler = handler; exports.DEFAULT_GROUP_RULES = DEFAULT_GROUP_RULES;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
