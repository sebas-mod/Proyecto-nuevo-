"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _rednotejs = require('../../src/scraper/rednote.js');

const pluginConfig = {
  name: "rednotedl",
  alias: ["rednote", "xhsdl", "xiaohongshu"],
  category: "download",
  description: "Descargas video / foto de RedNote ( XiaoHongshou )",
  usage: ".rednotedl <url>",
  example: ".rednotedl https://www.xiaohongshu.com/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
  if (!text) {
    m.react("❌");
    return m.reply(
      `📕 *RedNote Downloader*\n\n` +
        `Descargas de vídeo o fotos de XiaoHongshry ( RedNote ).\n\n` +
        `*Uso:*\n` +
        `> *${m.prefix}rednotedl <link>*\n\n` +
        `*Ejemplo:*\n` +
        `> *${m.prefix}rednotedl https://www.xiaohongshu.com/xxx*`,
    );
  }

  m.react("🕕");

  try {
    const result = await _rednotejs.RedNoteDL.call(void 0, text);

    if (!result.status) {
      m.react("☢");
      return m.reply(`❌*RedNote Fallido*\n\n♪${result.error}`);
    }

    if (result.type === "video" && _optionalChain([result, 'access', _4 => _4.results, 'optionalAccess', _5 => _5[0]])) {
      await sock.sendMedia(m.chat, result.results[0], result.title, m, {
        type: "video",
      });
    } else if (_optionalChain([result, 'access', _6 => _6.results, 'optionalAccess', _7 => _7.length]) > 0) {
      for (let i = 0; i < Math.min(result.results.length, 5); i++) {
        await sock.sendMedia(m.chat, result.results[i], "", m, {
          type: "image",
        });
      }
      if (result.results.length > 5) {
        await m.reply(
          `*Allí está Maoh*${result.results.length - 5}foto de nuevo, máximo 5_`,
        );
      }
    }

    m.react("✅");
  } catch (e) {
    console.error(e);
    m.react("☢");
    m.reply("❌Gagal toma datos RedNote, inténtelo de nuevo más tarde");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
