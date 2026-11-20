"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourincontextjs = require('../../src/lib/ourin-context.js');

const pluginConfig = {
  name: "unmutegc",
  alias: ["unmutegrup", "unmutebot", "unblockbot", "unlockbot"],
  category: "group",
  description: "Buka blokir command bot untuk member di grup",
  usage: ".unmutegc",
  example: ".unmutegc",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  isBotAdmin: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const groupData = db.getGroup(m.chat) || {};

  if (!groupData.mutegc) {
    return m.reply(
      `🔊 *Mute GC Tidak Aktif*\n\n` +
        `> Member sudah bisa menggunakan command bot di grup ini`
    );
  }

  db.setGroup(m.chat, { mutegc: false });
  const ctx = _ourincontextjs.saluranCtx.call(void 0, );
  const groupName = _optionalChain([m, 'access', _ => _.groupMetadata, 'optionalAccess', _2 => _2.subject]) || "grup ini";

  return m.reply(
    `🔊 *Mute GC Nonaktif*\n\n` +
      `> Grup: *${groupName}*\n` +
      `> Member sekarang bisa menggunakan command bot lagi\n\n` +
      `_Ketik *${m.prefix}mutegc* untuk memblokir kembali_`,
    { contextInfo: ctx }
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
