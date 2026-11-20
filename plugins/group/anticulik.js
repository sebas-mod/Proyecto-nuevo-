"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourincontextjs = require('../../src/lib/ourin-context.js');

const pluginConfig = {
  name: "anticulik",
  alias: ["antikidnap", "antiileng", "anticulikgc"],
  category: "group",
  description: "Salike equiomática grupo si se añade sin permiso",
  usage: ".anticulik on/off",
  example: ".anticulik on",
  isOwner: true,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const option = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3(), 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()]);

  if (!option) {
    const status = db.setting("anticulik") || "off";

    return m.reply(
      `🛡️ *Anti Culik*\n\n` +
        `Los teléfonos aures fuera del grupo cuando se le añada a alguien desconocido sin permiso.\n\n` +
        `*STATUS:*\n` +
        `> Mode: *${status === "on" ? "Aktif ✅" : "Nonaktif ❌"}*\n\n` +
        `*Uso:*\n` +
        `> *${m.prefix}anticulik on* — Aktifkan\n` +
        `> *${m.prefix}anticulik off* — Nonaktifkan\n\n` +
        `Si es activo, el bot sólo puede unirse a un *${m.prefix}* o ser añadido por propietario_`
    );
  }

  if (option === "on") {
    db.setting("anticulik", "on");
    const ctx = _ourincontextjs.saluranCtx.call(void 0, );
    return m.reply(
      `🛡Anti @-@ Culik Active\n\n` +
        `*Será automatizado sin permiso*\n` +
        `Una - la única manera de que un bot se une: *${m.prefix}* por propietario\n\n` +
        `*Eso añade más botas a la advertencia*`,
      { contextInfo: ctx }
    );
  }

  if (option === "off") {
    db.setting("anticulik", "off");
    return m.reply(
      `🛡Anti @-@ Curik Nonactive\n\n` +
        `*No saldrá automáticamente si se añade a un grupo*\n` +
        `Cualquiera puede añadir una bota a un grupo.`
    );
  }

  return m.reply(
    `❌Opsi inválido\n\n*Uso*${m.prefix}anticulik en * o *${m.prefix}anticulik off*`
  );
}

async function handleAntiCulik(event, sock, db) {
  if (event.action !== "add") return false;

  const botNumber =
    _optionalChain([sock, 'access', _6 => _6.user, 'optionalAccess', _7 => _7.id, 'optionalAccess', _8 => _8.split, 'call', _9 => _9(":"), 'access', _10 => _10[0]]) || _optionalChain([sock, 'access', _11 => _11.user, 'optionalAccess', _12 => _12.id, 'optionalAccess', _13 => _13.split, 'call', _14 => _14("@"), 'access', _15 => _15[0]]);
  const botLid = _optionalChain([sock, 'access', _16 => _16.user, 'optionalAccess', _17 => _17.id]);

  const isBotAdded = (event.participants || []).some((p) => {
    const rJid = typeof p === "object" && p !== null ? p.phoneNumber || p.id : p;
    if (typeof rJid !== "string") return false;
    const pNum = rJid.split("@")[0].split(":")[0];
    return (
      pNum === botNumber ||
      rJid === botLid ||
      rJid.includes(botNumber)
    );
  });

  if (!isBotAdded) return false;

  const anticulikStatus = db.setting("anticulik") || "off";
  if (anticulikStatus !== "on") return false;

  const inviter = event.author || "";
  const ownerNumbers = (global.owner || []).map((o) =>
    typeof o === "string" ? o.split("@")[0] : o
  );
  const inviterNum = inviter.split("@")[0].split(":")[0];

  const isOwnerInviter =
    inviterNum === botNumber ||
    ownerNumbers.includes(inviterNum) ||
    inviter === botLid;

  if (isOwnerInviter) return false;

  const inviterMention = inviter
    ? `@${inviter.split("@")[0]}`
    : "seseorang";

  await sock.sendMessage(event.id, {
    text:
      `🛡️ *Anti Culik*\n\n` +
      `Al menos déjame ir.🗿\n\n` +
      `*Ser minado por*${inviterMention}sin permiso\n` +
      `# Saldrá de este grupo #\n\n` +
      `*El dueño de Humuki para añadir el bot a la manera correcta*`,
    contextInfo: _ourincontextjs.saluranCtx.call(void 0, ),
    mentionedJid: inviter ? [inviter] : [],
  });

  await new Promise((r) => setTimeout(r, 2000));
  await sock.groupLeave(event.id);
  return true;
}

exports.config = pluginConfig; exports.handler = handler; exports.handleAntiCulik = handleAntiCulik;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
