"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');

const pluginConfig = {
  name: "antilinkall",
  alias: ["alall", "antialllink"],
  category: "group",
  description: "Anti semua jenis link (deteksi domain extension)",
  usage: ".antilinkall <on/off/metode> [kick/remove]",
  example: ".antilinkall on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
  isAdmin: true,
  isBotAdmin: true,
};

function handler(m, { sock }) {
  const db = _almikudatabasejs.getDatabase.call(void 0, );
  const option = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3(), 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()]);

  if (!option) {
    const groupData = db.getGroup(m.chat) || {};
    const status = groupData.antilinkall || "off";
    const mode = groupData.antilinkallMode || "remove";

    return m.reply(
      `🔗 *Antilink All*\n\n` +
        `> Status: *${status === "on" ? "Aktif ✅" : "Nonaktif ❌"}*\n` +
        `> Mode: *${mode.toUpperCase()}*\n\n` +
        `*DETEKSI:*\n` +
        `•• https:///http://(con protokol)\n` +
        `> • www. (subdomain)\n` +
        `> • Domain extension (.com, .id, .io, .net, dll)\n` +
        `> • Shortlink (bit.ly, t.me, tinyurl, dll)\n\n` +
        `*Uso:*\n` +
        `> *${m.prefix}antilinkall on* — Aktifkan\n` +
        `> *${m.prefix}antilinkall off* — Nonaktifkan\n` +
        `> *${m.prefix}antilinkall antilinkal método *—Usuario de patada\n` +
        `> *${m.prefix}antilinkallétodo antilinkal eliminar *—Modo de eliminación de mensajes`
    );
  }

  if (option === "on") {
    db.setGroup(m.chat, { antilinkall: "on" });
    return m.reply(
      `✅Antilinks All Active\n\n` +
        `Todos los enlaces serán auto detectable\n• Decline el dominio e •xtensions, no sólo http / https`
    );
  }

  if (option === "off") {
    db.setGroup(m.chat, { antilinkall: "off" });
    return m.reply(`❌* Antilinks All Nonactive *\n\nEl enlace no será filtrado de nuevo`);
  }

  if (option.startsWith("metode")) {
    const method = _optionalChain([m, 'access', _6 => _6.args, 'optionalAccess', _7 => _7[1], 'optionalAccess', _8 => _8.toLowerCase, 'call', _9 => _9()]);
    if (method === "kick") {
      db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "kick" });
      return m.reply(
        `✅* Antilinks All—Modo de Kickk *\n\nEl usuario que envía el enlace se le da patadas.`
      );
    } else if (method === "remove" || method === "delete") {
      db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "remove" });
      return m.reply(
        `✅* Antilinks All—Modo de eliminación *\n\n*Mensaje con enlaces será cubierto*`
      );
    } else {
      return m.reply(
        `❌Método inválido\n\n*Usa una patada o un retiro*\n* Gasps ]${m.prefix}antilinkall antilinkal método *`
      );
    }
  }

  if (option === "kick") {
    db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "kick" });
    return m.reply(
      `✅* Antilinks All—Modo de Kickk *\n\nEl usuario que envía el enlace se le da patadas.`
    );
  }

  if (option === "remove" || option === "delete") {
    db.setGroup(m.chat, { antilinkall: "on", antilinkallMode: "remove" });
    return m.reply(
      `✅* Antilinks All—Modo de eliminación *\n\n*Mensaje con enlaces será cubierto*`
    );
  }

  return m.reply(
    `❌Opsi inválido\n\n*Uso* *en,* *en marcha, método patada*`
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
