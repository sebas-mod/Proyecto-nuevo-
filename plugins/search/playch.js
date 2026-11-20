"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ytsearch = require('yt-search'); var _ytsearch2 = _interopRequireDefault(_ytsearch);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _child_process = require('child_process');
var _util = require('util');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const run = _util.promisify.call(void 0, _child_process.exec);
const pluginConfig = {
  name: "playch",
  alias: ["pch", "playsaluran"],
  category: "search",
  description: "Putar musik ke saluran (convert opus)",
  usage: ".playch <query> atau .playch --idch <id> <query>",
  example: ".playch komang",
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

function pickVideo(search) {
  const v = _optionalChain([search, 'optionalAccess', _ => _.videos]) || [];
  return v.find((x) => x.seconds && x.seconds < 900) || v[0] || null;
}

function formatViews(n) {
  if (!n) return "0";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

async function toOggOpus(mp3Buf) {
  const tmp = _path2.default.join(process.cwd(), "temp");
  if (!_fs2.default.existsSync(tmp)) _fs2.default.mkdirSync(tmp, { recursive: true });
  const id = _crypto2.default.randomBytes(6).toString("hex");
  const inp = _path2.default.join(tmp, `in_${id}.mp3`);
  const out = _path2.default.join(tmp, `out_${id}.ogg`);
  _fs2.default.writeFileSync(inp, mp3Buf);
  await run(
    `ffmpeg -y -i "${inp}" -vn -map_metadata -1 -ac 1 -ar 48000 -c:a libopus -b:a 96k -vbr on -application audio -f ogg "${out}"`,
  );
  const buf = _fs2.default.readFileSync(out);
  try {
    _fs2.default.unlinkSync(inp);
  } catch (e2) { }
  try {
    _fs2.default.unlinkSync(out);
  } catch (e3) { }
  return buf;
}

function generateWaveform(audioBuf, samples = 64) {
  const waveform = new Uint8Array(samples);
  const chunkSize = Math.floor(audioBuf.length / samples);
  for (let i = 0; i < samples; i++) {
    const offset = i * chunkSize;
    let sum = 0;
    const len = Math.min(chunkSize, audioBuf.length - offset);
    for (let j = 0; j < len; j++) {
      sum += Math.abs(audioBuf[offset + j] - 128);
    }
    waveform[i] = Math.min(255, Math.floor((sum / len) * 2.5));
  }
  return waveform;
}

async function handler(m, { sock }) {
  const raw = _optionalChain([m, 'access', _2 => _2.text, 'optionalAccess', _3 => _3.trim, 'call', _4 => _4()]) || "";
  let chId = _optionalChain([_configjs2.default, 'optionalAccess', _5 => _5.saluran, 'optionalAccess', _6 => _6.id]);
  let chName = _optionalChain([_configjs2.default, 'optionalAccess', _7 => _7.saluran, 'optionalAccess', _8 => _8.name]) || _optionalChain([_configjs2.default, 'optionalAccess', _9 => _9.bot, 'optionalAccess', _10 => _10.name]) || "Ourin-AI";
  let q = raw;

  const idchMatch = raw.match(/--idch\s+(\S+)/);
  if (idchMatch) {
    chId = idchMatch[1];
    chName = chId;
    q = raw.replace(/--idch\s+\S+/, "").trim();
  }

  if (!q)
    return m.reply(
      `🎵 *PLAY SALURAN*\n\n\`${m.prefix}playch <judul lagu>\`\n\`${m.prefix}playch --idch <id_saluran> <judul lagu>\``,
    );
  if (!chId)
    return m.reply(
      `❌El canal no ha sido establecido.\`- Iitch.<id>\`o el arreglo en config.`,
    );

  m.react("🔎");
  try {
    const { videos } = await _ytsearch2.default.call(void 0, q);
    const video = pickVideo({ videos });
    if (!video) return m.reply(`❌No se encontró vídeo`);

    const ytChannel = _optionalChain([video, 'access', _11 => _11.author, 'optionalAccess', _12 => _12.name]) || _optionalChain([video, 'access', _13 => _13.author, 'optionalAccess', _14 => _14.username]) || "Unknown";
    
    const res = await _axios2.default.get(`https://api.azbry.com/api/download/ytmp3?url=${encodeURIComponent(video.url)}`, { timeout: 60000 });
    const data = res.data;
    if (!data.status || !data.result || !data.result.download) {
       throw new Error("Steenaltook una audiencia de API");
    }

    let info = `🎵 *NOW PLAYING (SALURAN)*\n\n`;
    info += `📌 *Judul:* ${video.title}\n\n`;
    info += `*DETAIL*\n`;
    info += `👤 Channel: *${ytChannel}*\n`;
    info += `⏱Duración${video.duration.timestamp}*\n`;
    info += `👀 Views: *${formatViews(video.views)}*\n`;
    info += `📅 Upload: *${video.ago}*\n`;
    info += `🆔 ID: \`${video.videoId}\`\n\n`;
    if (video.description) {
      const desc = video.description.substring(0, 150).replace(/\n/g, " ");
      info += `*Descripción:*\n¿Qué?${desc}${video.description.length > 150 ? "..." : ""}_\n\n`;
    }
    info += `📡 Saluran: \`${chId}\`\n`;
    info += `🔗 ${video.url}\n\n`;
    info += `¿Qué?⏳enviar un público al canal, por favor espere.`;

    await sock.sendMedia(m.chat, video.thumbnail, info, m, { type: "image" });

    m.react("🎵");

    const audioRes = await _axios2.default.get(data.result.download, { responseType: "arraybuffer", timeout: 60000 });
    const mp3Buf = Buffer.from(audioRes.data);

    if (mp3Buf.length < 50000) throw new Error("Audio terlalu kecil");
    const opusBuf = await toOggOpus(mp3Buf);
    if (opusBuf.length < 10000) throw new Error("La conversión de Opus falló");
    const title = video.title;

    const waveform = generateWaveform(opusBuf);
    await sock.sendMessage(chId, {
      audio: opusBuf,
      mimetype: "audio/ogg; codecs=opus",
      ptt: true,
      waveform: Array.from(waveform),
    });
    m.react("✅");
    m.reply(`✅ *${title}* Sucesivamente enviado al canal`);
  } catch (e) {
    console.error("[PlayCh]", e);
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}
exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
