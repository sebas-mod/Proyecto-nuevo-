"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinassetmanagerjs = require('../../src/lib/ourin-asset-manager.js');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
  name: "setmenu",
  alias: ["menuvariant", "menustyle"],
  category: "owner",
  description: "Configurar la variante de visualización del menú",
  usage: ".setmenu <v1-v16>",
  example: ".setmenu v8",
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
    name: "BASIC",
    desc: "",
    emoji: "🖼️",
  },
  v2: {
    id: 2,
    name: "PREMIUM",
    desc: "",
    emoji: "✅",
  },
  v3: {
    id: 3,
    name: "PREMIUM",
    desc: "",
    emoji: "✅",
  },
  v4: {
    id: 4,
    name: "LV",
    desc: "",
    emoji: "✅",
  },
  v5: {
    id: 5,
    name: "LV 2",
    desc: "",
    emoji: "✅",
  },
  v6: {
    id: 6,
    name: "LOCATION",
    desc: "Mensaje de la Locitación con Botones",
    emoji: "📍",
  },
  v7: {
    id: 7,
    name: "RA NGERTI",
    desc: "Mensaje de la Locitación con Botones",
    emoji: "📍",
  },
  v8: {
    id: 8,
    name: "THUMBNAIL",
    desc: "Thumbnail Image",
    emoji: "📍",
  },
  v9: {
    id: 9,
    name: "BLUE NATIVE",
    desc: "Juego de cabeza biru + ingenuo menú WhatsApp",
    emoji: "🔵",
  },
};

async function handler(m, { sock, db }) {
  const args = m.args || [];
  const variant = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);
  if (variant) {
    const selected = VARIANTS[variant];
    if (!selected) {
      await m.reply(`❌* VARIANT TIGHT VALID*\n\nUso: * v1 * s / d * v9 *`);
      return;
    }
    db.setting("menuVariant", selected.id);
    await db.save();
    await m.reply(
      `✅* MEET VARIANT was USED *\n\n` +
      `${selected.emoji} *V${selected.id} — ${selected.name}*\n` +
      `_${selected.desc}_`,
    );
    return;
  }

  const current = db.setting("menuVariant") || _optionalChain([_configjs2.default, 'access', _4 => _4.ui, 'optionalAccess', _5 => _5.menuVariant]) || 2;

  const rows = [];
  for (const [key, val] of Object.entries(VARIANTS)) {
    const mark = val.id === current ? " ✓" : "";
    rows.push({
      title: `${val.emoji} ${key.toUpperCase()}${mark} — ${val.name}`,
      description: val.desc,
      id: `${m.prefix}setmenu ${key}`,
    });
  }
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "🎨Seleccione Menú Variante",
        sections: [{ title: "Lista de menús variables", rows }],
      }),
    },
  ];

  const bodyText =
    `🎨🖼# MEET VARIANT #\n\n` +
    `Pulse la vista principal del menú del bot cuando el usuario escriba el comando del menú📋✨\n` +
    `Variable actual: * V${current} — ${_optionalChain([VARIANTS, 'access', _6 => _6[`v${current}`], 'optionalAccess', _7 => _7.name]) || "Unknown"}* 🎯\n\n` +
    `# Elige menús variantes de putool en el crud👇`;

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
