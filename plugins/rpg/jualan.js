"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "jualan",
  alias: ["dagang", "pedagang"],
  category: "rpg",
  description: "Dagang asongan keliling",
  usage: ".jualan",
  example: ".jualan",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 180,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  
  const staminaCost = 18;
  user.rpg.stamina = _nullishCoalesce(user.rpg.stamina, () => ( 100));

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Kaki Lemes está casi siempre cerca!🥵\n\nUna venta de necesito *${staminaCost}La resistencia, la restante te contamina${user.rpg.stamina}*. Ngiyup bentar! 🏖️`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("🛒");
  await m.reply(`¡Copa de la taza de mantequilla!🍬\nTrading to passerby..🗣♪`);
  await new Promise(r => setTimeout(r, 3000));

  const gacha = Math.random();

  if (gacha < 0.2) {
    const rugi = Math.floor(Math.random() * 10000) + 5000;
    user.koin = Math.max(0, (user.koin || 0) - rugi);
    await m.react("🌧️");
    return m.reply(`* 91 * RACHEL* *93*¡¡Viene!🌧♪🥶\n\nNadie compra y vende sus fichas.\nVictoria Capital: * Rp${rugi.toLocaleString("id-ID")}*\n⚡ Stamina: -${staminaCost}\n\n¡Mañana debería mirar lo básico!☂♪`);
  } else if (gacha > 0.85) {
    const lakuKeras = Math.floor(Math.random() * 80000) + 40000;
    user.koin = (user.koin || 0) + lakuKeras;
    const expGain = Math.floor(lakuKeras / 20);
    await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expGain);
    await m.react("🤑");
    return m.reply(`¡Hay un BROMTON LEFT DIRORONG KUMAN!🚴‍♂♪✨\n\n¡Un montón de aves de él están volando y está bordeando todo isotónico e injertado!\n💵Omzet Sudden: * + Rp${lakuKeras.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\n¡Este es un mal momento para ser un imbécil!🎉`);
  }

  const earning = Math.floor(Math.random() * 25000) + 10000;
  user.koin = (user.koin || 0) + earning;
  const expGain = Math.floor(earning / 20);
  await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expGain);

  await m.react("✅");
  m.reply(`DAGANGAN LAKU STANDAR! 🛒✨\n\n💵 Omzet: *+Rp ${earning.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\n¡Me iré mañana de nuevo!🛍♪`);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
