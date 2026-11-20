"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinassetmanagerjs = require('../../src/lib/ourin-asset-manager.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: "setmenucat",
  alias: ["menucatvariant", "menucatstyle"],
  category: "owner",
  description: "Mengatur variant tampilan menucat",
  usage: ".setmenucat <v1-v2, v5>",
  example: ".setmenucat v2",
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
    name: "Plain Text",
    desc: "Tampilan teks biasa tanpa media, cocok untuk koneksi lambat atau device yang tidak support interactive message",
    emoji: "📝",
  },
  v2: {
    id: 2,
    name: "Interactive + Image Header",
    desc: "Tampilan premium dengan gambar header, limited time offer, dan tombol navigasi interaktif",
    emoji: "🖼️",
  },
  v5: {
    id: 5,
    name: "MENUCAT NATIVEFLOW",
    desc: "Tampilan native flow premium dengan video & cuaca",
    emoji: "✨",
  },
  v6: {
    id: 6,
    name: "MENUCAT LOCATION",
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

    db.setting("menucatVariant", selected.id);
    await db.save();

    await m.reply(
      `✅ *MENUCAT VARIANT DIUBAH*\n\n` +
        `${selected.emoji} *V${selected.id} — ${selected.name}*\n` +
        `${selected.desc}`,
    );
    return;
  }

  const current =
    db.setting("menucatVariant") || _optionalChain([_configjs2.default, 'access', _4 => _4.ui, 'optionalAccess', _5 => _5.menucatVariant]) || 2;

  const rows = [];
  for (const [key, val] of Object.entries(VARIANTS)) {
    const mark = val.id === current ? " ✓" : "";
    rows.push({
      title: `${val.emoji} ${key.toUpperCase()}${mark} — ${val.name}`,
      description: val.desc,
      id: `${m.prefix}setmenucat ${key}`,
    });
  }

  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "📂 Pilih Variant Menucat",
        sections: [{ title: "Daftar Variant Menucat", rows }],
      }),
    },
  ];

  const bodyText =
    `📂🗂️ *MENUCAT VARIANT*\n\n` +
    `Atur tampilan menu per kategori ketika user memilih kategori dari menu utama 📋✨\n` +
    `Variant aktif saat ini: *V${current} — ${_optionalChain([VARIANTS, 'access', _6 => _6[`v${current}`], 'optionalAccess', _7 => _7.name]) || "Unknown"}* 🎯\n\n` +
    `> Pilih variant menucat dari tombol di bawah 👇`;

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
