"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: "onlypc",
  alias: ["onlyprivate", "privateonly"],
  category: "owner",
  description: "Toggle mode bot es sólo en el chat primario",
  usage: ".onlypc on/off",
  example: ".onlypc on",
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
    const current = db.setting("onlyPc") || false;
    return m.reply(
      `💬 *Only Private*\n\n` +
        `> Status: *${current ? "Aktif ✅" : "Nonaktif ❌"}*\n\n` +
        `*Uso:*\n` +
        `> *${m.prefix}*—Sólo es reaccionable en el chat primario.\n` +
        `> *${m.prefix}* Sólopc off *—*Para ser llevado a cualquier lugar*\n\n` +
        `Si está activo, Mode Only Group se autoactivará _ minusválido`
    );
  }

  if (option === "on") {
    db.setting("onlyPc", true);
    db.setting("onlyGc", false);
    await m.react("✅");
    return m.reply(
      `💬* Sólo Privada Activo *\n\n` +
        `# Sólo acostúmbrate a él en el chat de primate\n` +
        `# Mode Only Group is disabled #`
    );
  }

  if (option === "off") {
    db.setting("onlyPc", false);
    await m.react("❌");
    return m.reply(
      `💬* Sólo privada no activa *\n\n` +
        `*Para ser llevado a cualquier lugar*`
    );
  }

  return m.reply(
    `❌Opsi inválido\n\n*Uso*${m.prefix}* o *${m.prefix}onlypc off*`
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
