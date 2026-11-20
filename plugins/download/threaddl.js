"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _he = require('he'); var _he2 = _interopRequireDefault(_he);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const BASE_URL = "https://workers-playground-cool-wood-c008.accoutydusra.workers.dev";

function cleanText(text) {
  return _he2.default.decode(String(text || "")).replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function uniqueByUrl(list = []) {
  const seen = new Set();
  const result = [];
  for (const item of list) {
    if (!_optionalChain([item, 'optionalAccess', _ => _.url]) || seen.has(item.url)) continue;
    seen.add(item.url);
    result.push(item);
  }
  return result;
}

function normalizeResult(data = {}) {
  const result = [];
  
  const videoQualities = uniqueByUrl(_optionalChain([data, 'access', _2 => _2.video, 'optionalAccess', _3 => _3.qualities]) || []);
  for (const item of videoQualities) {
    result.push({
      Type: "video",
      Quality: item.quality || null,
      Result_url: item.url
    });
  }
  
  const images = uniqueByUrl(_optionalChain([data, 'access', _4 => _4.images, 'optionalAccess', _5 => _5.urls]) || []);
  for (const item of images) {
    result.push({
      Type: "image",
      Result_url: item.url
    });
  }
  
  return result;
}

const pluginConfig = {
  name: "threaddl",
  alias: ["tdl", "threads", "threadsdl"],
  category: "download",
  description: "Descargar fotos y videos de publicaciones Pan sin una olla!",
  usage: ".tdl <url>",
  example: ".tdl https://www.threads.net/@xxx/post/xxx",
  cooldown: 10,
  energi: 1,
  isEnabled: true
};

async function handler(m, { sock }) {
  const url = _optionalChain([m, 'access', _6 => _6.text, 'optionalAccess', _7 => _7.trim, 'call', _8 => _8()]);
  
  if (!url || !/threads/i.test(url)) {
    return m.reply("❌ *Waduh, Link Threads-nya mana nih?*\n\nKamu harus memasukkan tautan (link) dari postingan Threads yang ingin diunduh. Pastikan linknya benar ya! \n\nContoh: `.tdl https://www.threads.net/@zuck/post/xxx`");
  }

  await m.react("🕕");

  try {
    const res = await _axios2.default.get(BASE_URL, {
      timeout: 60000,
      validateStatus: () => true,
      params: { url: url, action: "info" },
      headers: {
        "sec-ch-ua-platform": `"Android"`,
        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
        "accept": "application/json",
        "sec-ch-ua": `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
        "content-type": "application/json",
        "sec-ch-ua-mobile": "?1",
        "origin": "https://threadsvid.com",
        "sec-fetch-site": "cross-site",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        "referer": "https://threadsvid.com/",
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "priority": "u=1, i"
      }
    });

    const data = res.data || {};
    const info = data.data || {};
    const result = normalizeResult(info);

    if (res.status >= 300 || data.success !== true || result.length === 0) {
      await m.react("❌");
      return m.reply(`⚠* Ouch, no pudo recuperar datos de los hilos!\n\nTal vez este post está preparado, cubierto, o el enlace en el que pesca es correcto.\n\nRazón del sistema:${data.message || data.error || "Tidak diketahui"}`);
    }

    const captionText = `✨ *THREADS DOWNLOADER* ✨

Este es el resultado del contrabando de panes que pidió:

👤*Creador*:${info.author || "Unknown"}
📝*Texto Postingan*:${cleanText(info.title) || cleanText(info.description) || "Tidak ada deskripsi."}
📊* Jumulah Archivo Media *${result.length}archivo

No olvides volver a bajar.🚀`;

    const mediaList = [];
    for (const item of result) {
      if (item.Type === "image") {
        mediaList.push({ image: { url: item.Result_url } });
      } else if (item.Type === "video") {
        mediaList.push({ video: { url: item.Result_url } });
      }
    }

    if (mediaList.length > 1) {
      await sock.sendMessage(m.chat, { text: captionText }, { quoted: m });
      await sock.sendMessage(m.chat, { albumMessage: mediaList }, { quoted: m });
    } else if (mediaList.length === 1) {
      const media = mediaList[0];
      media.caption = captionText;
      await sock.sendMessage(m.chat, media, { quoted: m });
    }

    await m.react("✅");

  } catch (err) {
    console.error("[ThreadsDL]", err.message);
    await m.react("☢");
    m.reply("😔Creo que tengo un trastorno en mi sistema.\n\nEs un error fatal tratar de procesar los threadts más tarde.");
  }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
