"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "nulis",
  alias: ["author", "wattpad"],
  category: "rpg",
  description: "Cerps o artículos para la realeza.",
  usage: ".nulis",
  example: ".nulis",
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
    return m.reply(`Fin de la línea, bloque de escritor de huelga!😵‍💫\n\nEl nombre escrito *${staminaCost}La resistencia, la restante te contamina${user.rpg.stamina}* ¡Encontrar inspiración primero!💡`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("📝");
  await m.reply(`Me gustaría poner una palabra para la palabra makna completa..✍♪\n¡Veamos si podemos encontrar un editor!📚`);
  await new Promise(r => setTimeout(r, 3000));

  const gacha = Math.random();

  if (gacha < 0.15) {
    await m.react("🚮");
    return m.reply(`¡Respondiente!🚮🥺\n\nLa razón de eso es que la historia es demasiado cliché y mercado.\n💵Royalties: 0\n⚡STAMINA:${staminaCost}\n\n¡No seas malo, escríbete otra vez!💪`);
  } else if (gacha > 0.9) {
    const viralRoyalti = Math.floor(Math.random() * 60000) + 30000;
    user.koin = (user.koin || 0) + viralRoyalti;
    const expGain = Math.floor(viralRoyalti / 20);
    await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expGain);
    
    await m.react("🌟");
    return m.reply(`Eres virgen.🌟📘\n\nMuchos de los bombarderos leen su trabajo, realeza belligerent!\n💵Realidades: * + Rp${viralRoyalti.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\n¡¡Otw está bajo el radar de la peelícula!🎬`);
  }

  const earning = Math.floor(Math.random() * 15000) + 5000;
  user.koin = (user.koin || 0) + earning;
  const expGain = Math.floor(earning / 20);
  await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expGain);

  await m.react("✅");
  m.reply(`¡El coche de la ciudad!📝✨\n\n💵Ingresos: *+Rp${earning.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\nSemangat berkarya para pujangga! 🎓`);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
