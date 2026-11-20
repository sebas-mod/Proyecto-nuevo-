"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

const pluginConfig = {
  name: "phisingataubukan",
  alias: ["cekphising", "checkphishing", "webphishing"],
  category: "tools",
  description: "Compruebe si un enlace URL es una página web de phising / peligroso o seguro.",
  usage: ".phisingataubukan <url>",
  example: ".phisingataubukan https://google.com",
  cooldown: 10,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const url = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);

  if (!url) {
    return m.reply(
      `Hola *${m.pushName}* 👋\n\n` +
      `Por favor, introduzca el enlace URL que quiere interceptar.\n\n` +
      `Ejemplo:\n-\`${m.prefix}phisingataubukan https://google.com\``
    );
  }

  m.react("🕕");

  try {
    const apiUrl = `https://api.nexray.eu.cc/tools/webphishing?url=${encodeURIComponent(url)}`;
    const res = await _axios2.default.get(apiUrl);
    const data = res.data;

    if (!data.status || !data.result) {
      await m.react("❌");
      return m.reply("⚠Asegúrese de que los enlaces válidos se añadan o prueben de nuevo más tarde.");
    }

    const { result } = data;
    
    let info = `🛡 *RESULTADO DEL ESCANEO* 🛡\n\n`;
    info += `🔗 *URL:* ${result.scanned_url}\n`;
    info += `📊 *Status:* ${result.status_description}\n\n`;
    info += `*DETAIL Escanea:*\n`;
    info += `- Phising: ${result.is_phishing ? "🚨 Ya" : "✅ Tidak"}\n`;
    info += `- Mengandung Malware: ${result.contains_malware ? "🚨 Ya" : "✅ Tidak"}\n`;
    info += `- Llevando al peligroso Sitio:${result.sends_to_harmful_sites ? "🚨 Ya" : "✅ Tidak"}\n`;
    info += `- Instalación de software Jahat:${result.installs_malicious_software ? "🚨 Ya" : "✅ Tidak"}\n`;
    info += `- Unusual Unauthorized:${result.uncommon_downloads ? "🚨 Ya" : "✅ Tidak"}\n\n`;
    info += `_Terakhir dipindai: ${new Date(result.last_modified).toLocaleString("id-ID")}_`;

    await m.reply(info);
    m.react("✅");

  } catch (error) {
    console.error("[Phishing Check Error]", error);
    await m.react("❌");
    m.reply("😔Fue un error al revisar la URI.");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
