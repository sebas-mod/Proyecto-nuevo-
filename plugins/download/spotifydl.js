"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

const pluginConfig = {
  name: "spotifydl",
  alias: ["spdl", "spotify-dl", "spotdl"],
  category: "download",
  description: "Descarga tu canción favorita de Spotify.",
  usage: ".spdl <enlace>",
  example: ".spdl https://open.spotify.com/track/...",
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);

  if (!text || !/open\.spotify\.com\/track/i.test(text)) {
    return m.reply("❌ *Falta el enlace de Spotify o no es válido.*\n\nDebes enviar un enlace válido a una canción de Spotify (track).\n\nEjemplo: `.spdl https://open.spotify.com/track/3RY0NyQQXxuAiyk5eAS4fC`");
  }

  await m.react("🕕");

  try {
    const apiUrl = `https://api.nexray.eu.cc/downloader/spotify?url=${encodeURIComponent(text)}`;
    const res = await _axios2.default.get(apiUrl);
    const data = res.data;

    if (!data.status || !data.result || !data.result.url) {
      await m.react("❌");
      return m.reply("⚠ No se pudo obtener la canción.\n\nEl servidor no respondió con un enlace válido.");
    }

    const { title, artist, url } = data.result;
    const filename = `${artist || "Spotify"} - ${title || "Audio"}.mp3`;

    await sock.sendMessage(m.chat, {
      audio: { url: url },
      mimetype: "audio/mpeg",
      fileName: filename,
      ptt: false
    }, { quoted: m });

    await m.react("✅");

  } catch (error) {
    console.error("[Spotify DL Error]", error);
    await m.react("❌");
    m.reply("😔 *No se pudo procesar la canción de Spotify.* Inténtalo de nuevo más tarde.");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
