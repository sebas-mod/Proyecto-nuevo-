"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _cheerio = require('cheerio'); var cheerio = _interopRequireWildcard(_cheerio);
var _momenttimezone = require('moment-timezone'); var _momenttimezone2 = _interopRequireDefault(_momenttimezone);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
  name: "infotourney",
  alias: ["tourney", "turnamen", "mltourney"],
  category: "info",
  description: "Info turnamen Mobile Legends terbaru",
  usage: ".infotourney",
  example: ".infotourney",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function getInfoTourney() {
  const url = "https://infotourney.com/tournament/mobile-legends";
  const { data } = await _axios2.default.get(url);
  const $ = cheerio.load(data);
  const tournaments = [];

  $(".items-row .item").each((_, element) => {
    const item = $(element);

    const title = item.find('h2[itemprop="name"] a').text().trim();
    const link = item.find('h2[itemprop="name"] a').attr("href");
    const image = item.find("p img").attr("src");
    let datePublished = item
      .find('time[itemprop="datePublished"]')
      .attr("datetime");

    if (datePublished) {
      datePublished = _momenttimezone2.default.call(void 0, datePublished)
        .tz("Asia/Jakarta")
        .format("DD/MM/YYYY HH:mm");
    }

    const descriptionHtml =
      item.find('p[style="text-align: center;"]').html() || "";
    const [rawDescription, rawInfo] = descriptionHtml
      .split("<br>")
      .map((text) => text.trim());

    const description = rawDescription
      ? rawDescription.replace(/&nbsp;/g, " ")
      : "";
    const info = rawInfo ? rawInfo.replace(/&nbsp;/g, " ") : "";

    tournaments.push({
      title,
      imageUrl: new URL(image, url).href,
      datePublished,
      description,
      info,
      url: new URL(link, url).href,
    });
  });

  return tournaments.slice(0, 5);
}

async function handler(m, { sock }) {
  await m.react("🕕");

  try {
    const tournaments = await getInfoTourney();

    if (!tournaments || tournaments.length === 0) {
      await m.react("❌");
      return m.reply("❌No hay torneo encontrado");
    }

    const saluranId = _optionalChain([_configjs2.default, 'access', _2 => _2.saluran, 'optionalAccess', _3 => _3.id]) || "120363400911374213@newsletter";
    const saluranName = _optionalChain([_configjs2.default, 'access', _4 => _4.saluran, 'optionalAccess', _5 => _5.name]) || _optionalChain([_configjs2.default, 'access', _6 => _6.bot, 'optionalAccess', _7 => _7.name]) || "Ourin-AI";

    let text = `🏆 *ɪɴꜰᴏ ᴛᴜʀɴᴀᴍᴇɴ ᴍᴏʙɪʟᴇ ʟᴇɢᴇɴᴅs*\n\n`;
    text += `> 5 Turnamen Terbaru\n\n`;

    for (let i = 0; i < tournaments.length; i++) {
      const t = tournaments[i];
      text += `${i + 1}. *${t.title}*\n`;
      text += `📅 ${t.datePublished || "N/A"}\n`;
      if (t.description) text += `📝 ${t.description}\n`;
      if (t.info) text += `⚠️ ${t.info}\n`;
      text += `🔗 ${t.url}\n\n`;
    }

    const firstImage = _optionalChain([tournaments, 'access', _8 => _8[0], 'optionalAccess', _9 => _9.imageUrl]);

    if (firstImage) {
      await sock.sendMedia(m.chat, firstImage, text, m, {
        type: "image",
      });
    } else {
      await m.reply(text);
    }

    await m.react("✅");
  } catch (error) {
    await m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
