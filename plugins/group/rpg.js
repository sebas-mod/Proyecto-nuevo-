"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: "rpg",
  alias: ["togglerpg"],
  category: "group",
  description: "Habilitar o desactivar las características de RPG en grupo",
  usage: ".rpg <on/off>",
  example: ".rpg on",
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
      `⚔\n\n` +
        `Utilice este comando para configurar la foto de acción a la función RPG.\n\n` +
        `• *${m.prefix}* - * Puede jugar RPG*\n` +
        `• *${m.prefix}* - * Can 't play RPG*\n\n` +
        `* Catalán: * Admin todavía puede acceder a RPG aunque presionado.`,
    );
  }

  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const group = db.getGroup(m.chat) || db.setGroup(m.chat);

  const isEnable = args === "on";

  if (group.rpg === isEnable) {
    return m.reply(`⚔*La función de la RPG ya está*${isEnable ? "AKTIF" : "NONAKTIF"}* en este grupo.`);
  }

  group.rpg = isEnable;
  db.setGroup(m.chat, group);

  await m.react("✅");
  return m.reply(
    `✅Exito *${isEnable ? "MENGAKTIFKAN" : "MENONAKTIFKAN"}- ¡Los fusibles de RPG en este grupo!\n\n` +
    (isEnable
      ? `Ahora puede utilizar todos los comandos en el menú RPG.`
      : `No podremos utilizar el comando RPG más.`),
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
