"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ytsearch = require('yt-search'); var _ytsearch2 = _interopRequireDefault(_ytsearch);
var _ytdljs = require('../../src/scraper/ytdl.js'); var _ytdljs2 = _interopRequireDefault(_ytdljs);

const pluginConfig = {
  name: "playvid",
  alias: ["playvideo", "playmp4"],
  category: "search",
  description: "Busca y video bucle desde YouTube",
  usage: ".playvid <query>",
  example: ".playvid windah basudara",
  cooldown: 15,
  energi: 2,
  isEnabled: true,
};

function formatViews(n) {
  if (!n) return "0";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

async function getVideoDownloadUrl(url) {
  try {
    const { data } = await _axios2.default.get(
      `https://my.izuka-api.xyz/api/downloader/ytmp4?url=${encodeURIComponent(url)}`
    );

    if (_optionalChain([data, 'optionalAccess', _ => _.status]) && _optionalChain([data, 'optionalAccess', _2 => _2.result, 'optionalAccess', _3 => _3.video_normal])) {
      const videos = data.result.video_normal.filter(v => v.ext === "mp4");
      if (videos.length > 0) {
        videos.sort((a, b) => parseInt(b.quality) - parseInt(a.quality));
        if (videos[0] && videos[0].url) {
          return videos[0].url;
        }
      }
    }
  } catch (e) {
    console.error("[YTMP4 Izuka API Error]", e.message);
  }

  const fallback = await _ytdljs2.default.call(void 0, url, "mp4");
  if (_optionalChain([fallback, 'optionalAccess', _4 => _4.status]) && _optionalChain([fallback, 'optionalAccess', _5 => _5.dl])) {
    return fallback.dl;
  }

  throw new Error(_optionalChain([fallback, 'optionalAccess', _6 => _6.mess]) || "Stempel obtiene descargas de vídeo de URL");
}

async function handler(m, { sock, text }) {
  const query = _optionalChain([m, 'access', _7 => _7.text, 'optionalAccess', _8 => _8.trim, 'call', _9 => _9()]);
  if (!query) {
    return m.reply(`Hola *${m.pushName}*👋\n\nPara buscar y reproducir videos de YouTube, por favor utilice forts:\n-\`${m.prefix}playvid <judul video>\`\n\nContoh:\n- \`${m.prefix}playvid windah basudara\``);
  }

  m.react("🕕");

  try {
    const search = await _ytsearch2.default.call(void 0, query);
    if (!search.videos.length) throw new Error("No se encontró vídeo");
    const video = search.videos[0];

    let info = `Hola *${m.pushName}*, aquí está el vídeo que buscas:\n\n`;
    info += `📌 *Judul:* ${video.title}\n`;
    info += `👤 *Channel:* ${video.author.name}\n`;
    info += `⏱️ *Duración:*${video.duration.timestamp}\n`;
    info += `👀 *Views:* ${formatViews(video.views)}\n`;
    info += `📅 *Upload:* ${video.ago}\n\n`;
    info += `¿Qué?⏳Pitch descarga video, por favor espere un momento..`;

    await sock.sendPreview(
      m.chat,
      {
        caption: video.url + "\n" + info,
        url: video.url,
        title: video.title,
        description: "YouTube Video",
        image: video.thumbnail,
        previewType: 1,
      },
      {
        quoted: m,
      },
    );

    const downloadUrl = await getVideoDownloadUrl(video.url);

    await sock.sendMedia(m.chat, downloadUrl, null, m, {
      type: "video",
    });

    m.react("✅");
  } catch (err) {
    console.error("[PlayVid]", err);
    m.react("❌");
    m.reply(
      `Lo siento *${m.pushName}*, el video spin está en control o el video es demasiado grande.`,
    );
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
