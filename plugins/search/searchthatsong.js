"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _http = require('http'); var _http2 = _interopRequireDefault(_http);
var _https = require('https'); var _https2 = _interopRequireDefault(_https);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);

const pluginConfig = {
  name: "searchthatsong",
  alias: ["sts", "carilagu"],
  category: "search",
  description: "Buscar detalles de una canción de lirik o corte de palabras",
  usage: ".searchthatsong <potongan lirik>",
  example: ".searchthatsong ku menangis membayangkan",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

const _BASE = "https://searchthatsong.com";
const _UA = "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36 VyrSTS/1.0";

function _vyrRequest(method, url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === "https:";
    const lib = isHttps ? _https2.default : _http2.default;
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*",
        "User-Agent": _UA,
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
        ...headers,
      },
    };
    const req = lib.request(options, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const raw = Buffer.concat(chunks).toString();
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(raw) });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: raw });
        }
      });
    });
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function _extractSessionId(setCookieArr) {
  if (!setCookieArr) return null;
  const cookies = Array.isArray(setCookieArr) ? setCookieArr : [setCookieArr];
  for (const c of cookies) {
    const m = c.match(/session_id=([^;]+)/);
    if (m) return m[1];
  }
  return null;
}

async function _routePreview(query, sessionCookie = "") {
  const headers = sessionCookie ? { Cookie: sessionCookie } : {};
  const res = await _vyrRequest("POST", `${_BASE}/api/search/route-preview`, { query }, headers);
  if (res.status !== 200) throw new Error(`request failed [rp] status=${res.status}`);
  const sid = _extractSessionId(res.headers["set-cookie"]);
  return { route: res.data, sessionId: sid };
}

async function _fullSearch(query, routePreview, sessionId = "") {
  const headers = sessionId ? { Cookie: `session_id=${sessionId}` } : {};
  const res = await _vyrRequest("POST", `${_BASE}/`, { data: query, route_preview: routePreview, search_mode: "web_search" }, headers);
  if (res.status !== 200) throw new Error(`request failed [fs] status=${res.status}`);
  return res.data;
}

function _buildResult(raw) {
  const a = raw.answer || raw;
  return {
    song: _nullishCoalesce(a.song, () => ( null)),
    artist: _nullishCoalesce(a.artist, () => ( null)),
    album: _nullishCoalesce(a.album, () => ( null)),
    year: _nullishCoalesce(_nullishCoalesce(a.year_song_released, () => ( a.year)), () => ( null)),
    genre: _nullishCoalesce(a.genre, () => ( null)),
    confidence: _nullishCoalesce(a.router_confidence, () => ( null)),
    lyrics: (a.plain_lyrics && a.plain_lyrics !== "n/a") ? a.plain_lyrics : null,
    relevantChunk: (a.most_relevant_chunk && a.most_relevant_chunk !== "n/a") ? a.most_relevant_chunk : null,
    previewUrl: _nullishCoalesce(a.preview_audio_url, () => ( null)),
    albumArtwork: _nullishCoalesce(_nullishCoalesce(a.album_artwork_url, () => ( a.album_artwork)), () => ( null)),
    youtubeUrl: _nullishCoalesce(_nullishCoalesce(a.Youtube_URL, () => ( a.youtube_url)), () => ( null)),
  };
}

async function search(query) {
  const { route: routeData, sessionId } = await _routePreview(query, "");
  const sid = sessionId || routeData.session_id;
  const routePreview = _nullishCoalesce(routeData.route, () => ( routeData));
  const fullData = await _fullSearch(query, routePreview, sid);
  return _buildResult(fullData);
}

async function handler(m, { sock }) {
  const query = m.args.join(" ") || _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);

  if (!query) {
    return m.reply("❌Ponga una rebanada de lirik o un nombre de canción para buscar.\n\nEjemplo:`Mis pts están llorando.`");
  }

  await m.react("🕕");

  try {
    const result = await search(query);

    if (!result.song) {
      await m.react("❌");
      return m.reply("⚠Prueba un licor más específico.");
    }

    let caption = `🎵 *SEARCH THAT SONG* 🎵\n\n`;
    caption += `*Judul:* ${result.song}\n`;
    if (result.artist) caption += `*Artis:* ${result.artist}\n`;
    if (result.album) caption += `*Album:* ${result.album}\n`;
    if (result.year) caption += `*Año:*${result.year}\n`;
    if (result.genre) caption += `*Genre:* ${result.genre}\n`;
    if (result.youtubeUrl) caption += `*YouTube:* ${result.youtubeUrl}\n`;
    if (result.relevantChunk) caption += `\n*Match:* ${result.relevantChunk}\n`;
    
    if (result.albumArtwork) {
      await sock.sendMessage(m.chat, {
        image: { url: result.albumArtwork },
        caption: caption.trim()
      }, { quoted: m });
    } else {
      await m.reply(caption.trim());
    }

    if (result.lyrics) {
      await sock.sendMessage(m.chat, { text: `*Lirik:*\n\n${result.lyrics}` }, { quoted: m });
    }

    if (result.previewUrl) {
      await sock.sendMessage(m.chat, {
        audio: { url: result.previewUrl },
        mimetype: "audio/mpeg",
        ptt: false
      }, { quoted: m });
    }

    await m.react("✅");

  } catch (error) {
    console.error("[SearchThatSong]", error.message);
    await m.react("☢");
    m.reply("😔El servidor puede estar teniendo un problema.");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
