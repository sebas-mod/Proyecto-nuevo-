"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const config = {
  name: "sistemenergi",
  alias: ["sistemlimit", "energimode", "limitmode"],
  category: "owner",
  description: "Mengecek, menghidupkan, atau mematikan sistem energi secara global",
  usage: ".sistemenergi [on / off]",
  example: ".sistemenergi on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const mode = _optionalChain([m, 'access', _ => _.args, 'access', _2 => _2[0], 'optionalAccess', _3 => _3.toLowerCase, 'call', _4 => _4()]);
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  
  const currentStatus = db.setting("energi") !== undefined ? db.setting("energi") : true;
  
  if (!mode || (mode !== "on" && mode !== "off")) {
    return m.reply(
      `🎛️ *KONTROL SISTEM ENERGI*\n\n` +
      `Fitur kendali utama untuk menghidupkan atau mematikan seluruh sistem potongan energi bot secara global.\n\n` +
      `*STATUS SAAT INI:*\n` +
      `- Mode: *${currentStatus ? "AKTIF 🔋" : "NONAKTIF (UNLIMITED) ♾️"}*\n\n` +
      `*PENGGUNAAN:*\n` +
      `- *${m.prefix}sistemenergi on* — Menghidupkan potongan energi\n` +
      `- *${m.prefix}sistemenergi off* — Mematikan potongan energi (Unlimited mode)\n\n` +
      `*CONTOH PENGGUNAAN:*\n` +
      `- *${m.prefix}sistemenergi on*`
    );
  }

  await m.react("🕕");
  
  const isEnabled = mode === "on";
  
  db.setting("energi", isEnabled);
  await db.save();

  await m.react("✅");
  return m.reply(
    `✅ *STATUS SISTEM ENERGI BERHASIL DIUBAH*\n\n` +
    `Sistem Energi kini telah berhasil di-*${isEnabled ? "HIDUPKAN" : "MATIKAN"}*.\n\n` +
    `*Status Terkini:*\n` +
    `- Mode: *${isEnabled ? "AKTIF 🔋" : "NONAKTIF (UNLIMITED) ♾️"}*\n\n` +
    `_Semua perubahan sudah tersimpan dan akan segera diterapkan pada sistem bot._`
  );
}

exports.config = config; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
