"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _googlejs = require('../../src/scraper/google.js');

const pluginConfig = {
  name: "google",
  alias: ["gsearch", "googlenews"],
  category: "search",
  description: "Cari berita di Google News",
  usage: ".google <query>",
  example: ".google gempa hari ini",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const query = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);

  if (!query) {
    m.react("❌");
    return m.reply(
      `🔍 *Google News*\n\n` +
        `Las últimas noticias de Busca de Google News.\n\n` +
        `*Uso:*\n` +
        `> *${m.prefix}google <topik>*\n\n` +
        `*Ejemplo:*\n` +
        `> *${m.prefix}*El google que abre hoy*\n` +
        `> *${m.prefix}google teknologi terbaru*`,
    );
  }

  m.react("🕕");

  try {
    const result = await _googlejs.GoogleSearch.call(void 0, query);

    if (!result.status) {
      m.react("☢");
      return m.reply(`❌*Google Fallido*\n\n♪${result.error}`);
    }

    const items = result.results.slice(0, 10);

    if (items.length === 0) {
      m.react("☢");
      return m.reply(`❌Resultados de búsqueda: *${query}*`);
    }

    let txt = `🔍 *Google News*\n\n`;
    txt += `# Buscadme #${query}*\n\n`;

    items.forEach((item) => {
      txt += `*${item.index_node}.* ${item.resource_title}\n`;
      txt += `   ├ 📰 ${item.origin_node}\n`;
      txt += `   ├ 🕐 ${item.temporal_stamp}\n`;
      txt += `   └ 🔗 ${item.resolved_endpoint}\n\n`;
    });

    m.reply(txt.trim());
    m.react("✅");
  } catch (e) {
    console.error(e);
    m.react("☢");
    m.reply("❌GoaIy mirando a Google, probar de nuevo más tarde");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
