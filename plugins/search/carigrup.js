"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

const pluginConfig = {
  name: "carigrup",
  alias: ["searchgrup", "findgrup", "grupwa"],
  category: "search",
  description: "Cari grup WhatsApp berdasarkan keyword",
  usage: ".carigrup <keyword>",
  example: ".carigrup gb isian",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ");

  if (!text) {
    return m.reply(
      `🔍 *ᴄᴀʀɪ ɢʀᴜᴘ ᴡᴀ*\n\n> Masukkan keyword pencarian\n\n\`Contoh: ${m.prefix}carigrup gb isian\``,
    );
  }

  m.react("🕕");

  try {
    const url = `https://api.cuki.biz.id/api/search/whatsapp-group?apikey=${_configjs2.default.APIkey.cuki}&query=${encodeURIComponent(text)}`;
    const { data } = await _axios2.default.get(url, { timeout: 30000 });

    if (!data.status || !_optionalChain([data, 'access', _ => _.data, 'optionalAccess', _2 => _2.groups, 'optionalAccess', _3 => _3.length])) {
      m.react("❌");
      return m.reply(`❌ Tidak ditemukan grup untuk keyword *${text}*`);
    }

    const groups = data.data.groups;
    let result =
      `🔍 *ᴄᴀʀɪ ɢʀᴜᴘ ᴡᴀ*\n\n` +
      `📌 Keyword: *${data.data.query}*\n` +
      `📊 Total: *${data.data.total}* grup ditemukan\n`;

    groups.forEach((g, i) => {
      result +=
        `\n━━━━━━━━━━━━━━━\n` +
        `*${i + 1}. ${g.title}*\n` +
        `📅 ${g.date}\n` +
        `🏷️ ${g.category}\n` +
        `📝 ${g.description ? g.description.slice(0, 150) + (g.description.length > 150 ? "..." : "") : "-"}\n` +
        `🔗 ${g.group_link}`;
    });

    m.react("✅");
    await m.reply(result);
  } catch (error) {
    console.log(error);
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
