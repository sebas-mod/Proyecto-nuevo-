"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourinhttpjs = require('../../src/lib/ourin-http.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
  name: "text2img",
  alias: [],
  category: "ai",
  description: "Imagen imagen imagen del texto",
  usage: ".text2img <teks>",
  example: ".text2img Buat gambar dari teks",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ");
  if (!text) {
    return m.reply(
      `📿*ᴛᴇxᴛ ᴛᴏ ɪᴍᴀɢᴇ*\n\n*Pon los mensajes*\n\n\`Ejemplo:${m.prefix}text2img Imagen del texto\``,
    );
  }

  m.react("🕕");

  try {
    const url = `https://firefly.maiku.my.id/api/deepai?apikey=${_configjs2.default.APIkey.firefly}&prompt=${encodeURIComponent(text)}`;
    const data = await _axios2.default.get(url);

    const content = data.data.data.output_url;

    m.react("✅");
    await sock.sendMedia(m.chat, content, text, m, {
      type: "image",
    });
  } catch (error) {
    console.error(error);
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
