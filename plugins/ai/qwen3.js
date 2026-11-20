"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _qwen3js = require('../../src/scraper/qwen3.js');
var _ourincontextjs = require('../../src/lib/ourin-context.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "qwen3",
  alias: ["qwen", "qw3"],
  category: "ai",
  description: "Chat conQwen3 80B via OverChat",
  usage: ".qwen3 <pertanyaan>",
  example: ".qwen3 Apa itu machine learning?",
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
      `🔵 *Qwen3 80B*\n\n` +
        `Pregúntale a la AI.QWen3—Un gran modelo de Alibaba que conoce cualquier idioma.\n\n` +
        `*Uso:*\n` +
        `> *${m.prefix}qwen3 <pertanyaan>*\n\n` +
        `*Ejemplo:*\n` +
        `> *${m.prefix}¿Qué es un aprendizaje automático?\n` +
        `> *${m.prefix}qwen3 Crea resep plato Indonesia*\n\n` +
        `* Modelo 80B, tan viejo de moda pero la respuesta es buena*`
    );
  }

  await m.react("🕕");

  try {
    const result = await _qwen3js.Qwen3.call(void 0, text);

    if (!result.status) {
      await m.react("☢");
      return m.reply(
        `❌*Qwen3 Fallido*\n\n•${result.error || "Gagal mendapatkan respons"}`
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
