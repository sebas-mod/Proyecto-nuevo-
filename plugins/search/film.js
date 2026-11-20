"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinassetmanagerjs = require('../../src/lib/ourin-asset-manager.js');
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const NEOXR_APIKEY = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.neoxr]) || "Milik-Bot-OurinMD";

const pluginConfig = {
  name: "film",
  alias: ["movie", "nonton", "lk21"],
  category: "search",
  description: "Cari film dan nonton online",
  usage: ".film <judul>",
  example: ".film civil war",
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

const filmSessions = new Map();

async function handler(m, { sock }) {
  const args = m.args || [];
  const query = args.join(" ").trim();

  if (!query) {
    return m.reply(
      `🎬 *ꜰɪʟᴍ sᴇᴀʀᴄʜ*\n\n` +
        `> Cari dan nonton film online\n\n` +
        `*Format:*\n` +
        `> \`${m.prefix}film <judul>\`\n\n` +
        `*Contoh:*\n` +
        `> \`${m.prefix}film civil war\``,
    );
  }

  m.react("🎬");

  try {
    const apiUrl = `https://api.neoxr.eu/api/film?q=${encodeURIComponent(query)}&apikey=${NEOXR_APIKEY}`;
    const { data } = await _axios2.default.get(apiUrl, { timeout: 30000 });

    if (!_optionalChain([data, 'optionalAccess', _3 => _3.status]) || !_optionalChain([data, 'optionalAccess', _4 => _4.data, 'optionalAccess', _5 => _5.length])) {
      m.react("❌");
      return m.reply(
        `❌ *ᴛɪᴅᴀᴋ ᴅɪᴛᴇᴍᴜᴋᴀɴ*\n\n> Film "${query}" tidak ditemukan`,
      );
    }

    const films = data.data.slice(0, 10);

    filmSessions.set(m.sender, {
      films,
      timestamp: Date.now(),
    });

    setTimeout(() => {
      filmSessions.delete(m.sender);
    }, 300000);

    let text = `🎬 *ʜᴀsɪʟ ᴘᴇɴᴄᴀʀɪᴀɴ*\n\n`;
    text += `> Ditemukan *${films.length}* film untuk "${query}"\n\n`;

    films.forEach((f, i) => {
      text += `*${i + 1}. ${f.title}*\n`;
      text += `> ⭐ ${f.rating} | 📺 ${f.quality} | 📅 ${f.release}\n\n`;
    });

    text += `> _Pilih film dari list di bawah_`;

    const listItems = films.map((f, i) => ({
      header: "",
      title: f.title,
      description: `⭐ ${f.rating} | ${f.quality} | ${f.release}`,
      id: `${m.prefix}filmget ${f.url}`,
    }));

    await sock.sendButton(
      m.chat,
      _ourinassetmanagerjs.getAssetBuffer.call(void 0, "ourin"),
      text,
      m,
      {
        buttons: [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "🎬 Pilih Film",
              sections: [
                {
                  title: "Hasil Pencarian",
                  rows: listItems,
                },
              ],
            }),
          },
        ],
        footer: "🎬 Film Search",
      },
    );

    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
