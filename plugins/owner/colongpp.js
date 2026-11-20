"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _canvas2 = require('@napi-rs/canvas'); var _canvas = _interopRequireWildcard(_canvas2);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);


var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
  name: "colongpp",
  alias: ["stealpp", "malingpp", "ambilpp"],
  category: "owner",
  description: "Ambiel",
  usage: ".colongpp (reply pesan target)",
  example: ".colongpp",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};
const FALLBACK_PP = "https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg";
const PP_SIZE = 640;
async function resizeForPP(buffer) {
  const { createCanvas, loadImage } = _canvas;
  const img = await loadImage(buffer);
  const canvas = createCanvas(PP_SIZE, PP_SIZE);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, PP_SIZE, PP_SIZE);
  return canvas.toBuffer("image/jpeg");
}
async function handler(m, { sock }) {
  const targetJid = _optionalChain([m, 'access', _ => _.quoted, 'optionalAccess', _2 => _2.sender]) || _optionalChain([m, 'access', _3 => _3.mentions, 'optionalAccess', _4 => _4[0]]);
  console.log(targetJid);
  if (!targetJid) {
    return m.reply(
      `🕵️ *ᴄᴏʟᴏɴɢ ᴘᴘ*\n\n` +
        `* Responder tiene el mensaje de alguien de robar su PP\n\n` +
        `*ᴄᴀʀᴀ:*\n` +
        `# Responder mensaje objetivo #→ \`${m.prefix}colongpp\``,
    );
  }
  await m.react("🕵️");
  try {
    let ppBuffer;
    let source = "profil";
    try {
      const ppUrl = await sock.profilePictureUrl(targetJid, "image");
      const res = await _axios2.default.get(ppUrl, {
        responseType: "arraybuffer",
        timeout: 15000,
      });
      ppBuffer = Buffer.from(res.data);
    } catch (e) {
      const res = await _axios2.default.get(FALLBACK_PP, {
        responseType: "arraybuffer",
        timeout: 15000,
      });
      ppBuffer = Buffer.from(res.data);
      source = "desafout (el objetivo no tiene PP )";
    }
    const processed = await resizeForPP(ppBuffer);
    const botJid = _optionalChain([sock, 'access', _5 => _5.user, 'optionalAccess', _6 => _6.id]);
    await sock.updateProfilePicture(botJid, processed);
    const targetNumber = targetJid.split("@")[0];
    await m.react("✅");
    return m.reply(
      `✅ *ᴘᴘ ʙᴇʀʜᴀsɪʟ ᴅɪᴄᴏʟᴏɴɢ!*\n\n` +
        `> 🎯 Objetivo: @${targetNumber}\n` +
        `> 📸 Sumber: ${source}`,
      { mentions: [targetJid] },
    );
  } catch (err) {
    console.error("[ColongPP] Error:", err.message);
    await m.react("☢");
    return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}
exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
