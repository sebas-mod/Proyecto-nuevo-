"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _aiojs = require('../../src/scraper/aio.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _almikucontextjs = require('../../src/lib/almiku-context.js');

const pluginConfig = {
  name: "aio",
  alias: ["allinone", "download", "dl"],
  category: "downloader",
  description:
    "All in one downloader (IG, TikTok, FB, Twitter, YouTube, Pinterest, CapCut, dll)",
  usage: ".aio <url>",
  example: ".aio https://instagram.com/p/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const url = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);

  if (!url) {
    return m.reply(
      `📥 *ᴀʟʟ ɪɴ ᴏɴᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n` +
        `*Descargos de plataforma!\n\n` +
        `╭┈┈⬡「 🌐 *ᴘʟᴀᴛꜰᴏʀᴍ* 」\n` +
        `┃ • Instagram\n` +
        `┃ • TikTok\n` +
        `┃ • Facebook\n` +
        `┃ • Twitter/X\n` +
        `┃ • YouTube\n` +
        `┃ • Pinterest\n` +
        `┃ • CapCut\n` +
        `┃ • Threads / Reddit\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `> *Ejemplo:*${m.prefix}aio https://instagram.com/p/xxx`,
    );
  }

  if (!url.startsWith("http")) {
    return m.reply(`❌URL inválida! Harness protagonizado por http / https`);
  }

  await m.react("🕕");

  try {
    const result = await _aiojs.aiodl.call(void 0, url);

    if (!_optionalChain([result, 'optionalAccess', _4 => _4.media, 'optionalAccess', _5 => _5.length])) {
      await m.react("❌");
      return m.reply(`❌Steenalis tomando medios.`);
    }

    const ctxInfo = _almikucontextjs.saluranCtx.call(void 0, );

    for (const item of result.media) {
      if (item.type === "video") {
        await sock.sendMedia(m.chat, item.url, result.title || null, m, {
          type: "video",
          contextInfo: ctxInfo,
        });
      } else if (item.type === "audio") {
        await sock.sendMessage(
          m.chat,
          {
            audio: { url: item.url },
            mimetype: "audio/mpeg",
            contextInfo: ctxInfo,
          },
          { quoted: m },
        );
      } else {
        await sock.sendMedia(m.chat, item.url, result.title || null, m, {
          type: "image",
          contextInfo: ctxInfo,
        });
      }
      break;
    }

    await m.react("✅");
  } catch (error) {
    await m.react("☢");
    m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
