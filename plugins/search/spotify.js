"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _almiku = require('almiku');
var _sharp = require('sharp'); var _sharp2 = _interopRequireDefault(_sharp);

const pluginConfig = {
  name: "spotify",
  alias: ["spotifysearch", "spsearch"],
  category: "search",
  description: "Búsqueda de conjunto de canciones en Spotify basado en encabezado o artistas",
  usage: ".spotify <query>",
  example: ".spotify neffex grateful",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock, text }) {
  if (!text) {
    return m.reply("❌♫ Wretched, Donde 's the key?\n\nDebe poner en una canción principal o en nombre de un artista para buscar en Spotify.\n\nEjemplo de uso:`. notificar bruno mars.`");
  }

  await m.react("🕕");

  try {
    const res = await _axios2.default.get(`https://api.nexray.eu.cc/search/spotify?q=${encodeURIComponent(text)}`);
    const data = res.data;

    if (!data.status || !data.result || data.result.length === 0) {
      await m.react("❌");
      return m.reply(`⚠¡Lo siento, la canción no se encontró!\n\nHe estado mirando a través de las palabras clave.${text}* pero no hay resultado en Spotify.`);
    }

    const results = data.result.slice(0, 5);
    const firstResult = results[0];

    let contentText = `✨* EL PRESIDENTE DE SPOTIFY search *✨\n\nMe las arreglé para encontrar algunas de las palabras clave canciones basadas.${text}* El trono es su lista:\n\n`;

    results.forEach((t, i) => {
      contentText += `*${i + 1}. ${t.title}*\n`;
      contentText += `   🎤 Artis: ${t.artist}\n`;
      contentText += `   ⏱️ Duración:${t.duration}\n`;
      contentText += `   🔗Enlace:${t.url}\n\n`;
    });

    contentText += `Puedes mezclar una melodía en la parte superior y usar el comando\`.<link>\`O el putt presión de puck en este pantano para la primera canción.🚀`;

    let thumbnailBuffer = null;
    try {
      const imageResponse = await _axios2.default.get(firstResult.thumbnail, { responseType: "arraybuffer" });
      thumbnailBuffer = await _sharp2.default.call(void 0, imageResponse.data).resize(300, 170).jpeg().toBuffer();
    } catch (e) {
    }

    if (thumbnailBuffer) {
      const content = {
        buttonsMessage: {
          buttons: [
            {
              buttonId: `.spdl ${firstResult.url}`,
              buttonText: { displayText: '🎵 Unduh Lagu Pertama' },
              type: 1,
            }
          ],
          locationMessage: {
            jpegThumbnail: thumbnailBuffer,
            name: firstResult.title,
            address: `🎤 ${firstResult.artist} | ⏱️ ${firstResult.duration}`
          },
          contentText: contentText,
          footerText: '🚀 AL MIKU MD - Spotify Search',
          headerType: 6,
        },
      };

      const msg = _almiku.generateWAMessageFromContent.call(void 0, m.chat, content, { quoted: m });
      await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    } else {
      await m.reply(contentText);
    }

    await m.react("✅");

  } catch (err) {
    console.error("[Spotify Search]", err.message);
    await m.react("☢");
    m.reply("😔* Ouch, looks like there 's a problem. *\n\nIt 's a fatal error trying to process Spotify search.");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
