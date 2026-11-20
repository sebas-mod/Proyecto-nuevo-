"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourinapimanagerjs = require('../../src/lib/ourin-apimanager.js'); var _ourinapimanagerjs2 = _interopRequireDefault(_ourinapimanagerjs);
const pluginConfig = {
  name: "bingimage",
  alias: ["imagesearch", "carigambar", "bingimg"],
  category: "search",
  description: "Cari artwork di Pixiv",
  usage: ".carigambar <query>",
  example: ".carigambar rem",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    const query = m.text;

    if (!query) {
      return m.reply(
        `❌* ¡Introduzca las palabras clave de búsqueda! ]\n\n> Ejemplo:${m.prefix}carigambar rem`,
      );
    }

    await m.react("🔍");

    const apikey = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.neoxr]) || "Milik-Bot-OurinMD";
    const data = await _ourinapimanagerjs2.default.apiFaa.get(
      "/faa/google-image",
      {
        query,
        apikey,
      },
      { timeout: 30000 },
    );

    if (!data.status) {
      await m.react("❌");
      return m.reply(`❌* No se han encontrado resultados para: *${query}`);
    }
    const results = data.result;
    const album = await Promise.all(
      results.map(async (url) => {
        const res = await _axios2.default.get(url, { responseType: "arraybuffer" });
        return {
          image: Buffer.from(res.data),
        };
      }),
    );
    await sock.sendMessage(
      m.chat,
      {
        albumMessage: album,
      },
      { quoted: m },
    );
  } catch (error) {
    console.log(error);
    await m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
