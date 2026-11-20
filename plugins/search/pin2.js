"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }


var _ourin = require('ourin');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourinhttpjs = require('../../src/lib/ourin-http.js');

const pluginConfig = {
  name: "pin2",
  alias: ["pinterest2"],
  category: "search",
  description: "Encontrar una imagen aleatoria en Pinterest con un putool nexn",
  usage: ".pin2 <query>",
  example: ".pin2 anime",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const query = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);

  if (!query) {
    return m.reply(`❌Introduzca palabras clave de búsqueda.\n\nEjemplo:\`${m.prefix}pin2 kucing\``);
  }

  await m.react("🕕");

  try {
    const data = await _ourinhttpjs.f.call(void 0, 
      `https://api.cuki.biz.id/api/search/pinterest?apikey=cuki-x&query=${encodeURIComponent(query)}&type=image`
    );

    const results = _optionalChain([data, 'optionalAccess', _4 => _4.data, 'optionalAccess', _5 => _5.results, 'optionalAccess', _6 => _6.filter, 'call', _7 => _7(item => item.image_url)]);
    if (!results || results.length === 0) {
      await m.react("❌");
      return m.reply(`❌Waduh, busca *${query}* no encontrado.`);
    }

    const randomItem = results[Math.floor(Math.random() * results.length)];
    const imageUrl = randomItem.image_url;

    if (!imageUrl) {
      await m.react("❌");
      return m.reply("⚠EveGambar no está disponible.");
    }

    const mediaMessage = await _ourin.prepareWAMessageMedia.call(void 0, {
      image: { url: imageUrl }
    }, { upload: sock.waUploadToServer });

    const msg = _ourin.generateWAMessageFromContent.call(void 0, m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {},
          interactiveMessage: {
            header: {
              title: "",
              subtitle: "",
              hasMediaAttachment: true,
              imageMessage: mediaMessage.imageMessage
            },
            footer: {
              text: "Los clics de topoles se cambian para otra imagen👇"
            },
            body: {
              text: `📸* PintereST SEARCH *\n\n# Buscadme #${query}*`
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "🔁 Next",
                    id: `${m.prefix}pin2 ${query}`
                  })
                }
              ]
            }
          }
        }
      }
    }, { quoted: m, userJid: sock.user.jid });

    await sock.relayMessage(m.chat, msg.message, {
      messageId: msg.key.id,
    });

    await m.react("✅");

  } catch (error) {
    console.error("[PIN2 Search]", error.message);
    await m.react("☢");
    m.reply("😔El ventilador está encontrando Pinterest, el servidor puede estar en problemas.");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
