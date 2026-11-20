"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _cheerio = require('cheerio');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "murrotal",
  alias: ["murottal", "audioquran", "quraudio"],
  category: "islamic",
  description: "Dengarkan audio murottal Al-Quran berdasarkan surah",
  usage: ".murrotal <nama surah>",
  example: ".murrotal al fatihah",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const query = _optionalChain([m, 'access', _ => _.args, 'optionalAccess', _2 => _2.join, 'call', _3 => _3(" "), 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()]);

  if (!query) {
    return m.reply(
      `🎧 *MURROTTAL*\n\n` +
        `" Ingrese el nombre de Sura "\n\n` +
        `\`Contoh: ${m.prefix}murrotal al fatihah\`\n` +
        `\`Contoh: ${m.prefix}murrotal ar rahman\``,
    );
  }

  m.react("🔍");

  try {

    const res = await fetch("https://islamipedia.id/murottal/");
    const html = await res.text();
    const $ = _cheerio.load.call(void 0, html);

    const data = $(".surah-item")
      .map((i, el) => ({
        no: parseInt($(el).find("h5").text().split(".")[0]),
        surah: ($(el).attr("data-title") || "").toLowerCase(),
        arti: $(el).find("p").text().trim(),
        audio: $(el).attr("data-audio") || "",
      }))
      .get();

    const q = query.toLowerCase();
    const find = data.find((v) =>
      v.surah.replace(/[^a-z0-9]/g, "").includes(q.replace(/[^a-z0-9]/g, "")),
    );

    if (!find || !find.audio) {
      m.react("❌");
      return m.reply(`❌ Surah *${query}* not found`);
    }

    m.react("✅");

    await sock.sendMedia(m.chat, find.audio, null, m, {
      type: "audio",
    });
  } catch (e) {
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
