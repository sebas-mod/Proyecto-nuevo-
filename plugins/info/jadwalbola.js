"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinhttpjs = require('../../src/lib/ourin-http.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
  name: "jadwalbola",
  alias: ["bola", "football", "soccer", "jadwalsepakbola"],
  category: "info",
  description: "Lihat jadwal pertandingan sepak bola",
  usage: ".jadwalbola [liga]",
  example: ".jadwalbola inggris",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const NEOXR_APIKEY = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.neoxr]) || "Milik-Bot-OurinMD";

const LEAGUE_EMOJI = {
  "liga inggris": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "liga italia": "🇮🇹",
  "liga spanyol": "🇪🇸",
  "la liga spanyol": "🇪🇸",
  "liga jerman": "🇩🇪",
  "liga prancis": "🇫🇷",
  "liga belanda": "🇳🇱",
  "liga champions": "🏆",
  "bri super league": "🇮🇩",
};

function getLeagueEmoji(league) {
  const lower = league.toLowerCase();
  for (const [key, emoji] of Object.entries(LEAGUE_EMOJI)) {
    if (lower.includes(key) || key.includes(lower)) {
      return emoji;
    }
  }
  return "⚽";
}

async function handler(m, { sock }) {
  const filter = m.args.join(" ").toLowerCase().trim();

  m.react("🕕");

  try {
    const data = await _ourinhttpjs.f.call(void 0, 
      `https://api.neoxr.eu/api/bola?apikey=${NEOXR_APIKEY}`,
    );

    if (!_optionalChain([data, 'optionalAccess', _3 => _3.status]) || !_optionalChain([data, 'optionalAccess', _4 => _4.data]) || data.data.length === 0) {
      throw new Error("Tidak ada jadwal tersedia");
    }

    let matches = data.data;

    if (filter) {
      matches = matches.filter(
        (m) =>
          _optionalChain([m, 'access', _5 => _5.league, 'optionalAccess', _6 => _6.toLowerCase, 'call', _7 => _7(), 'access', _8 => _8.includes, 'call', _9 => _9(filter)]) ||
          _optionalChain([m, 'access', _10 => _10.home_team, 'optionalAccess', _11 => _11.toLowerCase, 'call', _12 => _12(), 'access', _13 => _13.includes, 'call', _14 => _14(filter)]) ||
          _optionalChain([m, 'access', _15 => _15.away_team, 'optionalAccess', _16 => _16.toLowerCase, 'call', _17 => _17(), 'access', _18 => _18.includes, 'call', _19 => _19(filter)]) ||
          _optionalChain([m, 'access', _20 => _20.date, 'optionalAccess', _21 => _21.toLowerCase, 'call', _22 => _22(), 'access', _23 => _23.includes, 'call', _24 => _24(filter)]),
      );
    }

    if (matches.length === 0) {
      m.react("❌");
      return m.reply(`❌ Tidak ditemukan jadwal untuk: \`${filter}\``);
    }

    const grouped = {};
    for (const match of matches.slice(0, 50)) {
      const date = match.date || "TBA";
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(match);
    }

    const saluranId = _optionalChain([_configjs2.default, 'access', _25 => _25.saluran, 'optionalAccess', _26 => _26.id]) || "120363400911374213@newsletter";
    const saluranName = _optionalChain([_configjs2.default, 'access', _27 => _27.saluran, 'optionalAccess', _28 => _28.name]) || _optionalChain([_configjs2.default, 'access', _29 => _29.bot, 'optionalAccess', _30 => _30.name]) || "Ourin-AI";

    let text = `⚽ *ᴊᴀᴅᴡᴀʟ ᴘᴇʀᴛᴀɴᴅɪɴɢᴀɴ*\n\n`;
    if (filter) text += `> Filter: \`${filter}\`\n\n`;

    for (const [date, games] of Object.entries(grouped)) {
      text += `📅 *${date}*\n\n`;

      for (const game of games) {
        const emoji = getLeagueEmoji(game.league);
        text += `${emoji} *${game.league}*\n`;
        text += `⏰ ${game.time}\n`;
        text += `🏠 ${game.home_team}\n`;
        text += `🆚 ${game.away_team}\n\n`;
      }
    }

    text += `Total: *${matches.length}* pertandingan`;

    m.react("✅");

    await m.reply(text);
  } catch (err) {
    m.react("☢");
    return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
