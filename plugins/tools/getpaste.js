"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourintimejs = require('../../src/lib/ourin-time.js'); var timeHelper = _interopRequireWildcard(_ourintimejs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
  name: "getpaste",
  alias: ["pastebin", "getpb"],
  category: "tools",
  description: "Contenido de Toma de Pastebin",
  usage: ".getpaste <link pastebin>",
  example: ".getpaste https://pastebin.com/Gu8RZaqv",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

class GetPastebin {
  constructor() {
    this.url = "https://pastebin.com/raw/";
  }

  _id(link) {
    const match = link.match(/pastebin\.com\/(?:raw\/)?([a-zA-Z0-9]+)/);
    return match ? match[1] : link;
  }

  async fetch(link) {
    const id = this._id(link);
    if (!id) return null;

    try {
      const req = await fetch(this.url + id);
      if (!req.ok) return null;
      return await req.text();
    } catch (e) {
      return null;
    }
  }
}

async function handler(m, { sock }) {
  const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);

  if (!text || !text.includes("pastebin.com")) {
    return m.reply(
      `📋 *ɢᴇᴛ ᴘᴀsᴛᴇʙɪɴ*\n\n` +
      `Pon el enlace al pastebin válido\n\n` +
      `> Ejemplo:\`${m.prefix}getpaste https://pastebin.com/Gu8RZaqv\``,
    );
  }

  m.react("📋");

  try {
    const data = await new GetPastebin().fetch(text);
    await m.reply(data);
    m.react("✅");
  } catch (err) {
    m.react('☢');
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
  }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
