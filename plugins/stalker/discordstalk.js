"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikutimejs = require('../../src/lib/almiku-time.js'); var timeHelper = _interopRequireWildcard(_almikutimejs);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const NEOXR_APIKEY = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.neoxr]) || "Milik-Bot-OurinMD";

const pluginConfig = {
  name: "discordstalk",
  alias: ["dcstalk", "dsstalk", "stalkdc", "stalkdiscord"],
  category: "stalker",
  description: "Stalk akun Discord berdasarkan User ID",
  usage: ".discordstalk <userid>",
  example: ".discordstalk 297574907510784000",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const userId = _optionalChain([m, 'access', _3 => _3.args, 'access', _4 => _4[0], 'optionalAccess', _5 => _5.trim, 'call', _6 => _6()]);

  if (!userId) {
    return m.reply(
      `🎮 *ᴅɪsᴄᴏʀᴅ sᴛᴀʟᴋ*\n\n` +
        `* Poner el ID de usuario de discordia*\n\n` +
        `\`Contoh: ${m.prefix}discordstalk 297574907510784000\``,
    );
  }

  if (!/^\d+$/.test(userId)) {
    return m.reply(`❌El ID de usuario debe ser establecido en número.`);
  }

  m.react("🔍");

  try {
    const res = await _axios2.default.get(
      `https://api.neoxr.eu/api/dcstalk?id=${userId}&apikey=${NEOXR_APIKEY}`,
      {
        timeout: 30000,
      },
    );

    if (!_optionalChain([res, 'access', _7 => _7.data, 'optionalAccess', _8 => _8.status]) || !_optionalChain([res, 'access', _9 => _9.data, 'optionalAccess', _10 => _10.data])) {
      m.react("❌");
      return m.reply(`❌ User ID *${userId}* not found`);
    }

    const d = res.data.data;

    const createdDate = d.created_at
      ? timeHelper.fromTimestamp(d.created_at, "D MMMM YYYY")
      : "-";

    const caption =
      `🎮 *ᴅɪsᴄᴏʀᴅ sᴛᴀʟᴋ*\n\n` +
      `👤 *Username:* ${d.username || "-"}\n` +
      `📛 *Display Name:* ${d.global_name || "-"}\n` +
      `🔢 *Discriminator:* #${d.discriminator || "0"}\n` +
      `🆔 *User ID:* ${d.id}\n\n` +
      `📅*Creado:*${createdDate}\n\n` +
      `> _Discord User Lookup_`;

    m.react("✅");

    if (d.avatar_url) {
      await sock.sendMessage(
        m.chat,
        {
          image: { url: d.avatar_url },
          caption,
        },
        { quoted: m },
      );
    } else {
      await m.reply(caption);
    }
  } catch (error) {
    m.react('☢');
    m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
