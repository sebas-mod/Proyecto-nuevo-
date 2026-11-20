"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _seaartjs = require('../../src/scraper/seaart.js');
const pluginConfig = {
  name: "ourinbanana",
  alias: [],
  category: "ai",
  description: "Editar la imagen con AI utilizando el impulso",
  usage: ".ourinbanana <prompt>",
  example: ".ourinbanana make it anime style",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const prompt = m.args.join(" ");
  if (!prompt) {
    return m.reply(
      `🍌 *OURIN BANANA SUPER*\n\n` +
        `Editar imagen con AI\n\n` +
        `\`Contoh: ${m.prefix}ourinbanana make it anime style\`\n\n` +
        `# Responder o enviar una foto con capción #`,
    );
  }

  const isImage = m.isImage || (m.quoted && m.quoted.isImage);
  if (!isImage) {
    return m.reply(
      `🍌*ɴᴀɴᴏ ʙᴀɴᴀɴᴀ*\n\n# Responder o enviar una foto con capción #`,
    );
  }

  m.react("🕕");

  try {
    let mediaBuffer;
    if (m.isImage && m.download) {
      mediaBuffer = await m.download();
    } else if (m.quoted && m.quoted.isImage && m.quoted.download) {
      mediaBuffer = await m.quoted.download();
    }

    if (!mediaBuffer || !Buffer.isBuffer(mediaBuffer)) {
      m.react("❌");
      return m.reply(`❌*ɢᴀɢᴀʟ*\n\n# Crawling pictures`);
    }

    const resultBuffer = await _seaartjs.live3d.call(void 0, mediaBuffer, prompt).then(
      (res) => res.image,
    );

    m.react("✅");

    await sock.sendMedia(m.chat, resultBuffer, null, m, {
      type: "image",
    });
  } catch (error) {
    console.log(error);
    m.react("❌");
    m.reply(`🍀Me temo que tengo control.
Inténtelo de nuevo más tarde, por trust don`);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
