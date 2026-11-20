"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourinbratjs = require('../../src/lib/ourin-brat.js');

const pluginConfig = {
  name: "bratgreen",
  alias: ["brat2"],
  category: "sticker",
  description: "Membuat sticker brat ijo",
  usage: ".brat2 <text>",
  example: ".brat2 Hai semua",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ").trim();
  if (!text) {
    return m.reply(`🖼️ *BRAT GREEN*\n\n> Masukkan teks\n\n\`Contoh: ${m.prefix}bratgreen Hai semua\``);
  }

  m.react("🕕");

  try {
    const buffer = await _ourinbratjs.drawBrat.call(void 0, {
      text,
      bgColor: "#8ACE00",
      width: 512,
      height: 512,
      maxWidth: 450,
      maxHeight: 450,
      centerX: 256,
      centerY: 256,
      maxFontSize: 130,
      fontDecrement: 5,
      lineHeightMult: 1.1,
      textColor: "#000000"
    });

    await sock.sendImageAsSticker(m.chat, buffer, m, {
      packname: _configjs2.default.sticker.packname,
      author: _configjs2.default.sticker.author,
    });
    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
