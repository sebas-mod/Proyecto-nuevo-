"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _txt2img2js = require('../../src/scraper/txt2img2.js');

const pluginConfig = {
  name: "text2img4",
  alias: ["t2i2", "imggen2", "flux"],
  category: "ai",
  description: "Imagen imagen imagen imagen de la tx usando.xKlein 4B",
  usage: ".txt2img2 <deskripsi gambar>",
  example: ".txt2img2 Mobil Lamborghini revuelto",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 3,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ");
  if (!text) {
    m.react("❌");
    return m.reply(
      `🎨 *Text to Image (Flux)*\n\n` +
      `Imagen imagen imagen imagen imagen imagen imagen imagen de la descripción del texto usando AI EgxKlein 4B.\n\n` +
      `*Uso:*\n` +
      `> *${m.prefix}txt2img2 <deskripsi>*\n\n` +
      `*Ejemplo:*\n` +
      `> *${m.prefix}txt2img2 Mobil Lamborghini revuelto*\n` +
      `> *${m.prefix}txt2img2 Kucking lucu utilizando sombrero *\n\n` +
      `EfformProsses old fashioned generation, about 30 - 60 segundos _`
    );
  }

  m.react("🕕");

  try {
    const result = await _txt2img2js.Txt2Img2.call(void 0, text);

    if (!result.status) {
      m.react("☢");
      return m.reply(`❌*Generate Fallido*\n\n•${result.error}`);
    }

    await sock.sendMedia(m.chat, result.url, `🎨 *Flux Klein 4B*\n\n> Prompt: *${result.prompt}*`, m, {
      type: "image",
    });

    m.react("✅");
  } catch (e) {
    console.error(e);
    m.react("☢");
    m.reply("❌stunner generación de imagen, probar de nuevo más tarde");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
