"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _child_process = require('child_process');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourincontextjs = require('../../src/lib/ourin-context.js');
const pluginConfig = {
  name: "ttselon",
  alias: ["elontts", "ttselonmusk"],
  category: "tts",
  description: "Text para hablar con la voz Elon Musk",
  usage: ".ttselon <text>",
  example: ".ttselon To Mars!",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

function convertToOpus(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const ffmpeg = _child_process.spawn.call(void 0, "ffmpeg", [
      "-i",
      inputPath,
      "-c:a",
      "libopus",
      "-b:a",
      "64k",
      "-vbr",
      "on",
      "-compression_level",
      "10",
      "-y",
      outputPath,
    ]);
    ffmpeg.on("close", (code) =>
      code === 0 ? resolve(true) : reject(new Error(`FFmpeg error`)),
    );
    ffmpeg.on("error", reject);
  });
}

async function handler(m, { sock }) {
  const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
  if (!text)
    return m.reply(
      `🚀*ᴇʟᴏɴ ᴍᴜSᴋ ᴛᴛs ♪\n\n> Usa: \`${m.prefix}ttselon <text>\``,
    );

  m.react("🚀");

  try {
    const res = await _axios2.default.get(
      `https://api.emiliabot.my.id/tools/text-to-speech?text=${encodeURIComponent(text)}`,
      { timeout: 60000 },
    );
    const voice = _optionalChain([res, 'access', _4 => _4.data, 'optionalAccess', _5 => _5.result, 'optionalAccess', _6 => _6.find, 'call', _7 => _7((v) => v.elon_musk && !v.error)]);
    if (!voice) {
      m.react("❌");
      return m.reply(`❌ Elon voice error. Intenta TTS otro.`);
    }

    const tempDir = _path2.default.join(process.cwd(), "temp");
    if (!_fs2.default.existsSync(tempDir)) _fs2.default.mkdirSync(tempDir, { recursive: true });

    const wavPath = _path2.default.join(tempDir, `tts_${Date.now()}.wav`);
    const opusPath = _path2.default.join(tempDir, `tts_${Date.now()}.ogg`);

    const audioRes = await _axios2.default.get(voice.elon_musk, {
      responseType: "arraybuffer",
    });
    _fs2.default.writeFileSync(wavPath, Buffer.from(audioRes.data));
    await convertToOpus(wavPath, opusPath);

    await sock.sendMessage(
      m.chat,
      {
        audio: _fs2.default.readFileSync(opusPath),
        mimetype: "audio/ogg; codecs=opus",
        ptt: true,
        contextInfo: _ourincontextjs.saluranCtx.call(void 0, ),
      },
      { quoted: m },
    );

    _fs2.default.unlinkSync(wavPath);
    _fs2.default.unlinkSync(opusPath);
    m.react("✅");
  } catch (err) {
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
