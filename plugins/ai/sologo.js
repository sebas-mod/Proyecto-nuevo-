"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "sologo",
  alias: ["ailogo", "bikinlogo"],
  category: "ai",
  description: "Creación de logos usando AI de texto (propont )",
  usage: ".sologo <prompt>",
  example: ".sologo Kucing lucu warna biru",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const prompt = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]) || m.args.join(" ");

  if (!prompt) {
    return m.reply("❌Ponga en una descripción del logo para hacer.\n\nEjemplo:`Un robot de sodio.`");
  }

  await m.react("🕕");

  try {
    const apiUrl = `https://api.nexray.eu.cc/ai/sologo?prompt=${encodeURIComponent(prompt)}`;
    const res = await _axios2.default.get(apiUrl, {
      timeout: 120000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const data = res.data;
    if (!data.status || !data.result || data.result.length === 0) {
      await m.react("❌");
      return m.reply("⚠Prueba con otro aviso.");
    }

    const logo = data.result[0];

    const caption = `🎨 *SOLOGO AI* 🎨\n\n` +
      `*Prompt:* ${prompt}\n` +
      `*Judul:* ${logo.title}\n` +
      `*Descripción:*${logo.desc}\n` +
      `*Tipe:* ${logo.logo_type || "origin"}`;

    await sock.sendMessage(m.chat, {
      image: { url: logo.thumbnail },
      caption: caption
    }, { quoted: m });

    await m.react("✅");

  } catch (error) {
    console.error("[SoLogo AI]", error.message);
    await m.react("☢");
    m.reply("😔Fue un error procesar la AI.");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
