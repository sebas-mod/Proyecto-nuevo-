"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "nambalban",
  alias: ["tambal", "bengkel"],
  category: "rpg",
  description: "Buka jasa tambal ban, awas ban meledak!",
  usage: ".nambalban",
  example: ".nambalban",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 150,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  
  const staminaCost = 14;
  user.rpg.stamina = _nullishCoalesce(user.rpg.stamina, () => ( 100));

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`Pompa viento macet, manos llamativas!🤕\n\nNambal perouh${staminaCost}La resistencia, la restante te contamina${user.rpg.stamina}* Bebe es te first!🧊`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("🛠️");
  await m.reply(`Ssshh... comprobar el neumático plano con agua de jabón..🫧\n¡Mi reunión está llegando!📍`);
  await new Promise(r => setTimeout(r, 3000));

  const gacha = Math.random();

  if (gacha < 0.15) {
    const healthLoss = 15;
    user.rpg.health = Math.max(0, (_nullishCoalesce(user.rpg.health, () => ( 100))) - healthLoss);
    await m.react("💥");
    return m.reply(`¿Qué?💥😭\n\nTu mamá está entumecida y los neumáticos son volados delante de la muka!\n💔Teléfono: -${healthLoss}\n⚡ Stamina: -${staminaCost}\n💵Ingresos: 0\n\nEl artículo de Muka tiene neumático de acetato, cerveza de aquez!💀`);
  }

  const earning = Math.floor(Math.random() * 20000) + 10000;
  user.koin = (user.koin || 0) + earning;
  const expGain = Math.floor(earning / 25);
  await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expGain);

  await m.react("✅");
  m.reply(`Por favor, no seas tonto.🛠♪✨\n\n💵Ingresos: *+Rp${earning.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\n¡La ojalá en el camino se rompe otra vez!💨`);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
