"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _sharp2 = require('sharp'); var _sharp3 = _interopRequireDefault(_sharp2);

const pluginConfig = {
  name: "hd2",
  alias: ["enhance2", "upscale2", "aienhancer"],
  category: "tools",
  description: "Mejorar la imagen en HD con AI ( V3 )",
  usage: ".hd2 (reply gambar)",
  example: ".hd2",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const isImage = m.isImage || (m.quoted && m.quoted.type === "imageMessage");

  if (!isImage) {
    let help = `✨* FUTURA SU ENHANCE V2 *\n\n`
    help += `Aumenta tu resolución de imagen a mucho más HD y uso afilado AI!\n\n`
    help += `*Como usarlo:*\n`
    help += `- Fotos de Carver y mensaje *${m.prefix}hd2*\n`
    help += `- O una respuesta enviada a la imagen con un pedido *${m.prefix}hd2*\n\n`
    help += `*Promes rendering puede necesitar unos segundos de naranja un minuto.*`
    return m.reply(help);
  }

  await m.react("🕕");

  try {
    let buffer;
    if (m.quoted && m.quoted.isMedia) {
      buffer = await m.quoted.download();
    } else if (m.isMedia) {
      buffer = await m.download();
    }

    if (!buffer) {
      await m.react("❌");
      return m.reply(`Lo sentimos, el sistema no pudo descargar la imagen que dibujaste.`);
    }

    const form = new (0, _formdata2.default)();
    form.append("image", buffer, { filename: "image.jpg", contentType: "image/jpeg" });
    form.append("type", "upscale");
    form.append("scale", "2");

    const response = await _axios2.default.post("https://my.izuka-api.xyz/api/tools/imglarger", form, {
      headers: form.getHeaders(),
      timeout: 60000
    });

    const data = response.data;
    if (!data || !data.status || !data.result) {
      await m.react("❌");
      return m.reply(`Lo siento, Al no ha podido procesar su imagen está vez por favor, ¡inténtelo de nuevo en unos momentos!`);
    }

    await m.react("✅");

    const thumbBuffer = await _sharp3.default.call(void 0, buffer).resize(50, 50).jpeg({ quality: 30 }).toBuffer();

    await sock.sendMessage(
      m.chat,
      {
        document: { url: data.result },
        mimetype: "image/jpeg",
        jpegThumbnail: thumbBuffer,
        fileName: `HD_BY_${_configjs2.default.bot.name}.jpg`,
      },
      { quoted: m },
    );

  } catch (error) {
    console.error("[HD2 Plugin Error]", error);
    await m.react("☢");
    m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
