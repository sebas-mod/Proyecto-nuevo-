"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);
var _sharp2 = require('sharp'); var _sharp3 = _interopRequireDefault(_sharp2);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

function getSharp() {
  return _sharp3.default;
}
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _configjs = require('../../config.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
  name: "smeme",
  alias: ["memesticker", "memes"],
  category: "sticker",
  description: "Cree una pegatina.",
  usage: ".smeme <top>|<bottom>",
  example: ".smeme Ketika|Kamu Lupa",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};
async function handler(m, { sock }) {
  const isImage = m.isImage || (m.quoted && m.quoted.isImage);
  const isSticker =
    m.isSticker ||
    (m.quoted && (m.quoted.isSticker || m.quoted.type === "stickerMessage"));
  if (!isImage && !isSticker) {
    return m.reply(
      `😂*ᴍᴇᴍᴇSᴛɪᴄᴋᴇʀ*\n\n# Responder o enviar una imagen / pegatina con capción #\n\n\`Ejemplo:${m.prefix}smeme Top|Bottom\``,
    );
  }
  const input = m.args.join(" ");
  if (!input || !input.includes("|")) {
    return m.reply(
      `😂*ᴍᴇᴍᴇSᴛɪᴄᴋᴇʀ*\n\n* Formatt: Top * Down *\n\n\`Epirame:${m.prefix}smeme estoy cansado de ti\``,
    );
  }
  const [top, bottom] = input.split("|").map((s) => s.trim());
  m.react("🕕");
  try {
    let mediaBuffer;
    if (m.quoted) {
      mediaBuffer = await m.quoted.download();
    } else if (m.download) {
      mediaBuffer = await m.download();
    }
    if (!mediaBuffer) {
      m.react("❌");
      return m.reply(`❌*ɢᴀɢᴀʟ*\n\n*El poderoso dodgerd*`);
    }
    let imageBuffer;
    try {
      imageBuffer = await (
        await getSharp()
      )(mediaBuffer)
        .resize(512, 512, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();
    } catch (e) {
      console.log("[SMEME] Sharp resize failed:", e.message);
      imageBuffer = mediaBuffer;
    }
    const form = new (0, _formdata2.default)();
    form.append('file', imageBuffer, {
      filename: "meme.png",
      contentType: "image/png",
    });
    let imageUrl;
    try {
      const uploadRes = await _axios2.default.post(
        "https://c.termai.cc/api/upload?key=AIzaBj7z2z3xBjsk",
        form,
        {
          headers: form.getHeaders(),
          timeout: 30000,
        },
      );
      if (_optionalChain([uploadRes, 'access', _ => _.data, 'optionalAccess', _2 => _2.status]) && _optionalChain([uploadRes, 'access', _3 => _3.data, 'optionalAccess', _4 => _4.path])) {
        imageUrl = uploadRes.data.path;
      }
    } catch (e) {
      console.log("[SMEME] Termai failed:", _optionalChain([e, 'access', _5 => _5.response, 'optionalAccess', _6 => _6.data]) || e.message, "Trying telegraph...");
    }
    if (!imageUrl) {
      try {
        const form2 = new (0, _formdata2.default)();
        form2.append('file', imageBuffer, {
          filename: "meme.png",
          contentType: "image/png",
        });
        const telegraphRes = await _axios2.default.post(
          "https://telegra.ph/upload",
          form2,
          {
            headers: form2.getHeaders(),
            timeout: 30000,
          },
        );
        if (_optionalChain([telegraphRes, 'access', _7 => _7.data, 'optionalAccess', _8 => _8[0], 'optionalAccess', _9 => _9.src])) {
          imageUrl = "https://telegra.ph" + telegraphRes.data[0].src;
        }
      } catch (e) {
        console.log("[SMEME] Telegraph failed:", e.message);
      }
    }
    if (!imageUrl) {
      m.react("❌");
      return m.reply(`❌*ɢᴀɢᴀʟ*\n\n# Fotos sin miedo, intenta otra vez más tarde #`);
    }
    console.log("[SMEME] Image uploaded:", imageUrl);
    const encodeText = (text) => {
      if (!text) return "_";
      return encodeURIComponent(text)
        .replace(/-/g, "--")
        .replace(/_/g, "__")
        .replace(/%20/g, "_");
    };
    const topEncoded = encodeText(top);
    const bottomEncoded = encodeText(bottom);
    const memeUrl = `https://api.memegen.link/images/custom/${topEncoded}/${bottomEncoded}.png?background=${encodeURIComponent(imageUrl)}`;
    const response = await _axios2.default.get(memeUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    const buffer = Buffer.from(response.data);
    await sock.sendImageAsSticker(m.chat, buffer, m, {
      packname: _optionalChain([_configjs.config, 'access', _10 => _10.sticker, 'optionalAccess', _11 => _11.packname]) || "Ourin-AI",
      author: _optionalChain([_configjs.config, 'access', _12 => _12.sticker, 'optionalAccess', _13 => _13.author]) || "♪",
    });
    m.react("✅");
  } catch (error) {
    console.log("[SMEME] Error:", error.message);
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}
exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
