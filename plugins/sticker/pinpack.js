"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _sharp2 = require('sharp'); var _sharp3 = _interopRequireDefault(_sharp2);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourinhttpjs = require('../../src/lib/ourin-http.js');
var _ourinexifjs = require('../../src/lib/ourin-exif.js');

function getSharp() {
  return _sharp3.default;
}

const MAX_STICKERS = 20;
const DOWNLOAD_DELAY = 700;

async function downloadBuffer(url) {
  const res = await _axios2.default.get(url, {
    responseType: "arraybuffer",
    timeout: 15000,
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  return Buffer.from(res.data);
}

async function toWebpSticker(buffer) {
  return (await getSharp())(buffer)
    .resize(512, 512, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 80 })
    .toBuffer();
}

const pluginConfig = {
  name: "pinpack",
  alias: ["ppack", "pinsticker", "pinsearchpack"],
  category: "sticker",
  description: "Obtener un dibujo de Pinterest y luego un paquete de pegatina.",
  usage: ".pinpack <query>",
  example: ".pinpack cat",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 20,
  energi: 3,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const query = _optionalChain([m, 'access', _ => _.args, 'optionalAccess', _2 => _2.join, 'call', _3 => _3(" "), 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()]);

  if (!query) {
    return m.reply(
      `── .✦ 𝗣𝗜𝗡 𝗣𝗔𝗖𝗞 ✦. ── 𝜗ৎ\n\n` +
        `Buscar imagen de Pinterest→¡Así que un paquete de pegatinas!\n\n` +
        `╭─〔Como usarlo〕───⬣\n` +
        `│  ✦ ${m.prefix}pinpack <query>\n` +
        `╰──────────────⬣\n\n` +
        `*${m.prefix}pinpack anime cab *\n` +
        `*${m.prefix}pinpack aesthetic*\n\n` +
        `.☘︎ ݁˖`,
    );
  }

  await m.react("🕕");

  try {
    const data = await _ourinhttpjs.f.call(void 0, `https://api.siputzx.my.id/api/s/pinterest?query=${query}`);
    const results = _optionalChain([data, 'optionalAccess', _6 => _6.data, 'optionalAccess', _7 => _7.slice, 'call', _8 => _8(0, MAX_STICKERS)]);

    if (!results || results.length === 0) {
      await m.react("✘");
      return m.reply(`──.✦ ──\n\n*No se encontraron resultados para:*${query}* .☘︎ ݁˖`);
    }

    await m.reply(
      `──.✦ ──\n\nContrabando *${results.length}* imágenes de Pinterest\nAquí está la línea que se converge en el paquete de pegatina..☘♪˖`,
    );

    const stickerBuffers = [];

    for (const item of results) {
      const imageUrl = item.image_url;
      if (!imageUrl) continue;

      try {
        const buf = await downloadBuffer(imageUrl);
        const webp = await toWebpSticker(buf);
        stickerBuffers.push(webp);
        await new Promise((r) => setTimeout(r, DOWNLOAD_DELAY));
      } catch (e) {
        continue;
      }
    }

    if (!stickerBuffers.length) {
      await m.react("✘");
      return m.reply(`──.✦ ──\n\n# Gafall download the picture. #☘♪˖`);
    }

    const packname = `Pinterest: ${query}`;
    const author = _optionalChain([_configjs2.default, 'access', _9 => _9.bot, 'optionalAccess', _10 => _10.developer]) || _optionalChain([_configjs2.default, 'access', _11 => _11.sticker, 'optionalAccess', _12 => _12.author]) || "♪";

    try {
      await sock.sendStickerPack(m.chat, stickerBuffers, m, {
        name: packname,
        packname,
        publisher: author,
        author,
        description: `Paquete de pegatinas de Pinterest:${query}`,
        emojis: ["❤"],
      });
      await m.react("✓");
    } catch (packErr) {
      console.error("[PinPack] Pack send failed:", packErr.message);
      await m.reply(
        `──.✦ ──\n\n♪ Pack fail, enviar uno a la vez. ♪☘♪˖`,
      );

      let sent = 0;
      for (const buf of stickerBuffers) {
        try {
          let exifBuf = buf;
          try {
            exifBuf = await _ourinexifjs.addExifToWebp.call(void 0, buf, {
              packname,
              author,
              emojis: ["❤"],
            });
          } catch (e2) {}
          await sock.sendMessage(
            m.chat,
            {
              sticker: exifBuf,
              contextInfo: { isForwarded: true, forwardingScore: 1 },
            },
            { quoted: m },
          );
          sent++;
          await new Promise((r) => setTimeout(r, 500));
        } catch (e3) {
          continue;
        }
      }

      if (sent > 0) {
        await m.react("✓");
        await m.reply(
          `──.✦ ──\n\n♪ Trabajar mi manera ♪${sent}* Pegatina que *${packname}* .☘︎ ݁˖`,
        );
      } else {
        await m.react("✘");
        await m.reply(`──.✦ ──\n\n- Sí.☘♪˖`);
      }
    }
  } catch (error) {
    console.error("[PinPack] Error:", error.message);
    await m.react("✘");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
