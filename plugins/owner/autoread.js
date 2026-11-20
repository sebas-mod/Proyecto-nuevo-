"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourincontextjs = require('../../src/lib/ourin-context.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const pluginConfig = {
  name: "autoread",
  alias: ["readchat", "autobaca"],
  category: "owner",
  description: "Auto Leer mensaje entrante",
  usage: ".autoread on/off",
  example: ".autoread on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const option = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3(), 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()]);

  if (!option) {
    const current = _nullishCoalesce(_nullishCoalesce(db.setting("autoRead"), () => ( _optionalChain([_configjs2.default, 'access', _6 => _6.features, 'optionalAccess', _7 => _7.autoRead]))), () => ( false));
    return m.reply(
      `📖 *Auto Read*\n\n` +
        `> Status: *${current ? "Aktif ✅" : "Nonaktif ❌"}*\n\n` +
        `*Uso:*\n` +
        `> *${m.prefix}autoread on* — Aktifkan\n` +
        `> *${m.prefix}autoread off* — Nonaktifkan\n\n` +
        `*Para automatizar la lectura de mensajes entrantes*`
    );
  }

  if (option === "on") {
    db.setting("autoRead", true);
    const ctx = _ourincontextjs.saluranCtx.call(void 0, );
    return m.reply(
      `📖* Auto Read Active >\n\n` +
        `♪ Para la automatización leer mensajes en ♪`,
      { contextInfo: ctx }
    );
  }

  if (option === "off") {
    db.setting("autoRead", false);
    return m.reply(
      `📖* Auto Read Nonactive *\n\n` +
        `# Nunca voy a automatizar el mensaje`
    );
  }

  return m.reply(
    `❌Opsi inválido\n\n*Uso*${m.prefix}autoread on * or *${m.prefix}autoread off*`
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
