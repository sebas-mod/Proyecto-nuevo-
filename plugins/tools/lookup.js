"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourincontextjs = require('../../src/lib/ourin-context.js');
const pluginConfig = {
  name: "lookup",
  alias: ["dnslookup", "dns", "whois"],
  category: "tools",
  description: "DNS Lookup for domain",
  usage: ".lookup <domain>",
  example: ".lookup google.com",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  let domain = _optionalChain([m, 'access', _ => _.args, 'optionalAccess', _2 => _2[0]]);

  if (!domain) {
    return m.reply(
      `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
        `> \`${m.prefix}lookup <domain>\`\n\n` +
        `> Ejemplo:\n` +
        `> \`${m.prefix}lookup google.com\``,
    );
  }

  domain = domain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];

  if (
    !/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z]{2,})+$/.test(domain)
  ) {
    return m.reply(`❌*ᴏʀᴍᴀᴛ ᴛɪᴅᴀᴋ ᴠᴀʟɪᴅ*\n\n> Ejemplo:\`google.com\``);
  }

  await m.react("🕕");
  await m.reply(`🕕 *ᴍᴇɴᴄᴀʀɪ ɪɴꜰᴏ ᴅᴏᴍᴀɪɴ...*`);

  try {
    const [dnsRes, whoisRes] = await Promise.allSettled([
      fetch(`https://api.hackertarget.com/dnslookup/?q=${domain}`).then((r) =>
        r.text(),
      ),
      fetch(`https://api.hackertarget.com/whois/?q=${domain}`).then((r) =>
        r.text(),
      ),
    ]);

    const dnsData = dnsRes.status === "fulfilled" ? dnsRes.value : null;
    const whoisData = whoisRes.status === "fulfilled" ? whoisRes.value : null;

    if (!dnsData && !whoisData) {
      await m.react("❌");
      return m.reply(`❌*ɢᴀɢᴀʟ*\n\n*Pueden 't procesar dominio*`);
    }

    let text = `🔍 *ᴅɴs ʟᴏᴏᴋᴜᴘ*\n\n`;
    text += `> Domain: \`${domain}\`\n\n`;

    if (dnsData && !dnsData.includes("error")) {
      const lines = dnsData.split("\n").filter((l) => l.trim());
      const records = {};

      lines.forEach((line) => {
        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
          const type = parts[parts.length - 2] || "OTHER";
          const value = parts[parts.length - 1];
          if (!records[type]) records[type] = [];
          records[type].push(value);
        }
      });

      text += `╭┈┈⬡「 📋 *ᴅɴs ʀᴇᴄᴏʀᴅs* 」\n`;
      if (records["A"])
        text += `┃ 🅰️ A: ${records["A"].slice(0, 3).join(", ")}\n`;
      if (records["AAAA"])
        text += `┃ 🔢 AAAA: ${records["AAAA"].slice(0, 2).join(", ")}\n`;
      if (records["MX"])
        text += `┃ 📧 MX: ${records["MX"].slice(0, 2).join(", ")}\n`;
      if (records["NS"])
        text += `┃ 🌐 NS: ${records["NS"].slice(0, 3).join(", ")}\n`;
      if (records["TXT"])
        text += `┃ 📝 TXT: ${records["TXT"].length} records\n`;
      text += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
    }

    if (whoisData && !whoisData.includes("error") && whoisData.length < 2000) {
      const registrar = _optionalChain([whoisData, 'access', _3 => _3.match, 'call', _4 => _4(/Registrar:\s*(.+)/i), 'optionalAccess', _5 => _5[1]]) || "-";
      const created = _optionalChain([whoisData, 'access', _6 => _6.match, 'call', _7 => _7(/Creation Date:\s*(.+)/i), 'optionalAccess', _8 => _8[1]]) || "-";
      const expires = _optionalChain([whoisData, 'access', _9 => _9.match, 'call', _10 => _10(/Expir.*Date:\s*(.+)/i), 'optionalAccess', _11 => _11[1]]) || "-";
      const nameservers =
        _optionalChain([whoisData
, 'access', _12 => _12.match, 'call', _13 => _13(/Name Server:\s*(.+)/gi)
, 'optionalAccess', _14 => _14.slice, 'call', _15 => _15(0, 2)
, 'access', _16 => _16.map, 'call', _17 => _17((ns) => _optionalChain([ns, 'access', _18 => _18.split, 'call', _19 => _19(":"), 'access', _20 => _20[1], 'optionalAccess', _21 => _21.trim, 'call', _22 => _22()]))]) || [];

      text += `╭┈┈⬡「 📄 *ᴡʜᴏɪs* 」\n`;
      text += `┃ 🏢 Registrar: ${registrar.slice(0, 35)}\n`;
      text += `┃ 📅 Created: ${created.slice(0, 20)}\n`;
      text += `┃ ⏰ Expires: ${expires.slice(0, 20)}\n`;
      if (nameservers.length > 0)
        text += `┃ 🌐 NS: ${nameservers.join(", ")}\n`;
      text += `╰┈┈┈┈┈┈┈┈⬡`;
    }

    await m.react("✅");
    await _ourincontextjs.sendToolsPreview.call(void 0, sock, m.chat, text, "🔍 *ᴅɴs ʟᴏᴏᴋᴜᴘ*", domain, {
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
