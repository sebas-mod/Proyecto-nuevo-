"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _almikucontextjs = require('../../src/lib/almiku-context.js');

const pluginConfig = {
  name: "mutegc",
  alias: ["mutegrup", "mutebot", "blockbot", "lockbot"],
  category: "group",
  description: "Bot de comando bloque para la foto, sólo admin / propietario puede utilizar",
  usage: ".mutegc",
  example: ".mutegc",
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

  if (groupData.mutegc) {
    return m.reply(
      `🔇* Mute GC Ya Active *\n\n` +
        `*No puedo usar el comando bot en este grupo*\n` +
        `# Sólo administrador del grupo y dueña que pueden conseguir la acción #\n\n` +
        `# Tickety #${m.prefix}unmutegc * para abrir _`
    );
  }

  db.setGroup(m.chat, { mutegc: true });
  const ctx = _almikucontextjs.saluranCtx.call(void 0, );
  const groupName = _optionalChain([m, 'access', _ => _.groupMetadata, 'optionalAccess', _2 => _2.subject]) || "este grupo";

  return m.reply(
    `🔇* Mute GC Active *\n\n` +
      `*${groupName}*\n` +
      `*No puede usar el comando bot*\n` +
      `* Amin grupo y dueña * * Aún puede ser un acto *\n\n` +
      `# Tickety #${m.prefix}unmutegc * para abrir _`,
    { contextInfo: ctx }
  );
}

function isMutegc(groupJid, db) {
  const group = db.getGroup(groupJid) || {};
  return !!group.mutegc;
}

exports.config = pluginConfig; exports.handler = handler; exports.isMutegc = isMutegc;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
