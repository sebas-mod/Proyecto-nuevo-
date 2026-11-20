"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _cheerio = require('cheerio');
var _nodefetch = require('node-fetch'); var _nodefetch2 = _interopRequireDefault(_nodefetch);

const pluginConfig = {
  name: "soundcloud",
  alias: ["scsearch", "scs"],
  category: "search",
  description: "Cari lagu di SoundCloud",
  usage: ".soundcloud judul",
  example: ".soundcloud Only We Know",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function scSearch(q) {
  const url = "https://m.soundcloud.com/search?q=" + encodeURIComponent(q);
  const res = await _nodefetch2.default.call(void 0, url, {
    headers: {
      "user-agent": "Mozilla/5.0",
    },
  });
  const html = await res.text();
  const $ = _cheerio.load.call(void 0, html);
  const jsonText = $("#__NEXT_DATA__").text();
  if (!jsonText) return [];
  const json = JSON.parse(jsonText);

  const tracks = json.props.pageProps.initialStoreState.entities.tracks;
  if (!tracks) return [];

  const result = Object.values(tracks)
    .filter((v) => v && v.data && v.data.title)
    .map((v) => {
      const d = v.data;
      return {
        id: d.id || "-",
        title: d.title || "-",
        url: d.permalink_url || "-",
        user_id: d.user_id || "-",
        artwork: d.artwork_url || null,
        duration: d.duration || "-",
        plays: d.playback_count || "-",
        likes: d.likes_count || "-",
        comments: d.comment_count || "-",
        reposts: d.reposts_count || "-",
        created_at: d.created_at || "-",
      };
    });

  return result;
}

async function handler(m, { args, sock }) {
  if (!args[0]) {
    let txt = `🎵 *SOUNDCLOUD SEARCH* 🎵\n\n`;
    txt += `Oye, hermana, ¿qué canción tiene hoy?\n\n`;
    txt += `*Como usarlo:*\n`;
    txt += `👉 \`${m.prefix}soundcloud <judul lagu>\`\n\n`;
    txt += `*Ejemplo:*\n`;
    txt += `\`${m.prefix}soundcloud Only We Know\``;
    return m.reply(txt);
  }

  await m.react("🕕");

  try {
    const data = await scSearch(args.join(" "));
    if (!data.length) {
      return m.reply(`❌Eres un hombre muy guapo.😭`);
    }
    let thumb = _optionalChain([data, 'access', _ => _.find, 'call', _2 => _2((v) => v.artwork), 'optionalAccess', _3 => _3.artwork]) || null;
    let txt = `🎧* PRESIDENTE DEL SUR DE SOUDCLOD *🎧\n\n`;
    let contentTxt = "";
    const limit = Math.min(data.length, 5);
    for (let i = 0; i < limit; i++) {
      contentTxt += `🎵 *Title :* ${data[i].title}\n`;
      contentTxt += `🔗 *Url :* ${data[i].url}\n`;
      contentTxt += `👁️ *Views :* ${data[i].plays}\n`;
      contentTxt += `❤️ *Likes :* ${data[i].likes}\n`;
      contentTxt += `💬 *Comments :* ${data[i].comments}\n`;
      contentTxt += `🔁 *Reposts :* ${data[i].reposts}`;
      if (i < limit - 1) contentTxt += `\n\n`;
    }
    txt += contentTxt.trim().split("\n").map(line => line.trim() ? `${line}` : ``).join("\n");
    txt += `\n\n`;
    txt += `Quieres descargar lagunya, pa fusor\`${m.prefix}playsc de juego\`solo hermano!😉`;
    if (thumb) {
      await sock.sendMedia(m.chat, thumb, txt.trim(), m, { type: "image" });
    } else {
      await m.reply(txt.trim());
    }
    await m.react("✅");
  } catch (e) {
    m.reply(`❌Lo siento hermano, ¡ha habido un error!\nError:${e.message}`);
  }
}

exports.config = pluginConfig; exports.handler = handler; exports.scSearch = scSearch;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
