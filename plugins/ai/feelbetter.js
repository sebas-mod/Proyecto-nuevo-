"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _feebjs = require('../../src/scraper/feeb.js');
var _ourincontextjs = require('../../src/lib/ourin-context.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "feelbetter",
  alias: ["fb", "feelbetterbot", "healing"],
  category: "ai",
  description: "Chat dengan FeelBetterBot — AI yang siap mendengarkan tanpa menghakimi",
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
        `AI yang siap mendengarkan curhatan kamu — tanpa menghakimi, dengan hangat dan empatik.\n\n` +
        `*PENGGUNAAN:*\n` +
        `> *${m.prefix}feelbetter <curhatan>*\n\n` +
        `*CONTOH:*\n` +
        `> *${m.prefix}feelbetter lagi sedih nih*\n` +
        `> *${m.prefix}feelbetter aku capek banget belakangan*\n\n` +
        `_Bot ini bukan pengganti profesional, tapi bisa jadi tempat curhat yang aman_`
    );
  }

  await m.react("🕕");

  try {
    const result = await _feebjs.FeelBetter.call(void 0, text);

    if (!result.status) {
      await m.react("☢");
      return m.reply(
        `❌ *FeelBetter Gagal*\n\n> ${result.error || "Gagal mendapatkan respons"}`
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
