"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _os = require('os'); var _os2 = _interopRequireDefault(_os);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _fluentffmpeg = require('fluent-ffmpeg'); var _fluentffmpeg2 = _interopRequireDefault(_fluentffmpeg);
var _ffmpeg = require('@ffmpeg-installer/ffmpeg'); var _ffmpeg2 = _interopRequireDefault(_ffmpeg);

_fluentffmpeg2.default.setFfmpegPath(_ffmpeg2.default.path);

const pluginConfig = {
  name: "hdvid",
  alias: ["hdvideo", "enhancevid", "hdv"],
  category: "tools",
  description: "Meningkatkan kualitas video menjadi HD dengan pure FFMPEG",
  usage: ".hdvid (reply video)",
  example: ".hdvid",
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
  cooldown: 120,
  energi: 3,
  isEnabled: true,
};

async function handler(m, { sock }) {
  let isVideoMessage = m.isVideo || (m.quoted && m.quoted.type === "videoMessage");
  let isDocumentMessage = (m.type === "documentMessage" && _optionalChain([m, 'access', _ => _.message, 'optionalAccess', _2 => _2.documentMessage, 'optionalAccess', _3 => _3.mimetype, 'optionalAccess', _4 => _4.startsWith, 'call', _5 => _5("video")])) || (m.quoted && m.quoted.type === "documentMessage" && _optionalChain([m, 'access', _6 => _6.quoted, 'access', _7 => _7.message, 'optionalAccess', _8 => _8.documentMessage, 'optionalAccess', _9 => _9.mimetype, 'optionalAccess', _10 => _10.startsWith, 'call', _11 => _11("video")]));

  if (!isVideoMessage && !isDocumentMessage) {
    let txt = `📹 *HD VIDEO ENHANCER* 📹\n\n`;
    txt += `Halo kak! Punya video yang buram? Aku bisa bantu bikin jadi HD lho!\n\n`;
    txt += `*Cara Pakai:*\n`;
    txt += `👉 Kirim video (atau document video) dengan caption \`${m.prefix}hdvid\`\n`;
    txt += `👉 Atau reply video (atau document video) dengan \`${m.prefix}hdvid\`\n\n`;
    txt += `⚠️ _Fitur Premium, proses bisa memakan waktu tergantung ukuran ya kak!_`;
    return m.reply(txt);
  }

  await m.react("🕕");

  try {
    const videoBuffer = (await _optionalChain([m, 'optionalAccess', _12 => _12.quoted, 'optionalAccess', _13 => _13.download, 'optionalCall', _14 => _14()])) || (await _optionalChain([m, 'access', _15 => _15.download, 'optionalCall', _16 => _16()]));

    if (!videoBuffer || videoBuffer.length === 0) {
      await m.react("❌");
      return m.reply(`❌ *GAGAL*\n\nAduh kak, videonya gagal diunduh! Coba kirim ulang ya.`);
    }

    if (videoBuffer.length > 50 * 1024 * 1024) {
      await m.react("❌");
      return m.reply(`❌ *FILE TERLALU BESAR*\n\nMaaf kak, maksimal ukuran video cuma 50MB ya!`);
    }

    await m.reply(`🎞️ *PROSES ENHANCE DIMULAI* 🎞️\n\nVideo kakak sedang diproses agar menjadi HD! ✨\nEstimasi waktu tergantung ukuran video, mohon bersabar ya kak!`);

    const tempDir = _os2.default.tmpdir();
    const inputPath = _path2.default.join(tempDir, `input-hd-${Date.now()}.mp4`);
    const outputPath = _path2.default.join(tempDir, `output-hd-${Date.now()}.mp4`);

    _fs2.default.writeFileSync(inputPath, videoBuffer);

    await new Promise((resolve, reject) => {
      _fluentffmpeg2.default.call(void 0, inputPath)
        .videoFilters([
          'scale=iw*2:ih*2:flags=lanczos',
          'unsharp=5:5:1.0:5:5:0.0'
        ])
        .outputOptions(['-c:v libx264', '-preset fast', '-crf 23', '-c:a copy'])
        .save(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    const resultBuffer = _fs2.default.readFileSync(outputPath);

    await sock.sendMedia(m.chat, resultBuffer, `✨ *PROSES SELESAI* ✨\n\nIni dia hasil videonya kak, udah jauh lebih mulus dan HD kan? 😍`, m, {
      type: "video",
      mimetype: "video/mp4",
      fileName: `HDVID-${Date.now()}.mp4`,
    });

    await m.react("✅");

    try {
        _fs2.default.unlinkSync(inputPath);
        _fs2.default.unlinkSync(outputPath);
    } catch (e) {}
  } catch (err) {
    await m.react("❌");
    await m.reply(`❌ Maaf kak, proses enhance videonya gagal! 😭\n\nDetail: ${err.message}`);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
