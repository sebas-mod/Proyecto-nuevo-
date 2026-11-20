"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "freelance",
  alias: ["desain", "koding"],
  category: "rpg",
  description: "Mengerjakan project online klien bule",
  usage: ".freelance",
  example: ".freelance",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 200,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  
  const staminaCost = 25;
  user.rpg.stamina = _nullishCoalesce(user.rpg.stamina, () => ( 100));

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡No pienses en errores!🤯\n\nNecesidades de freelance *${staminaCost}La resistencia, la restante te contamina${user.rpg.stamina}Primero Refreshin🌿`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("💻");
  await m.reply(`Escribiendo código / lawdo en laptop..⌨♪\n¡El cliente de Ojalá no pida revisión!🙏`);
  await new Promise(r => setTimeout(r, 4000));

  const gacha = Math.random();

  if (gacha < 0.2) {
    await m.react("📉");
    return m.reply(`KLIEN: ¡Eres un mal tipo!📉😡\n\nLos herejes se estaban haciendo tres días y tres noches,\n💵Baile: 0\n⚡La resistencia está pasando: -${staminaCost}\n\nApes mucho, la próxima vez que tengamos que empacar el DP!😭`);
  } else if (gacha > 0.85) {
    const dollarRate = 16000;
    const payment = Math.floor(Math.random() * 10) + 5;
    const totalRupiah = payment * dollarRate;
    
    user.koin = (user.koin || 0) + totalRupiah;
    const expGain = Math.floor(totalRupiah / 30);
    await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expGain);
    
    await m.react("💸");
    return m.reply(`¡Pake PAKE DOLLLAR por BULE!💸✨\n\nLa clientela extranjera es un gran éxito y un gran éxito.${payment}!\n💵 Bayaran: *+Rp ${totalRupiah.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\nUang jajan sultan menanti! 🤑`);
  }

  const earning = Math.floor(Math.random() * 40000) + 15000;
  user.koin = (user.koin || 0) + earning;
  const expGain = Math.floor(earning / 20);
  await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expGain);

  await m.react("✅");
  m.reply(`¡Proyecto SETTLE Y ACC!💻✨\n\n💵Locales: * + Rp${earning.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\n¡Lumayan por el capel de fuego!☕`);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
