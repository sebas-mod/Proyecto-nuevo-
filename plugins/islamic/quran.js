"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _cheerio = require('cheerio'); var cheerio = _interopRequireWildcard(_cheerio);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "quran",
  alias: ["surah", "alquran", "bacaquran"],
  category: "islamic",
  description: "Lee Al 's yat...Qsubtly a Sura name",
  usage: ".quran <nama surah>",
  example: ".quran al fatihah",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function quran(query) {
  const load = typeof cheerio.load === "function" ? cheerio.load : cheerio;

  const slug = query.toLowerCase().replace(/\s+/g, "-");
  const url = `https://quran.nu.or.id/${slug}`;

  const res = await fetch(url);
  const html = await res.text();

  const $ = load(html);

  const title = $("h1").first().text().trim();
  const info = $("h1").next("span").text().trim();

  const hasil = [];

  $("div[id]").each((i, el) => {
    const id = $(el).attr("id");

    if (!/^\d+$/.test(id)) return;

    const arab = $(el).find('[dir="rtl"]').first().text().trim();
    const latin = $(el).find(".text-primary-500").first().text().trim();
    const arti = $(el).find(".text-neutral-700").first().text().trim();

    if (arab && latin && arti) {
      hasil.push({
        ayat: Number(id),
        arab,
        latin,
        arti,
      });
    }
  });

  return {
    surah: title,
    info,
    total_ayat: hasil.length,
    ayat: hasil,
  };
}

async function handler(m, { sock }) {
  const query = _optionalChain([m, 'access', _ => _.args, 'optionalAccess', _2 => _2.join, 'call', _3 => _3(" "), 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()]);

  if (!query) {
    return m.reply(
      `📖 *QURAN*\n\n` +
        `" Ingrese el nombre de Sura "\n\n` +
        `\`Contoh: ${m.prefix}quran al fatihah\`\n` +
        `\`Contoh: ${m.prefix}quran al baqarah\``,
    );
  }

  m.react("🔍");

  try {
    const data = await quran(query);

    if (!_optionalChain([data, 'access', _6 => _6.ayat, 'optionalAccess', _7 => _7.length])) {
      m.react("❌");
      return m.reply(`❌ Surah *${query}* not found`);
    }

    let teks = `📖 *${data.surah}*\n${data.info}\n\n`;
    for (const i of data.ayat) {
      teks += `${i.arab}\n${i.latin}\n_${i.arti}_\n\n`;
    }

    m.react("✅");

    const trimmed = teks.trim();
    if (trimmed.length > 60000) {
      const chunks = [];
      let current = "";
      for (const ayat of data.ayat) {
        const block = `${ayat.arab}\n${ayat.latin}\n_${ayat.arti}_\n\n`;
        if ((current + block).length > 60000) {
          chunks.push(current.trim());
          current = "";
        }
        current += block;
      }
      if (current.trim()) chunks.push(current.trim());

      for (let i = 0; i < chunks.length; i++) {
        const prefix = i === 0 ? `📖 *${data.surah}*\n${data.info}\n\n` : "";
        await m.reply(prefix + chunks[i]);
      }
    } else {
      await m.reply(trimmed);
    }
  } catch (e) {
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
