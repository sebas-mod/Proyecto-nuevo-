"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: "game",
  alias: ["togglegame"],
  category: "group",
  description: "Activar o desactivar las funciones de juego en grupo",
  usage: ".game <on/off>",
  example: ".game on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const args = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3(), 'optionalAccess', _4 => _4.toLowerCase, 'call', _5 => _5()]);

  if (args !== "on" && args !== "off") {
    return m.reply(
      `🎮* FRANURA JUEGO GRUPP *\n\n` +
        `Utilice este comando para configurar la foto de acción en la función de juego.\n\n` +
        `• *${m.prefix}game ♪ Dame en ♪ - ♪ Puede jugar juego ♪\n` +
        `• *${m.prefix}game # Dame de encima # - # No puedo jugar #\n\n` +
        `* Catalán: * Admin todavía puede acceder al juego aunque presionado.`,
    );
  }

  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const group = db.getGroup(m.chat) || db.setGroup(m.chat);

  const isEnable = args === "on";

  if (group.game === isEnable) {
    return m.reply(`🎮Los fusibles del juego están en pie${isEnable ? "AKTIF" : "NONAKTIF"}* en este grupo.`);
  }

  group.game = isEnable;
  db.setGroup(m.chat, group);

  await m.react("✅");
  return m.reply(
    `✅Exito *${isEnable ? "MENGAKTIFKAN" : "MENONAKTIFKAN"}* Las características del juego en este grupo!\n\n` +
    (isEnable
      ? `Ahora puedes usar todas las órdenes en el menú del juego.`
      : `Ya no puedo usar órdenes de juego.`),
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
