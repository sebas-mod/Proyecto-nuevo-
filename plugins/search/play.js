"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ytsearch = require('yt-search'); var _ytsearch2 = _interopRequireDefault(_ytsearch);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const pluginConfig = {
  name: "play",
  alias: ["playaudio"],
  category: "search",
  description: "Putar musik dari YouTube",
  usage: ".play <query>",
  example: ".play komang",
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

function formatViews(n) {
  if (!n) return "0";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

async function handler(m, { sock, text }) {
  const query = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
  if (!query)
    return m.reply(`🎵 *ᴘʟᴀʏ*\n\n> Contoh:\n\`${m.prefix}play komang\``);

  m.react("🕐");

  try {
    const search = await _ytsearch2.default.call(void 0, query);
    if (!search.videos.length) throw new Error("Video tidak ditemukan");
    const video = search.videos[0];

    const res = await _axios2.default.get(`https://api.azbry.com/api/download/ytmp3?url=${encodeURIComponent(video.url)}`, { timeout: 60000 });
    const data = res.data;
    
    if (!data.status || !data.result || !data.result.download) {
       throw new Error("Gagal mengambil audio dari API");
    }

    let info = `🎵 *NOW PLAYING*\n\n`;
    info += `📌 *Judul:* ${video.title}\n\n`;
    info += `*DETAIL*\n`;
    info += `👤 Channel: *${video.author.name}*\n`;
    info += `⏱️ Durasi: *${video.duration.timestamp}*\n`;
    info += `👀 Views: *${formatViews(video.views)}*\n`;
    info += `📅 Upload: *${video.ago}*\n`;
    info += `🆔 ID: \`${video.videoId}\`\n\n`;
    if (video.description) {
      const desc = video.description.substring(0, 150).replace(/\n/g, " ");
      info += `*Deskripsi:*\n_${desc}${video.description.length > 150 ? "..." : ""}_\n\n`;
    }
    info += `🔗 ${video.url}\n\n`;
    info += `_⏳ mengirim audio, harap tunggu..._`;

    await sock.sendPreview(
      m.chat,
      {
        caption: `${info}`,
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

    const audioRes = await _axios2.default.get(data.result.download, { responseType: "arraybuffer", timeout: 60000 });
    const audioBuffer = Buffer.from(audioRes.data);

    await sock.sendMessage(
      m.chat,
      {
        audio: audioBuffer,
        mimetype: "audio/mpeg",
        ptt: false,
        fileName: `${video.title}.mp3`,
      },
      { quoted: m },
    );

    m.react("✅");
  } catch (err) {
    console.error("[Play]", err);
    m.react("😭");
    m.reply(
      `Wahhh, fitur putar musiknya lagi ada kendala kak, coba lagi nanti yak, jangan spam`,
    );
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
