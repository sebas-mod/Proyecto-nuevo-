"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _tesseractjs = require('tesseract.js'); var _tesseract = _interopRequireWildcard(_tesseractjs);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _almikucontextjs = require('../../src/lib/almiku-context.js');

function getTesseract() {
  return _tesseract;
}
const pluginConfig = {
  name: "ocr",
  alias: ["totext", "imagetotext", "readtext"],
  category: "tools",
  description: "Exdetectar texto de la imagen (Desactivado / Local )",
  usage: ".ocr (reply gambar)",
  example: ".ocr",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};
async function handler(m, { sock }) {
  const isImage = m.isImage || (m.quoted && m.quoted.type === "imageMessage");
  if (!isImage) {
    return m.reply(
      `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
        `# Responder dibujar con\`${m.prefix}ocr\`\n\n` +
        `El respaldo up Media:\n` +
        `> JPG, PNG, GIF, WEBP`,
    );
  }
  await m.react("🕕");
  await m.reply(`🕕*ᴍᴇᴍᴘʀᴏSᴇ- Sí.\n\nExtracting the text from the picture.`);
  try {
    let buffer;
    if (m.quoted && m.quoted.isMedia) {
      buffer = await m.quoted.download();
    } else if (m.isMedia) {
      buffer = await m.download();
    }
    if (!buffer || buffer.length === 0) {
      await m.react("❌");
      return m.reply(`❌*ɢᴀɢᴀʟ*\n\n* No se puede descargar la imagen`);
    }
    const Tesseract = await getTesseract();
    const {
      data: { text },
    } = await Tesseract.recognize(buffer, "eng", {});
    const extractedText = text ? text.trim() : "";
    if (!extractedText || extractedText.length === 0) {
      await m.react("❌");
      return m.reply(
        `❌*ᴛɪᴅᴀᴋ ᴀᴅᴀ ᴛᴇᴋs •\n\n*Ningún texto detectado en la imagen`,
      );
    }
    await m.react("✅");
    const responseText =
      `📖 *ᴏᴄʀ ʀᴇsᴜʟᴛ*\n\n` +
      `╭┈┈⬡「 📝 *ᴛᴇᴋs* 」\n` +
      `${extractedText
        .split("\n")
        .map((l) => `┃ ${l}`)
        .join("\n")}\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `> Total: ${extractedText.length}caracter`;
    await _almikucontextjs.sendToolsPreview.call(void 0, 
      sock,
      m.chat,
      responseText,
      "📖 *ᴏᴄʀ*",
      `${extractedText.length} chars`,
      { quoted: m },
    );
  } catch (e) {
    await m.react("☢");
    m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}
exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
