"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "videotranscribe",
  alias: ["video-transcribe", "transkripvideo"],
  category: "tools",
  description: "La transcripción de vídeo de la URL se convierte en un texto ( YouTube, mp4, dll )",
  usage: ".video-transcribe <url> [lang]",
  example: ".video-transcribe https://youtu.be/dQw4w9WgXcQ\n.video-transcribe https://youtu.be/dQw4w9WgXcQ id",
  cooldown: 30,
  energi: 2,
  isEnabled: true,
};

const ENDPOINT = "https://api.proactor.ai:7788/v1/tourists/files/transcription";
const DEFAULT_LANG = "en";

const HEADERS = {
  accept: "application/json, text/plain, */*",
  "content-type": "application/json",
  origin: "https://videotranscriber.ai",
  referer: "https://videotranscriber.ai/",
  "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36",
};

function makeTrackId() {
  return `${_crypto2.default.randomUUID()}_${Date.now()}`;
}

function msToTime(ms = 0) {
  const total = Math.floor(Number(ms) / 1000);
  const minute = Math.floor(total / 60);
  const second = total % 60;
  return `${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
}

function joinTranscript(items = []) {
  return items
    .map((item) => _optionalChain([item, 'optionalAccess', _ => _.text]) || "")
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanResult(input, json) {
  const data = Array.isArray(_optionalChain([json, 'optionalAccess', _2 => _2.data])) ? json.data : [];
  if (_optionalChain([json, 'optionalAccess', _3 => _3.code]) !== 200 || data.length === 0) {
    return {
      status: false,
      code: _optionalChain([json, 'optionalAccess', _4 => _4.code]) || 500,
      message: _optionalChain([json, 'optionalAccess', _5 => _5.msg]) || _optionalChain([json, 'optionalAccess', _6 => _6.message]) || "Transcripción no encontrada",
    };
  }
  const title = _optionalChain([data, 'access', _7 => _7.find, 'call', _8 => _8((item) => _optionalChain([item, 'optionalAccess', _9 => _9.videoTitle])), 'optionalAccess', _10 => _10.videoTitle]) || "No title";
  const segments = data.map((item, index) => ({
    index: index + 1,
    startMs: _nullishCoalesce(_optionalChain([item, 'optionalAccess', _11 => _11.duration]), () => ( null)),
    start: msToTime(_optionalChain([item, 'optionalAccess', _12 => _12.duration]) || 0),
    text: _optionalChain([item, 'optionalAccess', _13 => _13.text]) || "",
  }));
  return {
    status: true,
    title,
    total: segments.length,
    transcript: joinTranscript(data),
    segments,
  };
}

async function transcriber(url, language = DEFAULT_LANG) {
  if (!url || !/^https?:\/\//i.test(String(url))) {
    throw new Error("URL vacía / inválida");
  }
  const body = {
    track_id: makeTrackId(),
    fileUrl: url,
    language: language,
  };
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error("Response bukan JSON: " + text.slice(0, 200));
  }
  const result = cleanResult(url, json);
  if (!result.status) throw new Error(result.message);
  return result;
}

async function handler(m, { args }) {
  const url = args[0];
  const lang = args[1] || DEFAULT_LANG;

  if (!url) {
    return m.reply(
      `*📝 VIDEO TRANSCRIBE*\n\n\`\`\`${m.prefix}video-transcribe <url_video> [bahasa]\`\`\`\n\nContoh:\n\`${m.prefix}video-transcribe https://youtu.be/... id\``
    );
  }

  m.react("🕕");

  try {
    const result = await transcriber(url, lang);
    
    let info = `📝 *VIDEO TRANSCRIBE*\n\n`;
    info += `*🎬 Title:* ${result.title}\n`;
    info += `*🗣️ Language:* ${lang.toUpperCase()}\n`;
    info += `*🔢 Segments:* ${result.total}\n\n`;
    info += `*📜 Transcript:*\n${result.transcript.substring(0, 2500)}`;
    
    if (result.transcript.length > 2500) {
      info += `... (texto demasiado largo)`;
    }

    m.react("✅");
    await m.reply(info);
  } catch (err) {
    console.error("[VideoTranscribe]", err.message);
    m.react("☢");
    m.reply(`❌*Fallido:*${err.message || "Gagal memproses video"}`);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
