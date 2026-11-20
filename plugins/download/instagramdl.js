"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _igjs = require('../../src/scraper/ig.js'); var _igjs2 = _interopRequireDefault(_igjs);
const pluginConfig = {
  name: "instagramdl",
  alias: ["igdl", "ig", "instagram"],
  category: "download",
  description: "Download video/foto Instagram",
  usage: ".instagramdl <url>",
  example: ".instagramdl https://www.instagram.com/reel/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

const IG_REGEX = /instagram\.com\/(p|reel|reels|stories|tv)\//i;

async function handler(m, { sock }) {
  const url = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);

  if (!url) {
    return m.reply(
      `📸 *ɪɴsᴛᴀɢʀᴀᴍ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n` +
        `> \`${m.prefix}igdl <url>\`\n\n` +
        `*ᴄᴏɴᴛᴏʜ:*\n` +
        `> \`${m.prefix}igdl https://www.instagram.com/reel/xxx\`\n` +
        `> \`${m.prefix}igdl https://www.instagram.com/p/xxx\``,
    );
  }

  if (!IG_REGEX.test(url)) {
    return m.reply(
      `❌URL inválida. Use enlaces de lnstagram ( carrete / post / almacenamiento ).`,
    );
  }

  await m.react("🕕");

  try {
    const result = await _igjs2.default.call(void 0, url);

    if (!_optionalChain([result, 'optionalAccess', _4 => _4.media, 'optionalAccess', _5 => _5.length])) {
      await m.react("❌");
      return m.reply(`❌Los luchadores toman medios.`);
    }

    const isStory = url.includes("/stories/");
    let caption = `📸 *Instagram ${isStory ? "Story" : "Downloader"}*\n\n`;
    if (result.username && result.username !== "-") {
      caption += `👤 *Author*: @${result.username}\n`;
    }
    if (result.caption) {
      caption += `📝 *Caption*:\n${result.caption}\n`;
    }
    caption = caption.trim();

    for (const item of result.media) {
      if (item.type === "video" || item.type === "mp4") {
        await sock.sendMessage(
          m.chat,
          { video: { url: item.url }, caption },
          { quoted: m },
        );
      } else {
        await sock.sendMessage(
          m.chat,
          { image: { url: item.url }, caption },
          { quoted: m },
        );
      }
      caption = "";
    }

    await m.react("✅");
  } catch (err) {
    await m.react("❌");
    return m.reply(`❌ *ɢᴀɢᴀʟ ᴍᴇɴɢᴜɴᴅᴜʜ*\n\n> ${err.message}`);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
