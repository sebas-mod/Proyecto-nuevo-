"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _feebjs = require('../../src/scraper/feeb.js');
var _ourincontextjs = require('../../src/lib/ourin-context.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "feelbetter",
  alias: ["fb", "feelbetterbot", "healing"],
  category: "ai",
  description: "Chat con Sentirse Mejor—Al 's ready without even saying a word.",
  usage: ".feelbetter <curhat/pertanyaan>",
  example: ".feelbetter lagi sedih nih",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ");
  if (!text) {
    return m.reply(
      `💚 *FeelBetterBot*\n\n` +
        `Al listo para escuchar tu estafa.—Sin tomar un baño, con brazos calientes y brazos vacíos.\n\n` +
        `*Uso:*\n` +
        `> *${m.prefix}feelbetter <curhatan>*\n\n` +
        `*Ejemplo:*\n` +
        `> *${m.prefix}Feelbetter 's on the line.\n` +
        `> *${m.prefix}# Sentir la mantequilla que soy una trampa detrás #\n\n` +
        `Esto no es un sustituto profesional, pero podría ser un lugar seguro para compartir un secreto.`
    );
  }

  await m.react("🕕");

  try {
    const result = await _feebjs.FeelBetter.call(void 0, text);

    if (!result.status) {
      await m.react("☢");
      return m.reply(
        `❌*FeelBetter Fallido*\n\n♪${result.error || "Gagal mendapatkan respons"}`
      );
    }

    await m.react("✅");

    const reply = `${result.answer}`;
    await m.reply(reply.length > 4096 ? reply.slice(0, 4096) + "..." : reply, {
      contextInfo: _ourincontextjs.saluranCtx.call(void 0, ),
    });
  } catch (e) {
    console.error(e);
    await m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
