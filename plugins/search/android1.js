"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinassetmanagerjs = require('../../src/lib/ourin-asset-manager.js');
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
  name: "android1",
  alias: ["an1"],
  category: "search",
  description: "Busca y descarga APK MOD de Android1",
  usage: ".android1 <query>",
  example: ".android1 Subway Surfer",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

const NEOXR_APIKEY = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.neoxr]) || "Millik - Eurinprobable";

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const args = m.args || [];
  const text = _optionalChain([m, 'access', _3 => _3.text, 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()]);

  if (!text) {
    return m.reply(
      `📱 *ᴀɴᴅʀᴏɪᴅ1 sᴇᴀʀᴄʜ*\n\n` +
        `╭┈┈⬡「 📋 *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ* 」\n` +
        `┃ 🔍 \`${m.prefix}android1<query>\`- Busca APK\n` +
        `╰┈┈⬡\n\n` +
        `> Ejemplo:\n` +
        `\`${m.prefix}android1 Subway Surfer\``,
    );
  }

  m.react("🔍");

  try {
    const { data } = await _axios2.default.get(
      `https://api.neoxr.eu/api/an1?q=${encodeURIComponent(text)}&apikey=${NEOXR_APIKEY}`,
      {
        timeout: 30000,
      },
    );

    if (!_optionalChain([data, 'optionalAccess', _6 => _6.status]) || !_optionalChain([data, 'optionalAccess', _7 => _7.data, 'optionalAccess', _8 => _8.length])) {
      m.react("❌");
      return m.reply(`❌No se han encontrado resultados para:\`${text}\``);
    }

    const apps = data.data.slice(0, 10);

    if (!db.db.data.sessions) db.db.data.sessions = {};
    const sessionKey = `an1_${m.sender}`;
    db.db.data.sessions[sessionKey] = {
      results: apps,
      query: text,
      timestamp: Date.now(),
    };
    db.save();

    const saluranId = _optionalChain([_configjs2.default, 'access', _9 => _9.saluran, 'optionalAccess', _10 => _10.id]) || "120363400911374213@newsletter";
    const saluranName = _optionalChain([_configjs2.default, 'access', _11 => _11.saluran, 'optionalAccess', _12 => _12.name]) || _optionalChain([_configjs2.default, 'access', _13 => _13.bot, 'optionalAccess', _14 => _14.name]) || "Ourin-AI";

    let caption = `📱El acrónimo de la búsqueda de apk mod *${text}*\n`;
    caption += `*${apps.length}* Aplicaciones encontradas\n\n`;

    apps.forEach((app, i) => {
      caption += `*${i + 1}.* ${app.name}\n`;
      caption += `   ├ 👤 ${app.developer}\n`;
      caption += `   └ ⭐ ${app.rating}/5\n\n`;
    });

    caption += `*Elija el número para descargar langsung*`;

    const buttons = apps.slice(0, 10).map((app, i) => ({
      title: `${i + 1}. ${app.name.substring(0, 20)}`,
      description: `${app.developer} • ⭐${app.rating}`,
      id: `${m.prefix}android1-get ${app.url}`,
    }));

    m.react("✅");
    await sock.sendButton(
      m.chat,
      _ourinassetmanagerjs.getAssetBuffer.call(void 0, "ourin"),
      caption,
      m,
      {
        buttons: [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "Pilih APK",
              sections: [
                {
                  title: "El APK.",
                  rows: buttons,
                },
              ],
            }),
          },
        ],
        footer: "📱 Android1 Search",
      },
    );
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
