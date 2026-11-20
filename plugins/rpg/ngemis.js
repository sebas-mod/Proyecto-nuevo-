"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "ngemis",
  alias: ["minta", "gembel"],
  category: "rpg",
  description: "\" Los lodos en la calle con un abrazo pueden ser negados la flor. \"",
  usage: ".ngemis",
  example: ".ngemis",
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
  
  const staminaCost = 5;
  user.rpg.stamina = _nullishCoalesce(user.rpg.stamina, () => ( 100));

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Cálmate para un baño!🥺\n\nButh @-@ nemis *${staminaCost}La resistencia, la restante te contamina${user.rpg.stamina}*. fuerte de no colgó de nuevo..💔`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("🤲");
  await m.reply(`Señor, señora, pida un poco más cerca.🥺\nEn este trimestre se espera un pase generoso.🚶‍♂♪`);
  await new Promise(r => setTimeout(r, 3000));

  const gacha = Math.random();

  if (gacha < 0.3) {
    const heal = Math.floor(Math.random() * 20) + 10;
    user.rpg.stamina = Math.min(100, user.rpg.stamina + heal);
    await m.react("🍱");
    return m.reply(`¡¡AlhAMDUILLAH arrancó ese Arroz de PAGE!🍱✨\n\n¡Ez caballero comunitario que te dio una bolsa de reretes de restante de arroz!\n💖Stalina crecifield: * +${heal}*\n💵- ¡Oh!\n\n¡Wow, mi corazón está lleno de diversión!🥰`);
  }

  if (gacha > 0.9) {
    await m.react("💢");
    return m.reply(`PRESIDENTE💢\n\n¡Hey, soy yo, eres tú!\nHuiste sin siquiera un centavo de miedo.\n⚡STAMINA:${staminaCost}\n\n¡Te voy a encontrar ahora!😭`);
  }

  const earning = Math.floor(Math.random() * 3000) + 500;
  user.koin = (user.koin || 0) + earning;
  const expGain = Math.floor(earning / 10);
  await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expGain);

  await m.react("✅");
  m.reply(`¡NGEMIS ha tenido HARL Este!🤲✨\n\n💵Recibimiento Retorno: * + Rp${earning.toLocaleString("id-ID")}*\n📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\n¡Gracias por las bendiciones de hoy, por la importante ocasión de pago!🙏`);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
