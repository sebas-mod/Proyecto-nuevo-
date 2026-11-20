"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _canvas2 = require('@napi-rs/canvas'); var _canvas = _interopRequireWildcard(_canvas2);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _ourintimejs = require('../../src/lib/ourin-time.js'); var timeHelper = _interopRequireWildcard(_ourintimejs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourincontextjs = require('../../src/lib/ourin-context.js');
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinassetmanagerjs = require('../../src/lib/ourin-asset-manager.js');
const pluginConfig = {
  name: "nulis",
  alias: ["tulis", "write"],
  category: "tools",
  description: "Generate tulisan tangan di kertas",
  usage: ".nulis <teks>",
  example: ".nulis Aku cinta kamu selamanya",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};
const fontUrl = _ourinassetmanagerjs.getAssetBuffer.call(void 0, "ourin-font");
let _fontRegistered = false;
function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";
  for (const word of words) {
    const testLine = currentLine + (currentLine ? " " : "") + word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}
async function handler(m, { sock }) {
  const text = _optionalChain([m, 'access', _ => _.args, 'optionalAccess', _2 => _2.join, 'call', _3 => _3(" ")]);
  if (!text) {
    return m.reply(
      `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
        `> \`${m.prefix}escribiendo<teks>\`\n\n` +
        `> Ejemplo:\n` +
        `> \`${m.prefix}Te amo para siempre.\``,
    );
  }
  if (text.length > 500) {
    return m.reply(`❌*ᴛᴇᴋSᴛᴇʀʟᴀʟᴜ ᴘᴀɴᴊᴀɴɢ*\n\nPara el máximo de 500.000 caracteres`);
  }
  const inputUrl = _ourinassetmanagerjs.getAssetBuffer.call(void 0, "ourin-kertas");
  if (!inputUrl) {
    return m.reply(
      `❌*ᴛᴇᴍᴘʟᴀᴛᴇ ᴛɪᴅᴀᴋ ᴀᴅᴀ*\n\nEl documento del artículo no se encuentra en el contexto.`,
    );
  }
  await m.react("🕕");
  await m.reply(`🕕*ᴍᴇᴍᴘʀᴏSᴇ- Sí.\n\nPara escribir una mano.`);
  try {
    const { createCanvas, loadImage, GlobalFonts } = _canvas;
    if (!_fontRegistered) {
      try {
        const fontBuf = _ourinassetmanagerjs.getAssetBuffer.call(void 0, "ourin-font");
        if (fontBuf) {
          GlobalFonts.register(fontBuf, "Zahraaa");
        }
      } catch (err) {
        console.error("Carga sin miedo:", err);
      }
      _fontRegistered = true;
    }
    const bgBuf = _ourinassetmanagerjs.getAssetBuffer.call(void 0, "ourin-kertas");
    const bgImage = await loadImage(bgBuf);
    const canvas = createCanvas(bgImage.width, bgImage.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bgImage, 0, 0);
    const tgl = timeHelper.formatDate("DD/MM/YYYY");
    const hari = timeHelper.formatFull("dddd");
    ctx.font = "20px Zahraaa, Arial";
    ctx.fillStyle = "#1a1a2e";
    ctx.fillText(hari, 806, 78);
    ctx.font = "18px Zahraaa, Arial";
    ctx.fillText(tgl, 806, 102);
    ctx.font = "20px Zahraaa, Arial";
    const maxWidth = 600;
    const lineHeight = 28;
    const startX = 344;
    const startY = 142;
    const lines = wrapText(ctx, text, maxWidth);
    lines.forEach((line, i) => {
      ctx.fillText(line, startX, startY + i * lineHeight);
    });
    const buffer = canvas.toBuffer("image/jpeg");
    await m.react("✅");
    await sock.sendMedia(
      m.chat,
      buffer,
      `✅ *ʟᴜʟɪsᴀɴ ᴛᴀɴɢᴀɴ*\n\n> Hatihati ketahuan! 📖`,
      m,
      { type: "image", contextInfo: _ourincontextjs.saluranCtx.call(void 0, ) },
    );
  } catch (error) {
    await m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}
exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
