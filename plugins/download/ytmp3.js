"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ytdljs = require('../../src/scraper/ytdl.js'); var _ytdljs2 = _interopRequireDefault(_ytdljs);
const pluginConfig = {
  name: "ytmp3",
  alias: ["youtubemp3", "ytaudio"],
  category: "download",
  description: "Download audio YouTube",
  usage: ".ytmp3 <url>",
  example: ".ytmp3 https://youtube.com/watch?v=xxx",
  cooldown: 20,
  energi: 2,
  isEnabled: true,
};

async function getAudioDownload(url) {
  try {
    const { data } = await _axios2.default.get(
      `https://my.izuka-api.xyz/api/downloader/ytmp3?url=${encodeURIComponent(url)}`, { timeout: 60000 }
    );
    const download = _optionalChain([data, 'optionalAccess', _ => _.result, 'optionalAccess', _2 => _2.download_url]);
    const title = _optionalChain([data, 'optionalAccess', _3 => _3.result, 'optionalAccess', _4 => _4.title]);
    if (download) {
      return { download, title };
    }
  } catch (e) {}

  const fallback = await _ytdljs2.default.call(void 0, url, "mp3");
  if (_optionalChain([fallback, 'optionalAccess', _5 => _5.status]) && _optionalChain([fallback, 'optionalAccess', _6 => _6.dl])) {
    return { download: fallback.dl, title: fallback.title, isFallback: true };
  }

  throw new Error(_optionalChain([fallback, 'optionalAccess', _7 => _7.mess]) || "Gagal mendapatkan audio download URL");
}

async function handler(m, { sock }) {
  const url = _optionalChain([m, 'access', _8 => _8.text, 'optionalAccess', _9 => _9.trim, 'call', _10 => _10()]);
  if (!url)
    return m.reply(`Contoh: ${m.prefix}ytmp3 https://youtube.com/watch?v=xxx`);
  if (!url.includes("youtube.com") && !url.includes("youtu.be"))
    return m.reply("❌ URL harus YouTube");

  m.react("🕕");

  try {
    const result = await getAudioDownload(url);

    if (result.isFallback) {
      const mp3Buffer = await _ytdljs.fallbackToMp3Buffer.call(void 0, result.download);
      await sock.sendMessage(
        m.chat,
        {
          audio: mp3Buffer,
          mimetype: "audio/mpeg",
          ptt: false,
          fileName: `${result.title || "audio"}.mp3`,
        },
        { quoted: m },
      );
    } else {
      await sock.sendMedia(m.chat, result.download, null, m, {
        type: "audio",
        mimetype: "audio/mpeg",
        ptt: false,
        fileName: result.title || "audio.mp3",
      });
    }
    m.react("✅");
  } catch (err) {
    console.error("[YTMP3]", err);
    m.react("❌");
    m.reply("Gagal mengunduh audio.");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
