"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "nyapu",
  alias: ["cleaning", "bersih"],
  category: "rpg",
  description: "Dulce el camino, que sabe quién más cae!",
  usage: ".nyapu",
  example: ".nyapu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 120,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  
  const staminaCost = 10;
  user.rpg.stamina = _nullishCoalesce(user.rpg.stamina, () => ( 100));

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡La manija de bagel sigue adelante!😖\n\nNyapu necesito *${staminaCost}La resistencia, la restante te contamina${user.rpg.stamina}" Descanso en el árbol primero!🌳`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("🧹");
  await m.reply(`Srak sruk srak sruk... 🧹\nMembersihkan sampah-sampah masyarakat... 🗑️`);
  await new Promise(r => setTimeout(r, 3000));

  const gacha = Math.random();

  if (gacha < 0.1) {
    const goldFound = Math.floor(Math.random() * 50000) + 15000;
    user.koin = (user.koin || 0) + goldFound;
    await m.react("💍");
    return m.reply(`¡¡Paráfico!💍✨\n\nCuando usted está fuera de zanahoria, usted encuentra anillos de oro y langrene en la venta!\n💵Ingremos abatidos: * + Rp${goldFound.toLocaleString("id-ID")}*\n⚡ Stamina: -${staminaCost}\n\n¡Te vas a acostar con tu pelo!🥳`);
  }

  const earning = Math.floor(Math.random() * 8000) + 3000;
  user.koin = (user.koin || 0) + earning;
  const expGain = Math.floor(earning / 20);
  await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expGain);

  await m.react("✅");
  m.reply(`¡Alhameliah SETIES BERES - BERES!🧹✨\n\n💵Día paga: * + Rp${earning.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\n¡Bumi hace musgo y levadura!🌍`);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
