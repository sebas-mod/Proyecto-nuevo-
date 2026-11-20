"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "parkir",
  alias: ["kangparkir", "markir"],
  category: "rpg",
  description: "Jadi tukang parkir minimarket, waspada satpol PP!",
  usage: ".parkir",
  example: ".parkir",
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
  
  const staminaCost = 12;
  user.rpg.stamina = _nullishCoalesce(user.rpg.stamina, () => ( 100));

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`Pie pegel es en su mayoría auto @-@ servir!😫\n\n# Sube al camino #${staminaCost}La resistencia, la restante te contamina${user.rpg.stamina}* Descansa en el correo!🏚♪`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("🅿️");
  await m.reply(`¡No te mueves, no te mueves, kiri!🏁\nEl comienzo del dukel de la croca en el minimercado..💰`);
  await new Promise(r => setTimeout(r, 3000));

  const gacha = Math.random();

  if (gacha < 0.1) {
    const denda = Math.floor(Math.random() * 5000) + 1000;
    user.koin = Math.max(0, (user.koin || 0) - denda);
    await m.react("🚨");
    return m.reply(`¡Hay una habitación secreta!🚓💨\n\nCorres con tu dinero y tu dinero por el desagüe.${denda.toLocaleString("id-ID")}*!\n⚡ Stamina: -${staminaCost}\n\n¡Apelos de hoy!😭`);
  } else if (gacha > 0.9) {
    const jackpot = Math.floor(Math.random() * 50000) + 20000;
    user.koin = (user.koin || 0) + jackpot;
    const expGain = Math.floor(jackpot / 20);
    await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expGain);
    await m.react("🤑");
    return m.reply(`Viene un coche.🏎♪✨\n\nCuando salgas, el parabrisas se cae y los 100.000 @-@s sultán de libra!\n💵Ingresos: *+Rp${jackpot.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\n¡Alhamdulilah rejeki son soleh!🙏`);
  }

  const earning = Math.floor(Math.random() * 8000) + 2000;
  user.koin = (user.koin || 0) + earning;
  const expGain = Math.floor(earning / 20);
  await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expGain);

  await m.react("✅");
  m.reply(`¿Qué?🅿♪✨\n\n💵Ingresos: *+Rp${earning.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\nRecel demi rech antiguo - antiguo es tan untakit!💪`);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
