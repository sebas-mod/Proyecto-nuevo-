"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _child_process = require('child_process');
var _util = require('util');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _os = require('os'); var _os2 = _interopRequireDefault(_os);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _teraboxjs = require('../../src/scraper/terabox.js');

const exec = _util.promisify.call(void 0, _child_process.execFile);

const pluginConfig = {
  name: "terabox",
  alias: ["tb", "tera", "teraboxdl", "tbdl"],
  category: "download",
  description: "Descargas video / Archivo desde Terabox",
  usage: ".terabox <url>",
  example: ".terabox https://terabox.com/s/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
  if (!text) {
    m.react("❌");
    return m.reply(
      `📦 *TeraBox Downloader*\n\n` +
        `Descargas de vídeo o archivo de Terabox.\n\n` +
        `*Uso:*\n` +
        `> *${m.prefix}terabox <link>*\n\n` +
        `*Ejemplo:*\n` +
        `> *${m.prefix}terabox https://terabox.com/s/xxx*\n\n` +
        `*El archivo enviado como documento, probablemente viejo @-@ de moda*`,
    );
  }

  m.react("🕕");

  try {
    const result = await _teraboxjs.TeraBoxDL.call(void 0, text);

    if (!result.status) {
      m.react("☢");
      return m.reply(`❌* TeraboxFallido*\n\n♪${result.error}`);
    }

    let caption =
      `📦 *TeraBox*\n\n` +
      `> 📌 ${result.file_name}\n` +
      `> 📏 Size: ${result.file_size}\n` +
      `♪⏱️ Duración:${result.duration}`;

    if (result.thumbnail) {
      await sock.sendMedia(m.chat, result.thumbnail, caption, m, {
        type: "image",
      });
    }

    if (result.stream_url && result.stream_url.endsWith(".m3u8")) {
      const tmpFile = _path2.default.join(_os2.default.tmpdir(), `tb_${Date.now()}.mp4`);

      await exec(
        "ffmpeg",
        [
          "-y",
          "-i",
          result.stream_url,
          "-c",
          "copy",
          "-bsf:a",
          "aac_adtstoasc",
          tmpFile,
        ],
        { timeout: 120000 },
      );

      const buffer = _fs2.default.readFileSync(tmpFile);
      _fs2.default.unlinkSync(tmpFile);

      await sock.sendMessage(
        m.chat,
        {
          document: buffer,
          mimetype: "video/mp4",
          fileName:
            (result.file_name || "video").replace(/[<>:"/\\|?*]/g, "") + ".mp4",
          caption,
        },
        { quoted: m },
      );
    } else if (result.download_url) {
      const res = await _axios2.default.get(result.download_url, {
        responseType: "arraybuffer",
        timeout: 120000,
        maxContentLength: 200 * 1024 * 1024,
      });

      const ext = result.extension || ".mp4";
      const fileName =
        (result.file_name || "file").replace(/[<>:"/\\|?*]/g, "") + ext;

      await sock.sendMessage(
        m.chat,
        {
          document: Buffer.from(res.data),
          mimetype: "application/zip",
          fileName,
          caption,
        },
        { quoted: m },
      );
    }

    m.react("✅");
  } catch (e) {
    console.error(e);
    m.react("☢");
    m.reply("❌Intenta recuperar datos de TeraboxInténtalo de nuevo más tarde.");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
