"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }



var _ourin = require('ourin');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourinhttpjs = require('../../src/lib/ourin-http.js');

const pluginConfig = {
  name: "pap",
  alias: ["papcewe", "papcowo", "papfemboy"],
  category: "search",
  description: "Solicitar un cewe, niño, o femboy de Pinterest",
  usage: ".pap <cewe/cowo/femboy>",
  example: ".pap cewe",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const arg = _optionalChain([m, 'access', _ => _.args, 'access', _2 => _2[0], 'optionalAccess', _3 => _3.toLowerCase, 'call', _4 => _4()]);
  const validTypes = ["cewe", "cowo", "femboy"];

  if (!arg || !validTypes.includes(arg)) {
    return m.reply("❌Seleccione uno de los tipos de pap disponibles:`*Nosotros*`.`Chicos.`, o`Femboy`.\n\nEjemplo:`- ¡Papá!`");
  }

  await m.react("🕕");

  try {
    const query = arg;
    
    const data = await _ourinhttpjs.f.call(void 0, 
      `https://api.cuki.biz.id/api/search/pinterest?apikey=cuki-x&query=${encodeURIComponent(query)}&type=image`
    );

    const results = _optionalChain([data, 'optionalAccess', _5 => _5.data, 'optionalAccess', _6 => _6.results, 'optionalAccess', _7 => _7.filter, 'call', _8 => _8(item => item.image_url)]);
    if (!results || results.length === 0) {
      await m.react("❌");
      return m.reply(`❌ Waduh, pap ${query} otra vez vacio aquí. Intentalo mas tarde.`);
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
              text: "Elija otro menú de pap en está cáscara👇"
            },
            body: {
              text: `📸 *PAP ${arg.toUpperCase()}*`
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "🔁 Next",
                    id: `${m.prefix}pap ${arg}`
                  })
                },
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "👧 Cewe",
                    id: `${m.prefix}pap cewe`
                  })
                },
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "👦 Cowo",
                    id: `${m.prefix}pap cowo`
                  })
                },
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "⚧ Femboy",
                    id: `${m.prefix}pap femboy`
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
    console.error("[PAP Search]", error.message);
    await m.react("☢");
    m.reply("😔PAP @-@ nivel stuntman, Pinterest servidor puede estar en problemas.");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
