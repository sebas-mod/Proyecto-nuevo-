"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }



var _ourin = require('ourin');
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourinhttpjs = require('../../src/lib/ourin-http.js');
var _ourinbuilderjs = require('../../src/lib/ourin-builder.js');

const pluginConfig = {
  name: "pin",
  alias: ["pinsearch", "pinterestsearch", "pins"],
  category: "search",
  description: "Busca dibujo en Pinterest ( álbum )",
  usage: ".pin <query>",
  example: ".pin Zhao Lusi",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const query = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
  if (!query) {
    return m.reply(
      `🔍 *ᴘɪɴᴛᴇʀᴇsᴛ sᴇᴀʀᴄʜ*\n\n` +
      `> Ejemplo:\n` +
      `\`${m.prefix}pin Zhao Lusi\``,
    );
  }
  m.react("🕕");

  try {
    const data = await _ourinhttpjs.f.call(void 0, 
      `https://api.cuki.biz.id/api/search/pinterest?apikey=cuki-x&query=${encodeURIComponent(query)}&type=image`
    );

    const results = _optionalChain([data, 'optionalAccess', _4 => _4.data, 'optionalAccess', _5 => _5.results, 'optionalAccess', _6 => _6.filter, 'call', _7 => _7(item => item.image_url), 'optionalAccess', _8 => _8.slice, 'call', _9 => _9(0, 10)]);
    if (!results || results.length === 0) {
      m.react("❌");
      return m.reply(`❌No se han encontrado resultados para:${query}`);
    }

    const mediaList = [];

    for (const item of results) {
      const imageUrl = item.image_url;
      if (!imageUrl) continue;

      try {
        const imgRes = await _axios2.default.get(imageUrl, {
          responseType: "arraybuffer",
          timeout: 15000,
        });
        const imgBuffer = Buffer.from(imgRes.data);

        if (imgBuffer.length > 1000) {
          mediaList.push({ image: imgBuffer });
        }
      } catch (e) {
        continue;
      }
    }

    if (mediaList.length === 0) {
      m.react("❌");
      return m.reply("❌Los luchadores cargan la imagen");
    }

    try {
      const opener = _ourin.generateWAMessageFromContent.call(void 0, 
        m.chat,
        {
          messageContextInfo: { messageSecret: _crypto2.default.randomBytes(32) },
          albumMessage: {
            expectedImageCount: mediaList.length,
            expectedVideoCount: 0,
          },
        },
        {
          userJid: _ourin.jidNormalizedUser.call(void 0, sock.user.id),
          quoted: m,
          upload: sock.waUploadToServer,
        },
      );

      await sock.relayMessage(opener.key.remoteJid, opener.message, {
        messageId: opener.key.id,
      });

      for (const content of mediaList) {
        const msg = await _ourin.generateWAMessage.call(void 0, opener.key.remoteJid, content, {
          upload: sock.waUploadToServer,
        });

        msg.message.messageContextInfo = {
          messageSecret: _crypto2.default.randomBytes(32),
          messageAssociation: {
            associationType: 1,
            parentMessageKey: opener.key,
          },
        };

        await sock.relayMessage(msg.key.remoteJid, msg.message, {
          messageId: msg.key.id,
        });
      }

      m.react("✅");
    } catch (albumErr) {
      console.log("*Pins* *Voy a perderlo* *Pine* *voy a enviar uno*", albumErr.message);

      const saluranId = _optionalChain([config, 'access', _10 => _10.saluran, 'optionalAccess', _11 => _11.id]) || "120363400911374213@newsletter";
      const saluranName =
        _optionalChain([config, 'access', _12 => _12.saluran, 'optionalAccess', _13 => _13.name]) || _optionalChain([config, 'access', _14 => _14.bot, 'optionalAccess', _15 => _15.name]) || "Ourin-AI";

      for (const content of mediaList) {
        await sock.sendMessage(
          m.chat,
          {
            image: content.image,
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
      }
    }
    m.react("✅");
  } catch (err) {
    console.error("[Pins] Error:", err.message);
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
