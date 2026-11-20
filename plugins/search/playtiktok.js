"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _tiktoksearchjs = require('../../src/scraper/tiktoksearch.js');

const pluginConfig = {
  name: "playtiktok",
  alias: ["ttplay", "tiktokplay"],
  category: "search",
  description: "Busca y enviar un video de los mejores TikTok",
  usage: ".playtiktok <query>",
  example: ".playtiktok cewe tiktok",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

function formatNumber(n) {
  const value = Number(n) || 0;
  if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
  if (value >= 1000) return (value / 1000).toFixed(1) + "K";
  return value.toString();
}

async function handler(m, { sock }) {
  const query = _optionalChain([m, 'access', _ => _.args, 'access', _2 => _2.join, 'call', _3 => _3(" "), 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()]);

  if (!query) {
    return m.reply(
      `🎵* Hasta el momento. *\n\n> Ejemplo:\n\`${m.prefix}playtiktok cewe tiktok\``,
    );
  }

  m.react("🔍");

  try {
    const videos = await _tiktoksearchjs.tiktokSearchVideo.call(void 0, query);
    if (!videos || videos.length === 0) {
      m.react("❌");
      return m.reply(`❌No se ha encontrado ningún video para:${query}`);
    }

    const video = videos[0];
    let caption = "🎵 *PLAY TIKTOK*\n\n";
    caption += `📌 *Judul:* ${video.title || "-"}\n`;
    caption += `👤 *Author:* ${_optionalChain([video, 'access', _6 => _6.author, 'optionalAccess', _7 => _7.nickname]) || "-"}\n`;
    caption += `👀 *Views:* ${formatNumber(_optionalChain([video, 'access', _8 => _8.stats, 'optionalAccess', _9 => _9.plays]))}\n`;
    caption += `❤️ *Likes:* ${formatNumber(_optionalChain([video, 'access', _10 => _10.stats, 'optionalAccess', _11 => _11.likes]))}\n`;
    caption += `💬 *Comments:* ${formatNumber(_optionalChain([video, 'access', _12 => _12.stats, 'optionalAccess', _13 => _13.comments]))}\n`;
    caption += `🔁 *Shares:* ${formatNumber(_optionalChain([video, 'access', _14 => _14.stats, 'optionalAccess', _15 => _15.shares]))}\n`;
    caption += `🎧 *Music:* ${video.music || "-"}\n`;
    caption += `🔗*Enlace:*${video.link}`;

    await sock.sendMedia(m.chat, video.link, caption, m, {
      type: "video",
      mimetype: "video/mp4",
      contextInfo: {
        forwardingScore: 99,
        isForwarded: true,
      },
    });

    m.react("✅");
  } catch (error) {
    console.log(error);
    m.react("☢");
    m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
