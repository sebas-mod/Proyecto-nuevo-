"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _almikucontextjs = require('../../src/lib/almiku-context.js');
const NEOXR_APIKEY = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.neoxr]) || "Milik-Bot-OurinMD";

const pluginConfig = {
  name: "emojitoanimasi",
  alias: ["emoji2sticker", "emojisticker", "e2s"],
  category: "tools",
  description: "Konversi emoji ke sticker animasi",
  usage: ".emojitoanimasi <emoji>",
  example: ".emojitoanimasi 😳",
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const emoji = _optionalChain([m, 'access', _3 => _3.text, 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()]);

  if (!emoji) {
    return m.reply(
      `🎭 *ᴇᴍᴏᴊɪ ᴛᴏ ᴀɴɪᴍᴀsɪ*\n\n` +
        `Conversión emoji a pegatinas animaciones\n\n` +
        `*Ejemplo:*\n` +
        `> \`${m.prefix}emojitoanimasi 😳\``,
    );
  }

  m.react("🎭");

  try {
    const apiUrl = `https://api.neoxr.eu/api/emojito?q=${encodeURIComponent(emoji)}&apikey=${NEOXR_APIKEY}`;
    const { data } = await _axios2.default.get(apiUrl, { timeout: 15000 });

    if (!_optionalChain([data, 'optionalAccess', _6 => _6.status]) || !_optionalChain([data, 'optionalAccess', _7 => _7.data, 'optionalAccess', _8 => _8.url])) {
      m.react("❌");
      return m.reply("❌*ɢᴀɢᴀʟ*\n\n*Emoji no se encuentra ni error de API*");
    }

    const webpUrl = data.data.url;

    const webpRes = await _axios2.default.get(webpUrl, {
      responseType: "arraybuffer",
      timeout: 15000,
    });
    const webpBuffer = Buffer.from(webpRes.data);

    await sock.sendMessage(
      m.chat,
      {
        sticker: webpBuffer,
        contextInfo: _almikucontextjs.saluranCtx.call(void 0, ),
      },
      { quoted: m },
    );

    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
