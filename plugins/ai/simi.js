"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);

const pluginConfig = {
  name: "simi",
  alias: ["simisimi"],
  category: "ai",
  description: "Ngobrol santai bareng SimiSimi",
  usage: ".simi <pesan>",
  example: ".simi Halo Simi!",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ") || _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);

  if (!text) {
    return m.reply("❌¿De qué hablas con Simi?\n\nEjemplo:`- ¡Simi Hola Simi!`");
  }

  await m.react("🕕");

  try {
    const apiUrl = `https://api.nexray.eu.cc/ai/simisimi?text=${encodeURIComponent(text)}`;
    const res = await _axios2.default.get(apiUrl, {
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const data = res.data;
    if (!data.status || !data.result) {
      await m.react("❌");
      return m.reply("⚠Simi está fuera de control, no hay necesidad de correr.");
    }

    await m.reply(data.result);
    await m.react("✅");

  } catch (error) {
    console.error("[SimiSimi]", error.message);
    await m.react("☢");
    m.reply("😔Simi no devolvió su mensaje.");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
