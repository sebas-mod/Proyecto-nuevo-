"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _mediafirejs = require('../../src/scraper/mediafire.js'); var _mediafirejs2 = _interopRequireDefault(_mediafirejs);

const pluginConfig = {
  name: "mediafiredl",
  alias: ["mfdl", "mediafire", "mf"],
  category: "download",
  description: "Descargar Archivo de MediaFire",
  usage: ".mfdl <url>",
  example: ".mfdl https://www.mediafire.com/file/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

function getFileName(result) {
  const directName = _optionalChain([result, 'optionalAccess', _ => _.meta, 'optionalAccess', _2 => _2.title, 'optionalAccess', _3 => _3.trim, 'call', _4 => _4()]);
  const urlName = decodeURIComponent(
    _optionalChain([result, 'optionalAccess', _5 => _5.download, 'optionalAccess', _6 => _6.link_download, 'optionalAccess', _7 => _7.split, 'call', _8 => _8("/"), 'access', _9 => _9.pop, 'call', _10 => _10(), 'optionalAccess', _11 => _11.split, 'call', _12 => _12("?"), 'access', _13 => _13[0]]) || "",
  );
  const extension = urlName.includes(".") ? `.${urlName.split(".").pop()}` : "";
  if (directName && extension && !directName.includes("."))
    return `${directName}${extension}`;
  return directName || urlName || `mediafire_${Date.now()}${extension}`;
}

async function handler(m, { sock }) {
  const url = _optionalChain([m, 'access', _14 => _14.text, 'optionalAccess', _15 => _15.trim, 'call', _16 => _16()]);

  if (!url) {
    return m.reply(
      `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
        `> \`${m.prefix}mfdl <url>\`\n\n` +
        `> Ejemplo:\n` +
        `> \`${m.prefix}mfdl https://www.mediafire.com/file/xxx\``,
    );
  }

  if (!url.match(/mediafire\.com/i)) {
    return m.reply(`❌Utilice el enlace MediaFire.`);
  }
  await m.react("🕕");

  try {
    const result = await _mediafirejs2.default.call(void 0, url);
    await sock.sendMessage(
      m.chat,
      {
        document: { url: result.download.link_download },
        fileName: getFileName(result),
        mimetype: result.download.mimetype,
        contextInfo: {
          forwardingScore: 99,
          isForwarded: true,
        },
      },
      { quoted: m },
    );
  } catch (err) {
    return m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
