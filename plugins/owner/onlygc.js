"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: "onlygc",
  alias: ["onlygroup", "grouponly"],
  category: "owner",
  description: "Toggle mode bot hanya di grup",
  usage: ".onlygc on/off",
  example: ".onlygc on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const option = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3(), 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()]);

  if (!option) {
    const current = db.setting("onlyGc") || false;
    return m.reply(
      `🏘️ *Only Group*\n\n` +
        `> Status: *${current ? "Aktif ✅" : "Nonaktif ❌"}*\n\n` +
        `*PENGGUNAAN:*\n` +
        `> *${m.prefix}onlygc on* — Bot hanya bisa diakses di grup\n` +
        `> *${m.prefix}onlygc off* — Bot bisa diakses di mana saja\n\n` +
        `_Jika aktif, mode Only Private akan otomatis nonaktif_`
    );
  }

  if (option === "on") {
    db.setting("onlyGc", true);
    db.setting("onlyPc", false);
    await m.react("✅");
    return m.reply(
      `🏘️ *Only Group Aktif*\n\n` +
        `> Bot hanya bisa diakses di grup\n` +
        `> Mode Only Private dinonaktifkan`
    );
  }

  if (option === "off") {
    db.setting("onlyGc", false);
    await m.react("❌");
    return m.reply(
      `🏘️ *Only Group Nonaktif*\n\n` +
        `> Bot bisa diakses di mana saja`
    );
  }

  return m.reply(
    `❌ *Opsi Tidak Valid*\n\n> Gunakan *${m.prefix}onlygc on* atau *${m.prefix}onlygc off*`
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
