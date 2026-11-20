"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _winkjs = require('../../src/scraper/wink.js'); var _winkjs2 = _interopRequireDefault(_winkjs);

const pluginConfig = {
  name: "wink",
  alias: ["winkenhance", "winkhd", "wenhance"],
  category: "tools",
  description: "Meningkatkan kualitas video menjadi Ultra HD dengan Wink AI",
  usage: ".wink (reply video)",
  example: ".wink",
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
    return m.reply(
      `✨ *ᴡɪɴᴋ ᴠɪᴅᴇᴏ ᴇɴʜᴀɴᴄᴇʀ*\n\n` +
        `> Bikin video buram jadi *Ultra HD* pakai AI Wink!\n\n` +
        `*Cara pakai:*\n` +
        `> Kirim/reply video lalu caption \`${m.prefix}wink\`\n\n` +
        `⚠️ _Fitur Premium, proses estimasi 1-5 menit tergantung durasi video_`,
    );
  }

  await m.react("🕕");

  try {
    const videoBuffer = (await _optionalChain([m, 'optionalAccess', _12 => _12.quoted, 'optionalAccess', _13 => _13.download, 'optionalCall', _14 => _14()])) || (await _optionalChain([m, 'access', _15 => _15.download, 'optionalCall', _16 => _16()]));

    if (!videoBuffer || videoBuffer.length === 0) {
      await m.react("❌");
      return m.reply(`❌ *GAGAL*\n\nVideonya gagal diunduh, coba kirim ulang ya!`);
    }

    if (videoBuffer.length > 50 * 1024 * 1024) {
      await m.react("❌");
      return m.reply(`❌ *FILE TERLALU BESAR*\n\nMaksimal ukuran video cuma *50MB* ya!`);
    }

    await m.reply(
      `🎬 *ᴘʀᴏsᴇs ᴡɪɴᴋ ᴇɴʜᴀɴᴄᴇ ᴅɪᴍᴜʟᴀɪ*\n\n` +
        `> Video lagi diproses AI Wink biar jadi *Ultra HD* ✨\n` +
        `> Estimasi *1-5 menit*, mohon sabar ya!`,
    );

    const result = await _winkjs2.default.call(void 0, videoBuffer, {
      filename: `wink-${Date.now()}.mp4`,
    });

    await sock.sendMedia(m.chat, result.resultUrl, `✨ *ᴡɪɴᴋ ᴇɴʜᴀɴᴄᴇ sᴇʟᴇsᴀɪ!*\n\n> Ini dia hasilnya, udah jadi *Ultra HD* kan? 😍`, m, {
      type: "video",
      mimetype: "video/mp4",
      fileName: `WINK-HD-${Date.now()}.mp4`,
    });

    await m.react("✅");
  } catch (err) {
    console.log(err);
    await m.react("❌");
    await m.reply(`❌ Proses Wink enhance gagal! Coba lagi nanti ya 😭`);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
