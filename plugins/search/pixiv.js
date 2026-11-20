"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
  name: "pixiv",
  alias: ["pixivsearch", "caripixiv"],
  category: "search",
  description: "Cari artwork di Pixiv",
  usage: ".pixiv <query>",
  example: ".pixiv rem",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    const query = _optionalChain([m, 'access', _ => _.args, 'optionalAccess', _2 => _2.join, 'call', _3 => _3(" "), 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()]);

    if (!query) {
      return m.reply(
        `❌* ¡Introduzca las palabras clave de búsqueda! ]\n\n> Ejemplo:.pixFreno de mar`,
      );
    }

    await m.react("🔍");

    const apikey = _optionalChain([_configjs2.default, 'access', _6 => _6.APIkey, 'optionalAccess', _7 => _7.neoxr]) || "Milik-Bot-OurinMD";
    const url = `https://api.neoxr.eu/api/pixiv-search?q=${encodeURIComponent(query)}&apikey=${apikey}`;

    const response = await _axios2.default.get(url, { timeout: 30000 });
    const data = response.data;

    if (!data.status || !data.data || data.data.length === 0) {
      await m.react("❌");
      return m.reply(`❌* No se han encontrado resultados para: *${query}`);
    }

    const results = data.data.slice(0, 10);

    const saluranId = _optionalChain([_configjs2.default, 'access', _8 => _8.saluran, 'optionalAccess', _9 => _9.id]) || "120363400911374213@newsletter";
    const saluranName = _optionalChain([_configjs2.default, 'access', _10 => _10.saluran, 'optionalAccess', _11 => _11.name]) || _optionalChain([_configjs2.default, 'access', _12 => _12.bot, 'optionalAccess', _13 => _13.name]) || "Ourin-AI";

    let caption = `🎨 *ᴘɪxɪᴠ sᴇᴀʀᴄʜ*\n`;
    caption += `📝 *ᴋᴜᴇʀʏ:* ${query}\n`;
    caption += `📊 *ʜᴀsɪʟ:* ${results.length} artwork\n\n`;

    results.forEach((art, i) => {
      const aiLabel = art.aiType === 2 ? " 🤖" : "";
      const isNsfw = art.xRestrict > 0 ? " 🔞" : "";
      caption += `*${i + 1}.* ${art.title}${aiLabel}${isNsfw}\n`;
      caption += `   👤 ${art.userName}\n`;
      caption += `   📐 ${art.width}x${art.height} • 📄 ${art.pageCount} page\n`;
      caption += `   🔗 ${art.url}\n\n`;
    });

    caption += `> 🎨 Powered by Pixiv`;

    const buttons = results.slice(0, 5).map((art, i) => ({
      title: `${art.title.slice(0, 20)}${art.title.length > 20 ? "..." : ""}`,
      description: `by ${art.userName}`,
      id: `.pixivget ${art.url}`,
    }));

    await m.react("🎨");

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
      },
      { quoted: m },
    );
  } catch (error) {
    await m.react("☢");
    if (_optionalChain([error, 'access', _14 => _14.response, 'optionalAccess', _15 => _15.status]) === 403) {
      return m.reply(`❌* Fuego Key no es válido o límite es cappai *`);
    }
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
