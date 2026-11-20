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
    desc: "Viene del set.",
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
    desc: "Apareciendo prima de flujo ingenuo con video dhamca",
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
      await m.reply(`❌* VARIANT TIGHT VALID*\n\nUso: * v1 *, * v2 *, * v5 *, o * v6 *`);
      return;
    }

    db.setting("allmenuVariant", selected.id);
    await db.save();

    await m.reply(
      `✅* ALLMENU VARIANT USED *\n\n` +
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
    `La pantalla allmenu muestra toda la lista de comandos de arranque en una página.📖✨\n` +
    `Variable actual: * V${current} — ${_optionalChain([VARIANTS, 'access', _6 => _6[`v${current}`], 'optionalAccess', _7 => _7.name]) || "Unknown"}* 🎯\n\n` +
    `*Explicación VARIANT:*\n\n` +
    `- * V1 Simple Text ♪📝 —Lista de comandos se llamaxno imagen regular o contextInfo, mareo y rápido @-@ presionado\n\n` +
    `- * V2 Imágenes + Context ♪🖼♪—Imagen cabezal allmenu + conte completoxtfo con boletines informativos, pantalla estandarizada informativa\n\n` +
    `- * V3 Doucuments *📄 —Allmenu envió como documento de llenado con miniatura pequeña y verificar respuesta de citas, visto como archivo remi\n\n` +
    `- * Botón Interactivo V4 *🔘 —Mensaje interactivo con pinguol de un soloxecto para seleccionar categoría y rapidogreply para la navegación, pantalla moderna\n\n` +
    `- * V5 NativeFlow *✨ —Mensaje de flujo de Native con límite\n\n` +
    `# Elige la variante allmenu de putool en el crudo #👇`;

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
