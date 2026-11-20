"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const pluginConfig = {
  name: "ttp",
  alias: ["texttopicture"],
  category: "maker",
  description: "Crear una pegatina fresca del texto",
  usage: ".ttp <teks>",
  example: ".ttp Hai Cantik",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ") || _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);

  if (!text) {
    return m.reply("❌¿Dónde está el texto?\n\nTienes que poner en los textos que las pegatinas quieren hacer.\n\nEjemplo:`*Eres hermosa*`");
  }

  await m.react("🕕");

  try {
    const apiUrl = `https://api.nexray.eu.cc/maker/ttp?text=${encodeURIComponent(text)}`;

    const res = await _axios2.default.get(apiUrl, {
      responseType: "arraybuffer",
      timeout: 30000
    });

    const imageBuffer = Buffer.from(res.data);

    await sock.sendImageAsSticker(m.chat, imageBuffer, m, {
      packname: _configjs2.default.sticker.packname,
      author: _configjs2.default.sticker.author,
    });

    await m.react("✅");

  } catch (err) {
    console.error("[TTP Maker]", err.message);
    await m.react("☢");
    m.reply("😔* Es un problema en nuestro sistema *\n\nEl sistema no pudo contactar con el servidor de pegatina.");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
