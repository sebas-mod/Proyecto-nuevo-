"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinassetmanagerjs = require('../../src/lib/ourin-asset-manager.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
  name: "setallmenu",
  alias: ["allmenuvariant", "allmenustyle"],
  category: "owner",
  description: "Mengatur variant tampilan allmenu",
  usage: ".setallmenu <v1-v5>",
  example: ".setallmenu v2",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

const VARIANTS = {
  v1: {
    id: 1,
    name: "ALLMENU BASIC",
    desc: "ini mengikuti dari setreply",
    emoji: "📝",
  },
  v2: {
    id: 2,
    name: "ALLMENU PREMIUM",
    desc: "",
    emoji: "🖼️",
  },
  v5: {
    id: 5,
    name: "ALLMENU NATIVEFLOW",
    desc: "Tampilan native flow premium dengan video & cuaca",
    emoji: "✨",
  },
  v6: {
    id: 6,
    name: "ALLMENU LOCATION",
    desc: "Tampilan location message tanpa tombol interaktif",
    emoji: "📍",
  },
};

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const variant = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);

  if (variant) {
    const selected = VARIANTS[variant];
    if (!selected) {
      await m.reply(`❌ *VARIANT TIDAK VALID*\n\nGunakan: *v1*, *v2*, *v5*, atau *v6*`);
      return;
    }

    db.setting("allmenuVariant", selected.id);
    await db.save();

    await m.reply(
      `✅ *ALLMENU VARIANT DIUBAH*\n\n` +
      `${selected.emoji} *V${selected.id} — ${selected.name}*\n` +
      `_${selected.desc}_`,
    );
    return;
  }

  const current =
    db.setting("allmenuVariant") || _optionalChain([_configjs2.default, 'access', _4 => _4.ui, 'optionalAccess', _5 => _5.allmenuVariant]) || 2;

  const rows = [];
  for (const [key, val] of Object.entries(VARIANTS)) {
    const mark = val.id === current ? " ✓" : "";
    rows.push({
      title: `${val.emoji} ${key.toUpperCase()}${mark} — ${val.name}`,
      description: val.desc,
      id: `${m.prefix}setallmenu ${key}`,
    });
  }
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "📋 Pilih Variant Allmenu",
        sections: [{ title: "Daftar Variant Allmenu", rows }],
      }),
    },
  ];

  const bodyText =
    `📋📑 *ALLMENU VARIANT*\n\n` +
    `Atur tampilan allmenu yang menampilkan seluruh daftar perintah bot dalam satu halaman 📖✨\n` +
    `Variant aktif saat ini: *V${current} — ${_optionalChain([VARIANTS, 'access', _6 => _6[`v${current}`], 'optionalAccess', _7 => _7.name]) || "Unknown"}* 🎯\n\n` +
    `*PENJELASAN VARIANT:*\n\n` +
    `- *V1 Simple Text* 📝 — Daftar perintah ditampilkan sebagai text biasa tanpa gambar atau contextInfo, paling ringan dan cepat dimuat\n\n` +
    `- *V2 Image + Context* 🖼️ — Gambar header allmenu + full contextInfo dengan label forwarded newsletter, tampilan standar yang informatif\n\n` +
    `- *V3 Document* 📄 — Allmenu dikirim sebagai file document dengan thumbnail kecil dan verified quoted reply, terlihat seperti file resmi\n\n` +
    `- *V4 Interactive Button* 🔘 — Pesan interaktif dengan tombol single_select untuk memilih kategori dan quick_reply untuk navigasi, tampilan modern\n\n` +
    `- *V5 NativeFlow* ✨ — NativeFlow message dengan limited_time_offer badge dan interactive buttons, tampilan paling premium dan eye-catching\n\n` +
    `> Pilih variant allmenu dari tombol di bawah 👇`;

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
