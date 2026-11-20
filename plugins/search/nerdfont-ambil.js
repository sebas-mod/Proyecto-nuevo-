"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _sharp2 = require('sharp'); var _sharp3 = _interopRequireDefault(_sharp2);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _cheerio = require('cheerio'); var cheerio = _interopRequireWildcard(_cheerio);

function getSharp() {
  return _sharp3.default;
}
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
async function nerdfonts() {
  try {
    const { data } = await _axios2.default.get(
      "https://www.nerdfonts.com/font-downloads",
    );
    const $ = cheerio.load(data);
    const result = [];
    $("div.item").each((_, rynn) => {
      const name = $(rynn).find("span.nerd-font-invisible-text").text().trim();
      const textContent = $(rynn).find("div").first().text();
      const version =
        textContent.match(/Version:\s*([^\n\r]+)/)[1].trim() || null;
      const info = textContent.match(/Info:\s*([^\n\r]+)/)[1].trim() || null;
      const preview_image =
        "https://www.nerdfonts.com" +
          $(rynn)
            .find("a.font-preview")
            .attr("style")
            .match(
              /background-image\s*:\s*url\s*\(\s*['"]?([^'"]+)['"]?\s*\)/i,
            )[1] || null;
      const preview_url =
        $(rynn).find("a.nf-oct-link_external").attr("href") || null;
      const download_url = $(rynn).find("a.nf-fa-download").attr("href");
      if (name && download_url) {
        result.push({
          name,
          version,
          info,
          preview_image,
          preview_url,
          download_url,
        });
      }
    });
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}
const pluginConfig = {
  name: "nerdfont-ambil",
  alias: ["dafont-ambil", "fontambil"],
  category: "search",
  description: "Cari font di DaFont",
  usage: ".nerdfont-ambil <query>",
  example: ".nerdfont-ambil Coolvetica",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};
function formatNumber(num) {
  const n = parseInt(num);
  if (isNaN(n)) return num;
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + "B";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}
async function handler(m, { sock }) {
  const query = _optionalChain([m, 'access', _2 => _2.text, 'optionalAccess', _3 => _3.trim, 'call', _4 => _4(), 'optionalAccess', _5 => _5.toLowerCase, 'call', _6 => _6()]);
  if (!query)
    return m.reply(`( ERD FONT )\n\n*Baja un nombre de fuente para divertirse*`);
  try {
    const res = await nerdfonts();
    const data = res.find(
      (d, i) => _optionalChain([d, 'optionalAccess', _7 => _7.name, 'access', _8 => _8.toLowerCase, 'call', _9 => _9()]) === query.toLowerCase(),
    );
    sock.sendMessage(m.chat, {
      document: { url: data.download_url },
      fileName: data.name,
      mimetype: "application/zip",
      jpegThumbnail: await (
        await getSharp()
      )(
        await _axios2.default
          .get(data.preview_image, { responseType: "arraybuffer" })
          .then((res) => Buffer.from(res.data)),
      )
        .resize(50, 50)
        .toBuffer(),
      caption: `*Done*
Si quieres descargar de nuevo, amigo.${m.prefix}nerdfont otra vez`,
    });
  } catch (err) {
    return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}
exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
