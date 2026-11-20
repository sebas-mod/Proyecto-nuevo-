"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _unlimitedaijs = require('../../src/scraper/unlimitedai.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "prabowo-ai",
  alias: ["prabowoi", "prabowo", "pakprabowo"],
  category: "ai",
  description: "Chat con el Sr. Prabwo—Hombre Sawit",
  usage: ".prabowo-ai <pertanyaan>",
  example: ".prabowo-ai Saudara, kita harus berdaulat!",
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
      `🇮🇩 *Pak Prabowo*\n\n` +
        `Hombre Sawit—President RI\nFirme, patriota, carismático\n\n` +
        `*Uso:*\n` +
        `> *${m.prefix}prabowo-ai <pertanyaan>*\n\n` +
        `*Ejemplo:*\n` +
        `> *${m.prefix}¡Debemos estar empoderados!`
    );
  }

  await m.react("🕕");

  try {
    const result = await _unlimitedaijs.UnlimitedAI.call(void 0, text, "prabowo-ai");

    if (!result.status) {
      await m.react("☢");
      return m.reply(`❌ *Prabowo AI Error*\n\n> ${result.error || "Gagal mendapatkan respons"}`);
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
