"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "rvo",
  alias: ["readvo", "readviewonce", "readview"],
  category: "tools",
  description: "Lea un mensaje de (ver una vez )",
  usage: ".rvo (reply pesan view once)",
  example: ".rvo",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const quoted = m.quoted;
  if (!quoted) {
    return m.reply(
      `Responder ordenó a uno tiempo sólo revisión para abrirla.\n\n\`Ejemplo:${m.prefix}rvo\`(respuesta vista una vez mensaje )`,
    );
  }

  if (!quoted.isViewOnce && !quoted.isMedia) {
    return m.reply("❌Responder ordenó una vista una vez ( una vez ) para abrirla.");
  }

  m.react("⏱️");

  try {
    let originalCaption = "";
    if (_optionalChain([quoted, 'access', _ => _.message, 'optionalAccess', _2 => _2[quoted.type], 'optionalAccess', _3 => _3.caption])) {
      originalCaption = quoted.message[quoted.type].caption;
    } else if (quoted.body) {
      originalCaption = quoted.body;
    }

    const buffer = await quoted.download();
    if (!buffer) throw new Error("Fallido download");

    const caption = originalCaption ? `\`Pesan :\`\n> ${originalCaption}` : "";

    if (quoted.isImage) {
      await sock.sendMessage(
        m.chat,
        {
          image: buffer,
          caption,
        },
        { quoted: m },
      );
    } else if (quoted.isVideo) {
      await sock.sendMessage(
        m.chat,
        {
          video: buffer,
          caption,
        },
        { quoted: m },
      );
    } else if (quoted.isAudio) {
      await sock.sendMessage(
        m.chat,
        {
          audio: buffer,
          mimetype: _optionalChain([quoted, 'access', _4 => _4.message, 'optionalAccess', _5 => _5[quoted.type], 'optionalAccess', _6 => _6.mimetype]) || "audio/mpeg",
        },
        { quoted: m },
      );
    } else {
      const ext = _optionalChain([quoted, 'access', _7 => _7.type, 'optionalAccess', _8 => _8.replace, 'call', _9 => _9("Message", "")]) || "bin";
      await sock.sendMessage(
        m.chat,
        {
          document: buffer,
          fileName: `rvo_${Date.now()}.${ext}`,
          mimetype:
            _optionalChain([quoted, 'access', _10 => _10.message, 'optionalAccess', _11 => _11[quoted.type], 'optionalAccess', _12 => _12.mimetype]) ||
            "application/octet-stream",
          caption: caption || "📎 View once media",
        },
        { quoted: m },
      );
    }

    m.react("✅");
  } catch (e) {
    m.react("☢");
    let msg = e.message;
    if (
      msg.includes("Fallido download") ||
      msg.includes("decrypt") ||
      msg.includes("download") ||
      msg.includes("Timeout") ||
      msg.includes("404") ||
      msg.includes("Gone")
    ) {
      msg =
        "Los medios de comunicación caducaron o ya fueron eliminados del servidor WhatsApp.\n\nTo Mensaje View Once is too old or overcast to be used for the Hando automas of the WhatsApp system and can 't be smuggled more.";
    }
    m.reply(`❌*Fierce hace la vista una vez*\n\n•${msg}`);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
