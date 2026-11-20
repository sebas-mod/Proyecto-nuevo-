"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _unlimitedaijs = require('../../src/scraper/unlimitedai.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "ourin-ai",
  alias: ["ourinai", "ourin"],
  category: "ai",
  description: "Chat con Ourin Al—Permanent astidubot",
  usage: ".ourin-ai <pertanyaan>",
  example: ".ourin-ai Apa itu Node.js?",
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
      `🤖 *Ourin AI*\n\n` +
        `Astif cerdas listo para ayudar\n\n` +
        `*Uso:*\n` +
        `> *${m.prefix}ourin-ai <pertanyaan>*\n\n` +
        `*Ejemplo:*\n` +
        `> *${m.prefix}ourin-ai hola, ¿cómo estás?`
    );
  }

  await m.react("🕕");

  try {
    const result = await _unlimitedaijs.UnlimitedAI.call(void 0, text, "ourin-ai");

    if (!result.status) {
      await m.react("☢");
      return m.reply(`❌ *Ourin AI Error*\n\n> ${result.error || "Gagal mendapatkan respons"}`);
    }

    await m.react("✅");
    const reply = result.answer;
    await m.reply(reply.length > 4096 ? reply.slice(0, 4096) + "..." : reply);
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
