"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikuassetmanagerjs = require('../../src/lib/almiku-asset-manager.js');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikudatabasejs = require('../../src/lib/almiku-database.js');
const pluginConfig = {
  name: "setgoodbyetype",
  alias: ["goodbyetype", "goodbyevariant", "goodbyestyle"],
  category: "owner",
  description: "Mengatur variant tampilan goodbye message",
  usage: ".setgoodbyetype",
  example: ".setgoodbyetype",
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
  6: { name: "Video", desc: "Ksenta video adiós", emoji: "🎥" },
  7: { name: "Interactive Quoted", desc: "Mensaje interactivo con cita falsa", emoji: "💬" },
  8: { name: "Super Simple", desc: "Texto de Mensaje es muy corto sin ninguna decoración", emoji: "👋" },
};
async function handler(m, { sock, db }) {
  const args = m.args || [];
  const variant = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);
  const current = db.setting("goodbyeType") || 1;
  if (variant && /^v?[1-8]$/.test(variant)) {
    const id = parseInt(variant.replace("v", ""));
    db.setting("goodbyeType", id);
    await db.save();
    await m.reply(
      `✅* GOODBANA TYPE USED*\n\n` +
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
      id: `${m.prefix}setgoodbyetype v${id}`,
    });
  }
  const buttons = [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "👋 Pilih Tipe Goodbye",
        sections: [{ title: "Daftar Tipe Goodbye", rows }],
      }),
    },
  ];
  const bodyText =
    `👋🚪 *GOODBYE TYPE*\n\n` +
    `Mostrar mensajes de Adiós mientras la foto sale del grupo🚶💨\n` +
    `Consejo activo actual: * V${current} — ${VARIANTS[current].name}* 🎯\n\n` +
    `*Explicación TIPE:*\n\n` +
    `- * V1 Canvas Images *🎨 —Para crear imagen de la automatización de lienzos contiene fotos de perfil y el nombre de la foto que surgió, enviado como imagen\n\n` +
    `- * V2 Carousel Cards *🃏 —Adjuntar carousel interactivo carousel carousel que se puede completar con acción putool, coc para la pantalla moderna\n\n` +
    `- * V3 Tex*Solo*📝 —El texto regular de mensaje sin imágenes en absoluto, mareos y minimalismo\n\n` +
    `- Grupo V4👥 —Usando contextInfo ganda grupo forwarm, mostrar ordenado con una etiqueta de bahtín\n\n` +
    `- * V5 Simple *✨ —Texto de Mensaje simplemente disertó fotos de perfil fuera, no sólo es usted capaz de acceder a los nombres informativos\n\n` +
    `- * V6 Video *🎥 —Envío de vídeo de separaciones estéticas completo a la autocaptura para el miembro\n\n` +
    `- * V7 InteractiveQuoted •💬 —Enviar mensajes interactivos y citas falsas de la persona que sale\n\n` +
    `- * V8 Super Simple *👋 —Los textos de Pessan son muy cortos sin ningún tipo de assemo ( lassas: Adiós @ usuario, de grupo. )\n\n` +
    `Elige el tipo de despedida de charco en el crudo👇`;
  await sock.sendButton(
    m.chat,
    _almikuassetmanagerjs.getAssetBuffer.call(void 0, "almiku"),
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
