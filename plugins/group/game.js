"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: "game",
  alias: ["togglegame"],
  category: "group",
  description: "Mengaktifkan atau menonaktifkan fitur game di grup",
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
      `🎮 *FITUR GAME GRUP*\n\n` +
        `Gunakan perintah ini untuk mengatur akses member ke fitur game.\n\n` +
        `• *${m.prefix}game on* - Member bisa main game\n` +
        `• *${m.prefix}game off* - Member tidak bisa main game\n\n` +
        `*Catatan:* Admin tetap bisa mengakses game meskipun dimatikan.`,
    );
  }

  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const group = db.getGroup(m.chat) || db.setGroup(m.chat);

  const isEnable = args === "on";

  if (group.game === isEnable) {
    return m.reply(`🎮 Fitur game sudah *${isEnable ? "AKTIF" : "NONAKTIF"}* di grup ini.`);
  }

  group.game = isEnable;
  db.setGroup(m.chat, group);

  await m.react("✅");
  return m.reply(
    `✅ Berhasil *${isEnable ? "MENGAKTIFKAN" : "MENONAKTIFKAN"}* fitur game di grup ini!\n\n` +
    (isEnable
      ? `Member sekarang bisa menggunakan semua perintah di menu game.`
      : `Member tidak akan bisa menggunakan perintah game lagi.`),
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
