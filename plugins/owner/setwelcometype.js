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
    desc: "Lona de juego con fotos de perfil",
    emoji: "🎨",
  },
  2: {
    name: "Carousel Cards",
    desc: "Carousel interactivo cartu con pubs",
    emoji: "🃏",
  },
  3: {
    name: "Text Only",
    desc: "Pessan texto imagen mínima sin minimalista",
    emoji: "📝",
  },
  4: { name: "Group", desc: "ContextInfo group style", emoji: "👥" },
  5: { name: "Simple", desc: "Mensaje", emoji: "✨" },
  6: { name: "Video", desc: "Kirim video perkenalan", emoji: "🎥" },
  7: { name: "Interactive Quoted", desc: "Mensaje interactivo con cita falsa", emoji: "💬" },
  8: { name: "Super Simple", desc: "Texto de Mensaje es muy corto sin ninguna decoración", emoji: "👋" },
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
      `✅* WeLCOME TYPE USED*\n\n` +
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
    `Mostrar mensajes de bienvenida cuando nuevas fotos entran en grupo🚪✨\n` +
    `Consejo activo actual: * V${current} — ${VARIANTS[current].name}* 🎯\n\n` +
    `*Explicación TIPE:*\n\n` +
    `- * V1 Canvas Images *🎨 —Para crear imágenes de automatización de lienzos contiene fotos de perfil y nuevas fotos llamadas se unen, luego se envían como imágenes\n\n` +
    `- * V2 Carousel Cards *🃏 —Carousel interactivo carousel que se puede completar con acción putool, coc para grupo que quiere pantalla moderna\n\n` +
    `- * V3 Tex*Solo*📝 —El texto regular de mensaje sin imágenes en absoluto, mareos y minimalismo\n\n` +
    `- Grupo V4👥 —Usando contextInfo ganda grupo forwarm, mostrar ordenado con una etiqueta de bahtín\n\n` +
    `- * V5 Simple *✨ —El texto de Mensaje es simplemente desarmado con fotos de perfil que se unen, no sólo es usted capaz de acceder a la información\n\n` +
    `- * V6 Video *🎥 —Enviar un video de la emocionante bienvenida completada saht de la captura para la foto\n\n` +
    `- * V7 InteractiveQuoted •💬 —Enviar mensajes interactivos y citas falsas de unirse a la gente\n\n` +
    `- * V8 Super Simple *👋 —Los textos de Pessan son muy cortos sin ningún hispanico ( Dzh: Hola @ usuario, bienvenido a grupo. )\n\n` +
    `# Elige el tipo de bienvenida del charco en el bayou👇`;
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
