"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);

const pluginConfig = {
  name: "musicmaker",
  alias: ["bikinlagu", "suno"],
  category: "maker",
  description: "Crear música o canción usando AI de texto ( propont )",
  usage: ".musicmaker <prompt>",
  example: ".musicmaker Lagu sedih tentang perpisahan dengan musik piano",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 3,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const prompt = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]) || m.args.join(" ");

  if (!prompt) {
    return m.reply("❌Ponga en la descripción de la canción que desea crear.\n\nEjemplo:`- Los músicos románticos de cancion de cerámica.`");
  }

  await m.react("🕕");

  try {
    const apiUrl = `https://api.nexray.eu.cc/ai/suno?prompt=${encodeURIComponent(prompt)}`;
    
    const res = await _axios2.default.get(apiUrl, {
      timeout: 180000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const data = res.data;
    if (!data.status || !data.result) {
      await m.react("❌");
      return m.reply("⚠Prueba con otro aviso.");
    }

    const r = data.result;

    const caption = `🎵 *MUSIC MAKER AI* 🎵\n\n` +
      `*Judul:* ${r.title}\n` +
      `*Tags:* ${r.tags}\n` +
      `*Duración:*${r.duration} detik\n\n` +
      `*Lirik:*\n${r.lyrics}`;

    await sock.sendMessage(m.chat, {
      audio: { url: r.url },
      mimetype: "audio/mpeg",
      ptt: false,
    }, { quoted: m });

    await sock.sendMessage(m.chat, {
      image: { url: r.thumbnail },
      caption: caption
    }, { quoted: m });

    await m.react("✅");

  } catch (error) {
    console.error("[Music Maker AI]", error.message);
    await m.react("☢");
    m.reply("😔Fue un error procesar la creación de la canción a Al.");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
