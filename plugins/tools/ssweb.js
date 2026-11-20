"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "ssweb",
  alias: ["screenshot", "ss", "webss"],
  category: "tools",
  description: "Screenshot website",
  usage: ".ssweb <url>",
  example: ".ssweb https://google.com",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

async function ssweb(url, mode = "desktop") {
  const width = mode === "mobile" ? 720 : 1920;
  const apiUrl = `https://image.thum.io/get/width/${width}/crop/1080/noanimate/${url}`;
  const res = await _axios2.default.get(apiUrl, {
    responseType: "arraybuffer",
    timeout: 30000,
  });
  return Buffer.from(res.data);
}

async function handler(m, { sock }) {
  let text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);

  if (!text) {
    return m.reply(
      `📸 *sᴄʀᴇᴇɴsʜᴏᴛ ᴡᴇʙ*\n\n` +
        `* Página web de halar de disparos de pantalla *\n\n` +
        `> *Ejemplo:*\n` +
        `> ${m.prefix}ssweb https://google.com\n` +
        `> ${m.prefix}ss https://github.com --mobile`,
    );
  }

  let mode = "desktop";
  if (text.includes("--mobile") || text.includes("--hp")) {
    mode = "mobile";
    text = text.replace(/--mobile|--hp/g, "").trim();
  }

  if (!text.startsWith("http")) {
    text = "https://" + text;
  }

  await m.react("🕕");

  try {
    const imageBuffer = await ssweb(text, mode);

    const saluranId = _optionalChain([_configjs2.default, 'access', _4 => _4.saluran, 'optionalAccess', _5 => _5.id]) || "120363400911374213@newsletter";
    const saluranName = _optionalChain([_configjs2.default, 'access', _6 => _6.saluran, 'optionalAccess', _7 => _7.name]) || _optionalChain([_configjs2.default, 'access', _8 => _8.bot, 'optionalAccess', _9 => _9.name]) || "Ourin-AI";

    await sock.sendMedia(m.chat, imageBuffer, null, m, {
      type: "image",
    });

    await m.react("✅");
  } catch (error) {
    await m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler; exports.ssweb = ssweb;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
