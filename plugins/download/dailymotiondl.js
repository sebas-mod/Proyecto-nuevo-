"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _child_process = require('child_process');
var _util = require('util');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _os = require('os'); var _os2 = _interopRequireDefault(_os);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _dailymotionjs = require('../../src/scraper/dailymotion.js');

const exec = _util.promisify.call(void 0, _child_process.execFile);

const pluginConfig = {
  name: "dailymotiondl",
  alias: ["dailymotion", "dmdl"],
  category: "download",
  description: "Descargas video de Dailytion",
  usage: ".dailymotiondl <url>",
  example: ".dailymotiondl https://www.dailymotion.com/video/xxx",
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
      `🎬 *Dailymotion Downloader*\n\n` +
        `Descargar video de Dailyfication, la automatización convierte a MP4.\n\n` +
        `*Uso:*\n` +
        `> *${m.prefix}dailymotiondl <link>*\n\n` +
        `*Ejemplo:*\n` +
        `> *${m.prefix}dailymotiondl https://www.dailymotion.com/video/xxx*\n\n` +
        `Las conversiones de Ez Prosses pueden ser antiguas @-@ de moda`,
    );
  }

  m.react("🕕");

  try {
    const result = await _dailymotionjs.DailymotionDL.call(void 0, text);

    if (!result.status) {
      m.react("☢");
      return m.reply(`❌*Dailymotion Fallido*\n\n♪${result.error}`);
    }

    let caption =
      `🎬 *Dailymotion*\n\n` +
      `> 📌 ${result.title}\n` +
      `♪⏱️ Duración:${result.duration}\n` +
      `> 📺 Kualitas: ${result.quality}`;

    if (result.thumbnail) {
      await sock.sendMedia(m.chat, result.thumbnail, caption, m, {
        type: "image",
      });
    }

    if (result.video) {
      const tmpFile = _path2.default.join(_os2.default.tmpdir(), `dm_${Date.now()}.mp4`);

      await exec(
        "ffmpeg",
        [
          "-y",
          "-i",
          result.video,
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
            (result.title || "video").replace(/[<>:"/\\|?*]/g, "") + ".mp4",
          caption,
        },
        { quoted: m },
      );
    }

    m.react("✅");
  } catch (e) {
    console.error(e);
    m.react("☢");
    m.reply("❌Stempele está recogiendo los datos de la Dailyfication, inténtelo más tarde");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
