"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _tiktoksearchjs = require('../../src/scraper/tiktoksearch.js');

const pluginConfig = {
  name: "ptvsearch",
  alias: ["ptvs"],
  category: "search",
  description: "Cari video TikTok",
  usage: ".ptvsearch <query>",
  example: ".ptvsearch jj epep",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const query = _optionalChain([m, 'access', _ => _.args, 'access', _2 => _2.join, 'call', _3 => _3(" "), 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()]);

  if (!query) {
    return m.reply(
      `╭┈┈⬡「 🎵 *ᴛɪᴋᴛᴏᴋ sᴇᴀʀᴄʜ* 」
┃
┃ ㊗ ᴜsᴀɢᴇ: \`${m.prefix}ptvsearch <query>\`
┃
╰┈┈⬡

> \`Contoh: ${m.prefix}ptvsearch anime\``,
    );
  }

  m.react("🔍");

  try {
    const videos = await _tiktoksearchjs.tiktokSearchVideo.call(void 0, query);

    if (!videos || videos.length === 0) {
      m.react("❌");
      return m.reply(`❌ Tidak ditemukan video untuk: ${query}`);
    }

    const randomVideo = videos[Math.floor(Math.random() * videos.length)];

    await sock.sendMessage(m.chat, {
      video: { url: randomVideo.link },
      mimetype: "video/mp4",
      ptv: true,
    });

    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler; exports.tiktokSearchVideo = _tiktoksearchjs.tiktokSearchVideo;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
