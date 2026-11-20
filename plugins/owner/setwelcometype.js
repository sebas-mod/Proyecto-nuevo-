"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinassetmanagerjs = require('../../src/lib/ourin-asset-manager.js');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
  name: "setwelcometype",
  alias: ["welcometype", "welcomevariant", "welcomestyle"],
  category: "owner",
  description: "Mengatur variant tampilan welcome message",
  usage: ".setwelcometype",
  example: ".setwelcometype",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};
const VARIANTS = {
  1: {
    name: "Canvas Image",
    desc: "Gambar canvas dengan foto profil",
    emoji: "🎨",
  },
  2: {
    name: "Carousel Cards",
    desc: "Kartu carousel interaktif dengan tombol",
    emoji: "🃏",
  },
  3: {
    name: "Text Only",
    desc: "Pesan teks minimalis tanpa gambar",
    emoji: "📝",
  },
  4: { name: "Group", desc: "ContextInfo group style", emoji: "👥" },
  5: { name: "Simple", desc: "Pesan teks simple + foto profile", emoji: "✨" },
  6: { name: "Video", desc: "Kirim video perkenalan", emoji: "🎥" },
  7: { name: "Interactive Quoted", desc: "Interactive message dengan fake quoted", emoji: "💬" },
  8: { name: "Super Simple", desc: "Pesan teks sangat singkat tanpa hiasan", emoji: "👋" },
};
async function handler(m, { sock, db }) {
  const args = m.args || [];
  const variant = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);
  const current = db.setting("welcomeType") || 1;
  if (variant && /^v?[1-8]$/.test(variant)) {
    const id = parseInt(variant.replace("v", ""));
    db.setting("welcomeType", id);
    await db.save();
    await m.reply(
      `✅ *WELCOME TYPE DIUBAH*\n\n` +
        `${VARIANTS[id].emoji} *V${id} — ${VARIANTS[id].name}*\n` +
        `_${VARIANTS[id].desc}_`,
    );
    return;
  }
  const rows = [];
  for (const [id, val] of Object.entries(VARIANTS)) {
    const mark = parseInt(id) === current ? " ✓" : "";
    rows.push({
      title: `${val.emoji} V${id}${mark} — ${val.name}`,
      description: val.desc,
      id: `${m.prefix}setwelcometype v${id}`,
    });
  }
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "👋 Pilih Tipe Welcome",
        sections: [{ title: "Daftar Tipe Welcome", rows }],
      }),
    },
  ];
  const bodyText =
    `👋🎨 *WELCOME TYPE*\n\n` +
    `Atur tampilan pesan welcome saat member baru masuk grup 🚪✨\n` +
    `Tipe aktif saat ini: *V${current} — ${VARIANTS[current].name}* 🎯\n\n` +
    `*PENJELASAN TIPE:*\n\n` +
    `- *V1 Canvas Image* 🎨 — Bot membuat gambar canvas otomatis berisi foto profil dan nama member yang baru join, lalu dikirim sebagai gambar\n\n` +
    `- *V2 Carousel Cards* 🃏 — Menampilkan kartu carousel interaktif yang bisa di-swipe lengkap dengan tombol action, cocok untuk grup yang ingin tampilan modern\n\n` +
    `- *V3 Text Only* 📝 — Pesan teks biasa tanpa gambar sama sekali, ringan dan minimalis\n\n` +
    `- *V4 Group* 👥 — Menggunakan contextInfo bergaya group forward, tampilan rapi dengan label newsletter\n\n` +
    `- *V5 Simple* ✨ — Pesan teks sederhana disertai foto profile member yang join, tidak terlalu mencolok namun informatif\n\n` +
    `- *V6 Video* 🎥 — Mengirimkan video sambutan menarik dilengkapi caption selamat datang untuk member\n\n` +
    `- *V7 Interactive Quoted* 💬 — Mengirimkan pesan interaktif dan fake quoted dari orang yang join\n\n` +
    `- *V8 Super Simple* 👋 — Pesan teks sangat singkat tanpa hiasan (Contoh: Hai @user, welcome to grup...)\n\n` +
    `> Pilih tipe welcome dari tombol di bawah 👇`;
  await sock.sendButton(
    m.chat,
    _ourinassetmanagerjs.getAssetBuffer.call(void 0, "ourin"),
    bodyText,
    m,
    { buttons },
  );
}
exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
