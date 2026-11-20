"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourincontextjs = require('../../src/lib/ourin-context.js');
const NEOXR_APIKEY = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.neoxr]) || "Milik-Bot-OurinMD";

const pluginConfig = {
  name: "emojitoimage",
  alias: ["emoji2img", "emojiimg", "e2i"],
  category: "tools",
  description: "Konversi emoji ke gambar HD (style Apple)",
  usage: ".emojitoimage <emoji> [style]",
  example: ".emojitoimage 😳 apple",
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

const STYLES = [
  "apple",
  "google",
  "microsoft",
  "samsung",
  "whatsapp",
  "twitter",
  "facebook",
];

async function handler(m, { sock }) {
  const args = m.args || [];
  const emoji = _optionalChain([args, 'access', _3 => _3[0], 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()]);
  const style = _optionalChain([args, 'access', _6 => _6[1], 'optionalAccess', _7 => _7.toLowerCase, 'call', _8 => _8()]) || "apple";

  if (!emoji) {
    return m.reply(
      `🖼️ *ᴇᴍᴏᴊɪ ᴛᴏ ɪᴍᴀɢᴇ*\n\n` +
        `> Konversi emoji ke gambar HD\n\n` +
        `*Format:*\n` +
        `> \`${m.prefix}emojitoimage <emoji> [style]\`\n\n` +
        `*Contoh:*\n` +
        `> \`${m.prefix}emojitoimage 😳 apple\`\n\n` +
        `*Style tersedia:*\n` +
        `> ${STYLES.join(", ")}`,
    );
  }

  const validStyle = STYLES.includes(style) ? style : "apple";

  m.react("🖼️");

  try {
    const apiUrl = `https://api.neoxr.eu/api/emoimg?q=${encodeURIComponent(emoji)}&style=${validStyle}&apikey=${NEOXR_APIKEY}`;
    const { data } = await _axios2.default.get(apiUrl, { timeout: 15000 });

    if (!_optionalChain([data, 'optionalAccess', _9 => _9.status]) || !_optionalChain([data, 'optionalAccess', _10 => _10.data, 'optionalAccess', _11 => _11.url])) {
      m.react("❌");
      return m.reply("❌ *ɢᴀɢᴀʟ*\n\n> Emoji tidak ditemukan atau API error");
    }

    const imgUrl = data.data.url;

    await sock.sendMedia(
      m.chat,
      imgUrl,
      `🖼️ *ᴇᴍᴏᴊɪ ᴛᴏ ɪᴍᴀɢᴇ*\n\n> Emoji: ${emoji}\n> Style: ${validStyle}\n> Code: ${data.data.code || "-"}`,
      m,
      { type: "image", contextInfo: _ourincontextjs.saluranCtx.call(void 0, ) },
    );

    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
