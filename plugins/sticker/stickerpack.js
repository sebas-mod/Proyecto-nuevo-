"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _sharp2 = require('../../src/lib/almiku-image.js'); var _sharp3 = _interopRequireDefault(_sharp2);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

function getSharp() {

  return _sharp3.default;
}
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _almikuexifjs = require('../../src/lib/almiku-exif.js');

const pluginConfig = {
  name: "stickerpack",
  alias: ["sp", "stickersearch", "searchsticker"],
  category: "sticker",
  description: "Busca y enviar un paquete de pegatina",
  usage: ".stickerpack <query>",
  example: ".stickerpack anime",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 20,
  energi: 2,
  isEnabled: true,
};

class StickerAPI {
  async search(query, page = 1) {
    try {
      if (!query) throw new Error("Query kosong");
      const res = await _axios2.default
        .post("https://getstickerpack.com/api/v1/stickerdb/search", {
          query,
          page,
        })
        .then((r) => r.data);
      const data = res.data.map((item) => ({
        name: item.title,
        slug: item.slug,
        url: `https://getstickerpack.com/stickers/${item.slug}`,
        image: `https://s3.getstickerpack.com/${item.cover_image || item.tray_icon_large}`,
        download: item.download_counter,
      }));
      return { status: true, data, total: res.meta.total };
    } catch (e) {
      return { status: false, msg: e.message };
    }
  }

  async detail(slug) {
    try {
      const match = slug.match(/stickers\/([a-zA-Z0-9-]+)$/);
      const id = match ? match[1] : slug;
      const res = await _axios2.default
        .get(`https://getstickerpack.com/api/v1/stickerdb/stickers/${id}`)
        .then((r) => r.data.data);
      const stickers = res.images.map((item) => ({
        index: item.sticker_index,
        image: `https://s3.getstickerpack.com/${item.url}`,
        animated: item.is_animated !== 0,
      }));
      return { status: true, title: res.title, stickers };
    } catch (e) {
      return { status: false, msg: e.message };
    }
  }
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

async function handler(m, { sock }) {
  const query = _optionalChain([m, 'access', _ => _.args, 'optionalAccess', _2 => _2.join, 'call', _3 => _3(" "), 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()]);

  if (!query) {
    return m.reply(
      `── .✦ 𝗦𝗧𝗜𝗖𝗞𝗘𝗥 𝗣𝗔𝗖𝗞 ✦. ── 𝜗ৎ\n\n` +
        `¡Busca y envía un paquete de pegatinas!\n\n` +
        `╭─〔Como usarlo〕───⬣\n` +
        `│  ✦ ${m.prefix}stickerpack <query>\n` +
        `╰──────────────⬣\n\n` +
        `*${m.prefix}stickerpack anime*\n` +
        `*${m.prefix}stickerpack de palos\n\n` +
        `.☘︎ ݁˖`,
    );
  }

  await m.react("🕕");

  try {
    const api = new StickerAPI();
    const search = await api.search(query);

    if (!search.status || !_optionalChain([search, 'access', _6 => _6.data, 'optionalAccess', _7 => _7.length])) {
      await m.react("✘");
      return m.reply(
        `──.✦ ──\n\n*No hay paquetes de pegatinas para: *${query}* .☘︎ ݁˖`,
      );
    }

    const randPick =
      search.data[Math.floor(Math.random() * search.data.length)];
    const detail = await api.detail(randPick.url);

    if (!detail.status || !_optionalChain([detail, 'access', _8 => _8.stickers, 'optionalAccess', _9 => _9.length])) {
      await m.react("✘");
      return m.reply(`──.✦ ──\n\nNo se pudieron obtener los detalles del paquete de stickers.☘˖`);
    }

    await m.reply(
      `──.✦ ──\n\nDescargando *${randPick.name}*\n> ${Math.min(detail.stickers.length, MAX_STICKERS)} stickers ☘︎ ݁˖`,
    );

    const limited = detail.stickers.slice(0, MAX_STICKERS);
    const stickerBuffers = [];

    for (const s of limited) {
      try {
        const buf = await downloadBuffer(s.image);
        const webp = await toWebpSticker(buf);
        stickerBuffers.push(webp);
        await new Promise((r) => setTimeout(r, DOWNLOAD_DELAY));
      } catch (e2) {
        continue;
      }
    }

    if (!stickerBuffers.length) {
      await m.react("✘");
      return m.reply(`──.✦ ──\n\n*No se pudo descargar ningún sticker.*☘˖`);
    }

    const packname = randPick.name || _optionalChain([_configjs2.default, 'access', _10 => _10.sticker, 'optionalAccess', _11 => _11.packname]) || "Al Miku-AI";
    const author = _optionalChain([_configjs2.default, 'access', _12 => _12.bot, 'optionalAccess', _13 => _13.developer]) || _optionalChain([_configjs2.default, 'access', _14 => _14.sticker, 'optionalAccess', _15 => _15.author]) || "Bot";

    try {
      await sock.sendStickerPack(m.chat, stickerBuffers, m, {
        name: packname,
        packname,
        publisher: author,
        author,
        description: `Sticker pack: ${packname}`,
        emojis: ["❤"],
      });
      await m.react("✓");
    } catch (packErr) {
      console.error("[StickerPack] Pack send failed:", packErr.message);
      await m.reply(
        `──.✦ ──\n\n• Falló el envío del paquete; enviando uno por uno.☘˖`,
      );

      let sent = 0;
      for (const buf of stickerBuffers) {
        try {
          let exifBuf = buf;
          try {
            exifBuf = await _almikuexifjs.addExifToWebp.call(void 0, buf, {
              packname,
              author,
              emojis: ["❤"],
            });
          } catch (e3) {}
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
        } catch (e4) {
          continue;
        }
      }

      if (sent > 0) {
        await m.react("✓");
        await m.reply(
          `──.✦ ──\n\n• Enviados ${sent} stickers de *${packname}*.☘︎ ݁˖`,
        );
      } else {
        await m.react("✘");
        await m.reply(`──.✦ ──\n\n• No se pudo enviar ningún sticker. ☘˖`);
      }
    }
  } catch (error) {
    console.error("[StickerPack] Error:", error.message);
    await m.react("✘");
    m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
