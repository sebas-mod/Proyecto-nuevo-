"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _unlimitedaijs = require('../../src/scraper/unlimitedai.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "waguri-ai",
  alias: ["waguriai", "waguri"],
  category: "ai",
  description: "Chat dengan Waguri-san — Gadis pemalu yang lupa kacamata",
  usage: ".waguri-ai <pertanyaan>",
  example: ".waguri-ai Waguri-san, halo!",
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
      `👓 *Waguri-san*\n\n` +
        `> Gadis pemalu dari "The Girl I Like Forgot Her Glasses"\n> Manis, perhatian, dan sering salah tingkah~\n\n` +
        `*PENGGUNAAN:*\n` +
        `> *${m.prefix}waguri-ai <pertanyaan>*\n\n` +
        `*CONTOH:*\n` +
        `> *${m.prefix}waguri-ai Waguri-san, halo!*`
    );
  }

  await m.react("🕕");

  try {
    const result = await _unlimitedaijs.UnlimitedAI.call(void 0, text, "waguri-ai");

    if (!result.status) {
      await m.react("☢");
      return m.reply(`❌ *Waguri AI Error*\n\n> ${result.error || "Gagal mendapatkan respons"}`);
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
