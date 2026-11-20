"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourincontextjs = require('../../src/lib/ourin-context.js');
const pluginConfig = {
  name: "ipwho",
  alias: ["ip", "iplookup", "ipinfo"],
  category: "tools",
  description: "Lookup informasi IP address",
  usage: ".ipwho <ip>",
  example: ".ipwho 8.8.8.8",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const ip = _optionalChain([m, 'access', _ => _.args, 'optionalAccess', _2 => _2[0]]);

  if (!ip) {
    return m.reply(
      `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
        `> \`${m.prefix}ipwho <ip>\`\n\n` +
        `> Ejemplo:\n` +
        `> \`${m.prefix}ipwho 8.8.8.8\``,
    );
  }

  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) {
    return m.reply(`❌*ᴏʀᴍᴀᴛ ᴛɪᴅᴀᴋ ᴠᴀʟɪᴅ*\n\n> Ejemplo:\`Ocho ocho ocho ocho ocho ocho ocho ocho.\``);
  }

  await m.react("🕕");
  await m.reply(`🕕 *ᴍᴇɴᴄᴀʀɪ ɪɴꜰᴏ ɪᴘ...*`);

  try {
    const res = await fetch(`https://ipwho.is/${ip}`);
    const data = await res.json();

    if (!data.success) {
      await m.react("❌");
      return m.reply(`❌ *ɪᴘ ᴛɪᴅᴀᴋ ᴅɪᴛᴇᴍᴜᴋᴀɴ*\n\n> IP ${ip}no valido`);
    }

    if (data.latitude && data.longitude) {
      await sock.sendMessage(
        m.chat,
        {
          location: {
            degreesLatitude: data.latitude,
            degreesLongitude: data.longitude,
          },
        },
        { quoted: m },
      );
    }

    const text =
      `🌐 *ɪᴘ ʟᴏᴏᴋᴜᴘ*\n\n` +
      `╭┈┈⬡「 📍 *ʟᴏᴋᴀsɪ* 」\n` +
      `┃ 🔢 IP: ${data.ip}\n` +
      `┃ 🌍 Country: ${data.country} ${data.country_code}\n` +
      `┃ 🏙️ City: ${data.city || "-"}\n` +
      `┃ 📍 Region: ${data.region || "-"}\n` +
      `┃ 🌐 Continent: ${data.continent || "-"}\n` +
      `┃ 📮 Postal: ${data.postal || "-"}\n` +
      `┃ ⏰ Timezone: ${_optionalChain([data, 'access', _3 => _3.timezone, 'optionalAccess', _4 => _4.id]) || "-"}\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `╭┈┈⬡「 🔌 *ᴋᴏɴᴇᴋsɪ* 」\n` +
      `┃ 🏢 ISP: ${_optionalChain([data, 'access', _5 => _5.connection, 'optionalAccess', _6 => _6.isp]) || "-"}\n` +
      `┃ 🌐 ORG: ${_optionalChain([data, 'access', _7 => _7.connection, 'optionalAccess', _8 => _8.org]) || "-"}\n` +
      `┃ 📡 ASN: ${_optionalChain([data, 'access', _9 => _9.connection, 'optionalAccess', _10 => _10.asn]) || "-"}\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `╭┈┈⬡「 🛡️ *sᴇᴄᴜʀɪᴛʏ* 」\n` +
      `┃ 🔒 VPN: ${_optionalChain([data, 'access', _11 => _11.security, 'optionalAccess', _12 => _12.vpn]) ? "✅ Yes" : "❌ No"}\n` +
      `┃ 🌐 Proxy: ${_optionalChain([data, 'access', _13 => _13.security, 'optionalAccess', _14 => _14.proxy]) ? "✅ Yes" : "❌ No"}\n` +
      `┃ 🤖 Tor: ${_optionalChain([data, 'access', _15 => _15.security, 'optionalAccess', _16 => _16.tor]) ? "✅ Yes" : "❌ No"}\n` +
      `╰┈┈┈┈┈┈┈┈⬡`;

    await m.react("✅");
    await _ourincontextjs.sendToolsPreview.call(void 0, sock, m.chat, text, "🌐 *ɪᴘ ʟᴏᴏᴋᴜᴘ*", data.country, {
      quoted: m,
    });
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
