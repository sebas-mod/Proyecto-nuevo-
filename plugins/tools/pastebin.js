"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourincontextjs = require('../../src/lib/ourin-context.js');
const pluginConfig = {
  name: "pastebin",
  alias: ["paste", "pb"],
  category: "tools",
  description: "Upload teks ke Pastebin",
  usage: ".pastebin <text>",
  example: '.pastebin console.log("Hello World")',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  let text = m.args.join(" ");

  if (_optionalChain([m, 'access', _ => _.quoted, 'optionalAccess', _2 => _2.text])) {
    text = m.quoted.text;
  }

  if (!text) {
    return m.reply(
      `📋 *ᴘᴀsᴛᴇʙɪɴ ᴜᴘʟᴏᴀᴅ*\n\n` +
        `Ksentes para subir a Pastebin.\n\n` +
        `*Como usarlo:*\n` +
        `• \`${m.prefix}pastebin <text>\`\n` +
        `•Texto de la respuesta\`${m.prefix}pastebin\`\n\n` +
        `> Ejemplo:\`${m.prefix}pastebin console.log("Hello")\``,
    );
  }

  const api_dev_key = "h9WMT2Mn9QW-qDhvUSc-KObqAYcjI0he";
  const api_paste_code = text.trim();
  const api_paste_name = `Paste de${m.pushName || "User"} - ${new Date().toLocaleDateString("id-ID")}`;

  const data = new URLSearchParams({
    api_dev_key,
    api_option: "paste",
    api_paste_code,
    api_paste_name,
    api_paste_private: "1",
  });

  try {
    const res = await _axios2.default.post(
      "https://pastebin.com/api/api_post.php",
      data.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 15000,
      },
    );

    const url = res.data;

    if (url.startsWith("Bad API request")) {
      return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> ${url}`);
    }

    const responseText =
      `✅ *ᴘᴀsᴛᴇʙɪɴ ʙᴇʀʜᴀsɪʟ*\n\n` +
      `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
      `┃ 📝 ᴊᴜᴅᴜʟ: *${api_paste_name}*\n` +
      `┃ 📊 ᴜᴋᴜʀᴀɴ: *${text.length} chars*\n` +
      `┃ 🔗 ʟɪɴᴋ: ${url}\n` +
      `╰┈┈⬡\n\n` +
      `*Pastera e*xPasta de mentukan de mariscos rojos.`;
    await _ourincontextjs.sendToolsPreview.call(void 0, 
      sock,
      m.chat,
      responseText,
      "Pastebin Upload",
      api_paste_name,
      { quoted: m },
    );
  } catch (e) {
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
