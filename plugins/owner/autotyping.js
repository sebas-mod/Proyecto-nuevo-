"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourincontextjs = require('../../src/lib/ourin-context.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const pluginConfig = {
  name: "autotyping",
  alias: ["typing", "autoketik"],
  category: "owner",
  description: "Auto typing indicator saat menerima pesan",
  usage: ".autotyping on/off",
  example: ".autotyping on",
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
    const current = _nullishCoalesce(_nullishCoalesce(db.setting("autoTyping"), () => ( _optionalChain([_configjs2.default, 'access', _6 => _6.features, 'optionalAccess', _7 => _7.autoTyping]))), () => ( true));
    return m.reply(
      `⌨️ *Auto Typing*\n\n` +
        `> Status: *${current ? "Aktif ✅" : "Nonaktif ❌"}*\n\n` +
        `*PENGGUNAAN:*\n` +
        `> *${m.prefix}autotyping on* — Aktifkan\n` +
        `> *${m.prefix}autotyping off* — Nonaktifkan\n\n` +
        `_Bot akan menampilkan indikator typing saat menerima pesan_`
    );
  }

  if (option === "on") {
    db.setting("autoTyping", true);
    const ctx = _ourincontextjs.saluranCtx.call(void 0, );
    return m.reply(
      `⌨️ *Auto Typing Aktif*\n\n` +
        `> Bot akan menampilkan indikator typing`,
      { contextInfo: ctx }
    );
  }

  if (option === "off") {
    db.setting("autoTyping", false);
    return m.reply(
      `⌨️ *Auto Typing Nonaktif*\n\n` +
        `> Bot tidak akan menampilkan indikator typing`
    );
  }

  return m.reply(
    `❌ *Opsi Tidak Valid*\n\n> Gunakan *${m.prefix}autotyping on* atau *${m.prefix}autotyping off*`
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
