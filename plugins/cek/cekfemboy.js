"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _lufemboyjs = require('../../src/scraper/lufemboy.js'); var _lufemboyjs2 = _interopRequireDefault(_lufemboyjs);
var _almikuffmpegjs = require('../../src/lib/almiku-ffmpeg.js');
var _almikuutilsjs = require('../../src/lib/almiku-utils.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
  name: "cekfemboy",
  alias: ["femboy"],
  category: "cek",
  description: "Mira tu femboy.",
  usage: ".cekfemboy <nama>",
  example: ".cekfemboy Budi",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function convertGifToMp4(buffer) {
  const tempPath = _path2.default.join(process.cwd(), "temp");
  if (!_fs2.default.existsSync(tempPath)) _fs2.default.mkdirSync(tempPath, { recursive: true });

  const id = Date.now();
  const gifPath = _path2.default.join(tempPath, `cekfemboy-${id}.gif`);
  const mp4Path = _path2.default.join(tempPath, `cekfemboy-${id}.mp4`);

  try {
    _fs2.default.writeFileSync(gifPath, buffer);
    await _almikuffmpegjs.queueFFmpeg.call(void 0, 
      `ffmpeg -y -ignore_loop 0 -i "${gifPath}" -t 30 -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -pix_fmt yuv420p -movflags faststart -preset ultrafast -an "${mp4Path}"`,
    );
    if (!_fs2.default.existsSync(mp4Path)) throw new Error("GIF convertido stuntman");
    return _fs2.default.readFileSync(mp4Path);
  } finally {
    try {
      if (_fs2.default.existsSync(gifPath)) _fs2.default.unlinkSync(gifPath);
    } catch (e2) {}
    try {
      if (_fs2.default.existsSync(mp4Path)) _fs2.default.unlinkSync(mp4Path);
    } catch (e3) {}
  }
}

async function handler(m, { sock }) {
  const mentioned = m.mentionedJid[0] || m.sender;
  const inputName = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
  const nama =
    mentioned === m.sender
      ? inputName || m.pushName || "Tu"
      : `@${mentioned.split("@")[0]}`;

  try {
    const result = _lufemboyjs2.default.call(void 0, nama);

    let buffer = null;
    try {
      buffer = await _almikuutilsjs.fetchBuffer.call(void 0, result.gif);
    } catch (e) {}

    let videoBuffer = null;
    if (buffer) {
      try {
        videoBuffer = await convertGifToMp4(buffer);
      } catch (e) {}
    }

    let txt =
      mentioned === m.sender
        ? `Hola @${mentioned.split("@")[0]}

${result.hasil}`
        : `Quieres ver el nivel femoral${mentioned.split("@")[0]} yak? 

${result.hasil}`;

    if (videoBuffer) {
      return sock.sendMedia(m.chat, videoBuffer, txt, m, {
        type: "video",
        mimetype: "video/mp4",
        gifPlayback: true,
        mentions: [mentioned],
      });
    }

    await m.reply(txt, { mentions: [mentioned] });
  } catch (err) {
    return m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
