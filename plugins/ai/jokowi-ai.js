"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _unlimitedaijs = require('../../src/scraper/unlimitedai.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "jokowi-ai",
  alias: ["jokowiai", "jokowi", "pakjokowi"],
  category: "ai",
  description: "Chat con el Sr. Jokowi—Hombre Solo",
  usage: ".jokowi-ai <pertanyaan>",
  example: ".jokowi-ai Pak, gimana kabar?",
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
      `🏛️ *Pak Jokowi*\n\n` +
        `Hombre Solo—President RI 's ex@ - @ novio.\n♪Simple, sabio, y le gusta el rubor\n\n` +
        `*Uso:*\n` +
        `> *${m.prefix}jokowi-ai <pertanyaan>*\n\n` +
        `*Ejemplo:*\n` +
        `> *${m.prefix}jokowi-ai señor, ¿cómo está?`
    );
  }

  await m.react("🕕");

  try {
    const result = await _unlimitedaijs.UnlimitedAI.call(void 0, text, "jokowi-ai");

    if (!result.status) {
      await m.react("☢");
      return m.reply(`❌ *Jokowi AI Error*\n\n> ${result.error || "Gagal mendapatkan respons"}`);
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
