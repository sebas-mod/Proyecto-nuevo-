"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "streamer",
  alias: ["live", "vtuber"],
  category: "rpg",
  description: "Juegos de transmisión en vivo daport gran donación pero la plataforma de disenso de riesgo!",
  usage: ".streamer",
  example: ".streamer",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 180,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, plugin }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  
  const staminaCost = 20;
  user.rpg.stamina = _nullishCoalesce(user.rpg.stamina, () => ( 100));

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡La mayoría del ojo está en la pantalla!😵\n\nAumentar el buth *${staminaCost}La resistencia, la restante te contamina${user.rpg.stamina}Duerme un poco.🛏♪`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("🎥");
  await m.reply(`Chicos Hola, bienvenidos a mi corriente en vivo!🎮\nMostremos algunas habilidades para jugar al al alza..😎`);
  await new Promise(r => setTimeout(r, 3500));

  const gacha = Math.random();

  if (gacha < 0.15) {
    const extraCooldown = 300;
    db.db.data.users[m.sender.split("@")[0]].lastStreamer = Date.now() + (extraCooldown * 1000);
    
    await m.react("🚫");
    return m.reply(`¿Qué?🚫😱\n\nTambién hay viaders que están reportando su cuenta por mucho tiempo!\nNo recibes ninguna donación y tienes un tramo de 5 @-@ minuto extra @-@ hora!\n\n⚡La resistencia permanece corta: -${staminaCost}\n\nSabar ya hermano, prueba ajuin banding..😔`);
  }

  const earning = Math.floor(Math.random() * 30000) + 10000;
  let saweranPaus = 0;

  if (gacha > 0.85) {
    saweranPaus = Math.floor(Math.random() * 100000) + 50000;
  }

  const totalEarning = earning + saweranPaus;
  user.koin = (user.koin || 0) + totalEarning;
  const expGain = Math.floor(totalEarning / 30);
  await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expGain);

  await m.react("✅");
  let txt = `¡Vive aflorando todo!🎥✨\n\n💵Ingresos de Iklan: * + Rp${earning.toLocaleString("id-ID")}*\n`;
  if (saweranPaus > 0) txt += `🐳 SAWERAN SULTAN: *+Rp ${saweranPaus.toLocaleString("id-ID")}*\n¡Vaya, hay un público sultán en el puz de la nager!🐋🔥\n`;
  txt += `📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\n¡Gracias por el aumento!💖`;
  
  m.reply(txt);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
