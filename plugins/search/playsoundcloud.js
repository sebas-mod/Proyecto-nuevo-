"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _soundcloudjs = require('./soundcloud.js');
var _soundclouddljs = require('../../src/scraper/soundclouddl.js'); var _soundclouddljs2 = _interopRequireDefault(_soundclouddljs);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);

const pluginConfig = {
  name: "playsoundcloud",
  alias: ["playsc"],
  category: "search",
  description: "Busca y descarga la canción de SoundCoud",
  usage: ".playsc judul",
  example: ".playsc Only We Know",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { args, sock }) {
  if (!args[0]) {
    let txt = `🎶 *PLAY SOUNDCLOUD* 🎶\n\n`;
    txt += `¡Puedo encontrarlo una vez descargando forte para ti!\n\n`;
    txt += `*Como usarlo:*\n`;
    txt += `👉 \`${m.prefix}playsc <judul lagu>\`\n\n`;
    txt += `*Ejemplo:*\n`;
    txt += `\`${m.prefix}playsc Only We Know\``;
    return m.reply(txt);
  }

  await m.react("🕕");

  try {
    const searchResults = await _soundcloudjs.scSearch.call(void 0, args.join(" "));
    if (!searchResults.length) {
      return m.reply(`❌Sí, iré a la policía.😭`);
    }

    const track = searchResults[0];
    const downloadInfo = await _soundclouddljs2.default.call(void 0, track.url);
    let contentTxt = `🎵 *Judul :* ${downloadInfo.title}\n`;
    contentTxt += `👤 *Uploader :* ${downloadInfo.uploader}\n`;
    contentTxt += `⏱Duración:${downloadInfo.duration}\n`;
    contentTxt += `👁️ *Views :* ${downloadInfo.views}\n`;
    contentTxt += `❤️ *Likes :* ${downloadInfo.likes}\n`;
    contentTxt += `📦 *Ukuran :* ${downloadInfo.size}`;

    let txt = `🎉¡Arriba!🎉\n\n`;
    txt += contentTxt.trim().split("\n").map(line => `${line}`).join("\n");
    txt += `\n\n`;
    txt += `- Audio MP3 está siendo enviado, esperando por ti hermana!🎶`;

    await sock.sendMedia(m.chat, downloadInfo.thumbnail || track.artwork, txt.trim(), m, { type: "image" });
    await sock.sendMedia(m.chat, downloadInfo.download_url, downloadInfo.title, m, { type: "audio" });

    await m.react("✅");
  } catch (e) {
    m.reply(`❌¡Steenhead ha descargado el hermano de la canción!😭\nError:${e.message}`);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
