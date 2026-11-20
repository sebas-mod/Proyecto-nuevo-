"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "spotplay",
  alias: ["splay", "sp"],
  category: "search",
  description: "Música de Play de Spotify",
  usage: ".spotplay <query>",
  example: ".spotplay neffex grateful",
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const query = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
  if (!query)
    return m.reply(`⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n> \`${m.prefix}spotplay <query>\``);

  await m.react("🕕");

  try {
    const searchUrl = `https://my.izuka-api.xyz/api/search/spotify-search?query=${encodeURIComponent(query)}`;
    const searchRes = await _axios2.default.get(searchUrl, { timeout: 30000 });
    const searchData = searchRes.data;

    if (!_optionalChain([searchData, 'optionalAccess', _4 => _4.status]) || !_optionalChain([searchData, 'optionalAccess', _5 => _5.result]) || searchData.result.length === 0) {
      await m.react("❌");
      return m.reply("❌El Spotify Cancion no fue encontrado.");
    }

    const firstTrack = searchData.result[0];
    const dlUrl = `https://my.izuka-api.xyz/api/downloader/spotify?url=${encodeURIComponent(firstTrack.url)}`;
    const dlRes = await _axios2.default.get(dlUrl, { timeout: 30000 });
    const dlData = dlRes.data;

    if (!_optionalChain([dlData, 'optionalAccess', _6 => _6.status]) || !_optionalChain([dlData, 'optionalAccess', _7 => _7.result, 'optionalAccess', _8 => _8.download_url])) {
      await m.react("❌");
      return m.reply("❌Stempel toma las descargas de enlaces Spotify canción.");
    }

    const result = dlData.result;

    await sock.sendMedia(m.chat, result.download_url, null, m, {
      type: "audio",
      mimetype: "audio/mpeg",
      ptt: false,
      fileName: `${result.artist || "Spotify"} - ${result.title || "audio"}.mp3`,
    });

    await m.react("✅");
  } catch (e) {
    console.error("[Spotplay Error]", e);
    await m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
