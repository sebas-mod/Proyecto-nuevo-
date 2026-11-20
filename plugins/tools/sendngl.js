"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourinapimanagerjs = require('../../src/lib/ourin-apimanager.js'); var _ourinapimanagerjs2 = _interopRequireDefault(_ourinapimanagerjs);
const pluginConfig = {
  name: "sendngl",
  alias: [],
  category: "tools",
  description: "Send NGL",
  usage: ".sendngl <url> | <text>",
  example: ".sendngl https://ngl.link/xxxx | hai",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.split, 'call', _3 => _3("|")]);
  const [link, kata] = text;
  if (!link)
    return m.reply(
      `* Enlace NGL De él MANA *\nEpirame:\`${_optionalChain([m, 'optionalAccess', _4 => _4.prefix])}sendnglhttps://ngl.link/xxxx| hola`,
    );
  if (!kata)
    return m.reply(
      `> 91; The SAME Palabra MANA > 93;\n\nEjemplo:\`${_optionalChain([m, 'optionalAccess', _5 => _5.prefix])}sendnglhttps://ngl.link/xxxx| hola`,
    );
  m.react("🎴");

  try {
    await _ourinapimanagerjs2.default.cuki.sendNgl(
      {
        link,
        text: kata,
      },
      {
        timeout: 30000,
      },
    );

    m.react("✅");

    await sock.sendMessage(
      m.chat,
      {
        text: `✅* DON *\n\n¡Funciónó!\nMetas:${link}\nPesan: ${kata}`,
      },
      { quoted: m },
    );
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
