"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourinapimanagerjs = require('../../src/lib/ourin-apimanager.js'); var _ourinapimanagerjs2 = _interopRequireDefault(_ourinapimanagerjs);

const pluginConfig = {
  name: "melolo",
  alias: ["melolodrama", "dramamelolo"],
  category: "search",
  description: "Busque una lista de dramas demencia basados en el caegori de Melolo",
  usage: ".melolo <category>",
  example: ".melolo fantasy",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 8,
  energi: 1,
  isEnabled: true,
};

function trimText(text, max = 90) {
  const value = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!value) return "-";
  if (value.length <= max) return value;
  return value.slice(0, max) + "...";
}

function normalizeResults(data) {
  const groups = [];

  for (const [section, items] of Object.entries(data || {})) {
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      groups.push({
        section,
        title: _optionalChain([item, 'optionalAccess', _ => _.title]) || "-",
        url: _optionalChain([item, 'optionalAccess', _2 => _2.url]) || "-",
        image: _optionalChain([item, 'optionalAccess', _3 => _3.image]) || "",
        rating: _optionalChain([item, 'optionalAccess', _4 => _4.rating]) || "-",
        episodes: _optionalChain([item, 'optionalAccess', _5 => _5.episodes]) || "-",
      });
    }
  }

  return groups;
}

async function fetchMelolo(category) {
  const data = await _ourinapimanagerjs2.default.covenant.meloloCategory(category, {
    timeout: 30000,
  });

  if (!_optionalChain([data, 'optionalAccess', _6 => _6.status]) || !_optionalChain([data, 'optionalAccess', _7 => _7.data])) {
    throw new Error(_optionalChain([data, 'optionalAccess', _8 => _8.message]) || "No se encontró el nombre de Meolo.");
  }

  return data;
}

async function handler(m, { sock }) {
  const category = _optionalChain([m, 'access', _9 => _9.text, 'optionalAccess', _10 => _10.trim, 'call', _11 => _11()]);

  if (!category) {
    return m.reply(
      `🎭MELO DRAMA\n\n> Ejemplo:\n\`${m.prefix}melolo fantasy\``,
    );
  }

  if (!_optionalChain([_configjs2.default, 'access', _12 => _12.APIkey, 'optionalAccess', _13 => _13.covenant])) {
    return m.reply("❌Coven API clave no configurado!");
  }

  m.react("🔍");

  try {
    const result = await fetchMelolo(category);
    const items = normalizeResults(result.data).slice(0, 10);

    if (items.length === 0) {
      m.react("❌");
      return m.reply(
        `❌No se han encontrado resultados en Melolo para la categoría:${category}`,
      );
    }

    let caption = "🎭 *MELOLO DRAMA*\n\n";
    caption += `🌿 *Category:* ${category}\n`;
    caption += `📦 *Total:* ${items.length}\n`;
    caption += `💳 *Cost:* ${_nullishCoalesce(_optionalChain([result, 'optionalAccess', _14 => _14.usage, 'optionalAccess', _15 => _15.cost]), () => ( "-"))}\n`;
    caption += `🔋*Restante Credit:*${_nullishCoalesce(_optionalChain([result, 'optionalAccess', _16 => _16.usage, 'optionalAccess', _17 => _17.remaining]), () => ( "-"))}\n\n`;

    items.forEach((item, index) => {
      caption += `*${index + 1}.* ${trimText(item.title, 70)}\n`;
      caption += `   ├ 📂 ${trimText(item.section, 32)}\n`;
      caption += `   ├ ⭐ ${item.rating || "-"}\n`;
      caption += `   ├ 📝 ${trimText(item.episodes, 110)}\n`;
      caption += `   └ ${item.url}\n\n`;
    });

    const cover = _optionalChain([items, 'access', _18 => _18.find, 'call', _19 => _19((item) => item.image), 'optionalAccess', _20 => _20.image]);
    if (cover) {
      await sock.sendMedia(m.chat, cover, caption.trim(), m, {
        type: "image",
      });
    } else {
      await m.reply(caption.trim());
    }

    m.react("✅");
  } catch (error) {
    m.react("☢");
    const message = _optionalChain([error, 'optionalAccess', _21 => _21.response, 'optionalAccess', _22 => _22.data, 'optionalAccess', _23 => _23.message]) || _optionalChain([error, 'optionalAccess', _24 => _24.message]);
    if (message) {
      return m.reply(`❌ ${message}`);
    }
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
