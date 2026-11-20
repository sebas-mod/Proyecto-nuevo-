"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _daftarjs = require('./daftar.js');

const pluginConfig = {
  name: "bataldaftar",
  alias: ["cancelreg", "canceldaftar", "regcancel"],
  category: "user",
  description: "Desactivar el registro actual",
  usage: ".bataldaftar",
  example: ".bataldaftar",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
  skipRegistration: true,
};

async function handler(m) {
  const canceled = _daftarjs.clearRegistrationSession.call(void 0, m.sender);

  if (!canceled) {
    return m.reply(`❌No tiene una señal activa off session.`);
  }

  return m.reply(
    `✅El signo up fue cancelado.\n\n` +
      `Disfrute de los Starys de nuevo con:\`${m.prefix}daftar\``,
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
