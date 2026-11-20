"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

const pluginConfig = {
  name: "douyindl",
  alias: ["douyin", "dydl"],
  category: "download",
  description: "Descargar video / audio de Douyin ( TikTok China )",
  usage: ".douyindl <url>",
  example: ".douyindl https://v.douyin.com/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function douyinFetch(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await _axios2.default.get(`https://api.azbry.com/api/downloader/douyin?url=${encodeURIComponent(url)}`, { timeout: 30000 });
      if (_optionalChain([res, 'access', _ => _.data, 'optionalAccess', _2 => _2.status]) && _optionalChain([res, 'access', _3 => _3.data, 'optionalAccess', _4 => _4.result])) {
        return res.data;
      }
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error("Datos de búsqueda desde el servidor");
}

async function handler(m, { sock }) {
  const text = _optionalChain([m, 'access', _5 => _5.text, 'optionalAccess', _6 => _6.trim, 'call', _7 => _7()]);
  if (!text) {
    m.react("❌");
    return m.reply(
      `🎵 *Douyin Downloader*\n\n` +
        `Descarga de vídeo o audio de Douyin.\n\n` +
        `*Uso:*\n` +
        `> *${m.prefix}douyindl <link>*\n\n` +
        `*Ejemplo:*\n` +
        `> *${m.prefix}douyindl https://v.douyin.com/xxx*`,
    );
  }

  m.react("🕕");

  try {
    const data = await douyinFetch(text);
    const result = data.result;

    let caption = `🎵 *${result.platform || "Douyin"}*\n\n${result.title || ""}`;

    if (result.video) {
      await sock.sendMedia(m.chat, result.video, caption, m, {
        type: "video",
      });
    }

    if (result.audio) {
      await sock.sendMedia(m.chat, result.audio, null, m, {
        type: "audio",
      });
    }

    m.react("✅");
  } catch (e) {
    console.error(e);
    m.react("☢");
    m.reply("❌Gagal toma los datos de Douyin, inténtelo más tarde");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
