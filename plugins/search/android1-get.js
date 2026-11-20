"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
  name: "android1-get",
  alias: ["an1get", "an1dl"],
  category: "search",
  description: "Descargar APK desde Android1",
  usage: ".android1-get <url>",
  example: ".android1-get https://an1.com/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

const NEOXR_APIKEY = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.neoxr]) || "Milik-Bot-OurinMD";

async function handler(m, { sock }) {
  const url = _optionalChain([m, 'access', _3 => _3.text, 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()]);

  if (!url || !url.includes("an1.com")) {
    return m.reply(`❌URL inválida!`);
  }

  m.react("🕕");

  try {
    const { data } = await _axios2.default.get(
      `https://api.neoxr.eu/api/an1-get?url=${encodeURIComponent(url)}&apikey=${NEOXR_APIKEY}`,
      {
        timeout: 60000,
      },
    );

    if (!_optionalChain([data, 'optionalAccess', _6 => _6.status]) || !_optionalChain([data, 'optionalAccess', _7 => _7.data])) {
      throw new Error("Intento recuperar detalles de APK");
    }

    const app = data.data;
    const saluranId = _optionalChain([_configjs2.default, 'access', _8 => _8.saluran, 'optionalAccess', _9 => _9.id]) || "120363400911374213@newsletter";
    const saluranName = _optionalChain([_configjs2.default, 'access', _10 => _10.saluran, 'optionalAccess', _11 => _11.name]) || _optionalChain([_configjs2.default, 'access', _12 => _12.bot, 'optionalAccess', _13 => _13.name]) || "Al Miku-AI";
    if (app.url) {
      await sock.sendMessage(
        m.chat,
        {
          document: { url: app.url },
          fileName: app.name,
          mimetype: "application/vnd.android.package-archive",
          contextInfo: {
            forwardingScore: 99,
            isForwarded: true,
          },
        },
        { quoted: m },
      );

      m.react("✅");
    } else {
      let caption = `•⚠ En el agujero •`;

      await sock.sendMessage(
        m.chat,
        {
          text: caption,
          contextInfo: {
            forwardingScore: 9999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: saluranId,
              newsletterName: saluranName,
              serverMessageId: 127,
            },
          },
          interactiveButtons: [
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: "🌐 Buka di Browser",
                url: url,
              }),
            },
          ],
        },
        { quoted: m },
      );

      m.react("⚠️");
    }
  } catch (err) {
    console.log(err);
    m.react("☢");
    return m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
