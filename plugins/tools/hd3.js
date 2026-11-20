"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _sharp2 = require('sharp'); var _sharp3 = _interopRequireDefault(_sharp2);

const pluginConfig = {
  name: "hd3",
  alias: ["enhance3", "upscale3", "unblur"],
  category: "tools",
  description: "Explica la imagen borrosa para ser afilada con IA ( Unblur )",
  usage: ".hd3 (reply gambar)",
  example: ".hd3",
  cooldown: 20,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const isImage = m.isImage || (m.quoted && m.quoted.type === "imageMessage");

  if (!isImage) {
    let help = `✨* FITURE HD ENHANCE V3 ( UNBLLARY) *\n\n`
    help += `Una característica sofisticada para redistribuir una imagen borrosa en un retorno claro y agudo usando inteligencia artificial!\n\n`
    help += `*Como usarlo:*\n`
    help += `- Fotos de Carver y mensaje *${m.prefix}hd3*\n`
    help += `- O una respuesta enviada a la imagen con un pedido *${m.prefix}hd3*\n\n`
    help += `El proceso está haciendo tal vez necesite un tiempo.`
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

    const response = await _axios2.default.post("https://my.izuka-api.xyz/api/tools/unblur", form, {
      headers: form.getHeaders(),
      timeout: 60000
    });

    const data = response.data;
    if (!data || !data.status || !data.result || !data.result.output_url || !data.result.output_url[0]) {
      await m.react("❌");
      return m.reply(`Lo siento, Al no ha podido procesar su imagen está vez por favor, ¡inténtelo de nuevo en unos momentos!`);
    }

    await m.react("✅");

    const resultUrl = data.result.output_url[0];
    const thumbBuffer = await _sharp3.default.call(void 0, buffer).resize(50, 50).jpeg({ quality: 30 }).toBuffer();

    await sock.sendMessage(
      m.chat,
      {
        document: { url: resultUrl },
        mimetype: "image/jpeg",
        jpegThumbnail: thumbBuffer,
        fileName: `UNBLUR_BY_${_configjs2.default.bot.name}.jpg`,
      },
      { quoted: m },
    );

  } catch (error) {
    console.error("[HD3 Plugin Error]", error);
    await m.react("☢");
    m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
