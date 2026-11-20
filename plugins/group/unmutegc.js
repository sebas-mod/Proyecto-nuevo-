"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _almikucontextjs = require('../../src/lib/almiku-context.js');

const pluginConfig = {
  name: "unmutegc",
  alias: ["unmutegrup", "unmutebot", "unblockbot", "unlockbot"],
  category: "group",
  description: "Y la forma en que rodas, un paciente",
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
  const db = _almikudatabasejs.getDatabase.call(void 0, );
  const groupData = db.getGroup(m.chat) || {};

  if (!groupData.mutegc) {
    return m.reply(
      `🔊* Mute GC Inactive *\n\n` +
        `*Ya puedes usar el bot de comando en este grupo*`
    );
  }

  db.setGroup(m.chat, { mutegc: false });
  const ctx = _almikucontextjs.saluranCtx.call(void 0, );
  const groupName = _optionalChain([m, 'access', _ => _.groupMetadata, 'optionalAccess', _2 => _2.subject]) || "este grupo";

  return m.reply(
    `🔊* Mute GC Nonactive *\n\n` +
      `*${groupName}*\n` +
      `*Ahora podría usar un bot de comando otra vez*\n\n` +
      `# Tickety #${m.prefix}mutegc * para bloquear de nuevo _`,
    { contextInfo: ctx }
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
