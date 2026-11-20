"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
  name: "npm",
  alias: ["npmsearch", "npmjs", "npmfind"],
  category: "search",
  description: "Search package di NPM registry",
  usage: ".npm <query>",
  example: ".npm axios",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const query = _optionalChain([m, 'access', _ => _.args, 'optionalAccess', _2 => _2.join, 'call', _3 => _3(" ")]);

  if (!query) {
    return m.reply(
      `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
        `> \`${m.prefix}npm <query>\`\n\n` +
        `> Ejemplo:\n` +
        `> \`${m.prefix}npm axios\``,
    );
  }

  await m.react("🕕");

  try {
    const res = await fetch(
      `https://registry.npmjs.com/-/v1/search?text=${encodeURIComponent(query)}&size=10`,
    );
    const data = await res.json();

    if (!data.objects || data.objects.length === 0) {
      await m.react("❌");
      return m.reply(
        `❌ *ᴛɪᴅᴀᴋ ᴅɪᴛᴇᴍᴜᴋᴀɴ*\n\n> Package "${query}*No se encuentra*`,
      );
    }

    let text = `📦 *ɴᴘᴍ sᴇᴀʀᴄʜ*\n\n`;
    text += `> Query: \`${query}\`\n`;
    text += `> Found: ${data.total} packages\n\n`;

    data.objects.slice(0, 8).forEach((item, i) => {
      const pkg = item.package;
      const score = Math.round((_optionalChain([item, 'access', _4 => _4.score, 'optionalAccess', _5 => _5.final]) || 0) * 100);

      text += `${i + 1}. *${pkg.name}*\n`;
      text += `> 📌 v${pkg.version}\n`;
      if (pkg.description) {
        text += `> 📝 ${pkg.description.slice(0, 50)}${pkg.description.length > 50 ? "..." : ""}\n`;
      }
      text += `> 🔗 ${_optionalChain([pkg, 'access', _6 => _6.links, 'optionalAccess', _7 => _7.npm]) || "-"}\n`;
      if (_optionalChain([pkg, 'access', _8 => _8.author, 'optionalAccess', _9 => _9.name])) {
        text += `> 👤 ${pkg.author.name}\n`;
      }
      text += `> ⭐ Score: ${score}%`;
    });

    await m.react("✅");
    await m.reply(text);
  } catch (e) {
    await m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
