"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _ytsearch = require('yt-search'); var _ytsearch2 = _interopRequireDefault(_ytsearch);
var _ourin = require('ourin');
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _sharp = require('sharp'); var _sharp2 = _interopRequireDefault(_sharp);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const pluginConfig = {
  name: "yts",
  alias: ["ytsearch", "youtubesearch"],
  category: "search",
  description: "Buscar videos en YouTube basado en palabras clave y mostrar detalles completos con la miniatura.",
  usage: ".yts <query>",
  example: ".yts lagu pop terbaru",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock, text }) {
  if (!text) {
    return m.reply("❌* Wallow, dijo el kuncinkinya vacio!\n\nUsted debe poner en un vídeo @-@ contraseña líder que desea buscar.\n\nEjemplo de uso:`. yts canción de la unwinninonesia.`");
  }

  await m.react("🕕");

  try {
    const searchResults = await _ytsearch2.default.call(void 0, text);
    const videos = searchResults.videos;

    if (!videos || videos.length === 0) {
      await m.react("❌");
      return m.reply("⚠Lo sentimos, pero no podemos encontrar resultados.\n\nTal vez la palabra la clave es demasiado específica.");
    }

    const firstVideo = videos[0];

    const imageResponse = await _axios2.default.get(firstVideo.thumbnail, { responseType: "arraybuffer" });
    const thumbnailBuffer = await _sharp2.default.call(void 0, imageResponse.data).resize(300, 170).jpeg().toBuffer();

    const contentText = `✨* PRESIDENTE DE SU TURNING*✨

Aquí viene los resultados de búsqueda de loto que encontré basado en las palabras clave que diste.

🔎* La búsqueda clave *:${text}
🎬 *Judul Video*: ${firstVideo.title}
📺*Nombre Channel*:${firstVideo.author.name}
⏱*Dubasi Video*${firstVideo.timestamp}
👁️ *Cantidad Penonton*: ${firstVideo.views} views
📅*Tiempo Subido*:${firstVideo.ago}
🔗*Enlace Video*:${firstVideo.url}

Ya he hecho está nota de vídeo sobre el mensaje que solicitó.😎

¡Elija uno de estos botones para la descarga o el audio!`;

    const content = {
      buttonsMessage: {
        buttons: [
          {
            buttonId: `.ytmp4 ${firstVideo.url}`,
            buttonText: { displayText: '🎥 Unduh Video' },
            type: 1,
          },
          {
            buttonId: `.ytmp3 ${firstVideo.url}`,
            buttonText: { displayText: '🎵 Unduh Audio' },
            type: 1,
          },
        ],
        locationMessage: {
          jpegThumbnail: thumbnailBuffer,
          name: firstVideo.title,
          address: `📺 Channel: ${firstVideo.author.name}♪⏱️ Duración:${firstVideo.timestamp}`
        },
        contentText: contentText,
        footerText: _configjs2.default.bot.name,
        headerType: 6,
      },
    };

    const msg = _ourin.generateWAMessageFromContent.call(void 0, m.chat, content, {
      quoted: m,
    });

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    await m.react("✅");

  } catch (error) {
    console.error(error);
    await m.react("❌");
    m.reply("😔* Ouch, parece que hay un problema en mi sistema. *\n\nFue un error tratar de encontrar el video en YouTube.");
  }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
