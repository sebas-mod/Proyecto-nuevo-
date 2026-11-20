"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _almikucontextjs = require('../../src/lib/almiku-context.js');
const NEOXR_APIKEY = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.neoxr]) || "Milik-Bot-OurinMD";

const pluginConfig = {
  name: "filmget",
  alias: ["getfilm", "filmdetail", "filminfo"],
  category: "search",
  description: "Ambil detail film",
  usage: ".filmget <url>",
  example: ".filmget https://tv.neoxr.eu/film/civil-war-2024",
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};


async function handler(m, { sock }) {
  const args = m.args || [];
  const url = _optionalChain([args, 'access', _3 => _3[0], 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()]);

  if (!url || !url.includes("neoxr.eu")) {
    return m.reply(
      `🎬 *ꜰɪʟᴍ ᴅᴇᴛᴀɪʟ*\n\n` +
        `Emime detalles film de URL\n\n` +
        `*Formato:*\n` +
        `> \`${m.prefix}filmget <url>\`\n\n` +
        `> Usa \`${m.prefix}film peecula<judul>\`La peelícula.`,
    );
  }

  m.react("🎬");

  try {
    const apiUrl = `https://api.neoxr.eu/api/film-get?url=${encodeURIComponent(url)}&apikey=${NEOXR_APIKEY}`;
    const { data } = await _axios2.default.get(apiUrl, { timeout: 30000 });

    if (!_optionalChain([data, 'optionalAccess', _6 => _6.status]) || !_optionalChain([data, 'optionalAccess', _7 => _7.data])) {
      m.react("❌");
      return m.reply("❌*ɢᴀɢᴀʟ*\n\nFilm no encontrada");
    }

    const film = data.data;
    const streams = data.stream || [];
    const downloads = data.download || [];

    let thumbBuffer = null;
    if (film.thumbnail) {
      try {
        const thumbRes = await _axios2.default.get(film.thumbnail, {
          responseType: "arraybuffer",
          timeout: 10000,
        });
        thumbBuffer = Buffer.from(thumbRes.data);
      } catch (e) {}
    }

    let text = `🎬 *${film.title || "Film"}*\n\n`;
    text += `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n`;
    text += `┃ ⭐ Rating: ${film.rating || "-"}\n`;
    text += `┃ 📺 Quality: ${film.quality || "-"}\n`;
    text += `┃ ⏱️ Duration: ${film.duration || "-"}\n`;
    text += `┃ 📅 Release: ${film.release || "-"}\n`;
    text += `┃ 🎭 Genre: ${film.tags || "-"}\n`;
    text += `┃ 🎬 Director: ${film.director || "-"}\n`;
    text += `┃ 👥 Actors: ${film.actors || "-"}\n`;
    text += `╰┈┈┈┈┈┈┈┈⬡\n\n`;

    text += `📝 *Synopsis:*\n`;
    text += `> ${film.synopsis || "-"}\n\n`;

    if (streams.length > 0) {
      text += `▶️ *Streaming:*\n`;
      streams.forEach((s, i) => {
        text += `> ${i + 1}. ${s.server}\n`;
      });
      text += `\n`;
    }

    if (downloads.length > 0) {
      text += `📥 *Download:*\n`;
      downloads.forEach((d, i) => {
        text += `> ${i + 1}. ${d.provider}\n`;
      });
    }

    const buttons = [];

    if (streams.length > 0) {
      buttons.push({
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: `▶️ ${streams[0].server}`,
          url: streams[0].url,
        }),
      });
    }

    downloads.slice(0, 2).forEach((d) => {
      buttons.push({
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: `📥 ${d.provider}`,
          url: d.url,
        }),
      });
    });

    const saluranId = _optionalChain([_configjs2.default, 'access', _8 => _8.saluran, 'optionalAccess', _9 => _9.id]) || "120363400911374213@newsletter";
    const saluranName = _optionalChain([_configjs2.default, 'access', _10 => _10.saluran, 'optionalAccess', _11 => _11.name]) || _optionalChain([_configjs2.default, 'access', _12 => _12.bot, 'optionalAccess', _13 => _13.name]) || "Al Miku-AI";

    const msgContent = {
      text,
      footer: `🎬 Nonton Film Online`,
      contextInfo: _almikucontextjs.saluranCtx.call(void 0, ),
    };

    if (buttons.length > 0) {
      msgContent.interactiveButtons = buttons;
    }

    await sock.sendMessage(m.chat, msgContent, { quoted: m });

    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
