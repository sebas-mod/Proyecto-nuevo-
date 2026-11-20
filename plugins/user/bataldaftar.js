"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _daftarjs = require('./daftar.js');

const pluginConfig = {
  name: "bataldaftar",
  alias: ["cancelreg", "canceldaftar", "regcancel"],
  category: "user",
  description: "Batalkan sesi pendaftaran yang sedang aktif",
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
    return m.reply(`❌ Kamu tidak punya sesi pendaftaran aktif.`);
  }

  return m.reply(
    `✅ Sesi pendaftaran berhasil dibatalkan.\n\n` +
      `> Mulai lagi dengan: \`${m.prefix}daftar\``,
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
