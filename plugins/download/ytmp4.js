"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ytdljs = require('../../src/scraper/ytdl.js'); var _ytdljs2 = _interopRequireDefault(_ytdljs);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
  name: "ytmp4",
  alias: ["youtubemp4", "ytvideo"],
  category: "download",
  description: "Download video YouTube",
  usage: ".ytmp4 <url>",
  example: ".ytmp4 https://youtube.com/watch?v=xxx",
  cooldown: 20,
  energi: 2,
  isEnabled: true,
};


async function getVideoDownloadUrl(url) {
  try {
    const { data } = await _axios2.default.get(
      `https://my.izuka-api.xyz/api/downloader/ytmp4?url=${encodeURIComponent(url)}`
    );

    if (_optionalChain([data, 'optionalAccess', _ => _.status]) && _optionalChain([data, 'optionalAccess', _2 => _2.result, 'optionalAccess', _3 => _3.video_normal])) {
      const videos = data.result.video_normal.filter(v => v.ext === "mp4");
      if (videos.length > 0) {
        videos.sort((a, b) => parseInt(b.quality) - parseInt(a.quality));
        if (videos[0] && videos[0].url) {
          return videos[0].url;
        }
      }
    }
  } catch (e) {
    console.error("[YTMP4 Izuka API Error]", e.message);
  }

  const fallback = await _ytdljs2.default.call(void 0, url, "mp4");
  if (_optionalChain([fallback, 'optionalAccess', _4 => _4.status]) && _optionalChain([fallback, 'optionalAccess', _5 => _5.dl])) {
    return fallback.dl;
  }

  throw new Error(_optionalChain([fallback, 'optionalAccess', _6 => _6.mess]) || "Gagal mendapatkan video download URL");
}

async function handler(m, { sock }) {
  const url = _optionalChain([m, 'access', _7 => _7.text, 'optionalAccess', _8 => _8.trim, 'call', _9 => _9()]);
  if (!url)
    return m.reply(`Contoh: ${m.prefix}ytmp4 https://youtube.com/watch?v=xxx`);
  if (!url.includes("youtube.com") && !url.includes("youtu.be"))
    return m.reply("❌ URL harus YouTube");

  m.react("🕕");

  try {
    const downloadUrl = await getVideoDownloadUrl(url);

    await sock.sendMedia(m.chat, downloadUrl, null, m, {
      type: "video",
    });
    m.react("✅");
  } catch (err) {
    console.error("[YTMP4]", err);
    m.react("❌");
    m.reply("Gagal mengunduh video.");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
