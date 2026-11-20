"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "kurir",
  alias: ["antar", "paket"],
  category: "rpg",
  description: "No te preocupes por la gente, ¡eres un mal @-@ culo!",
  usage: ".kurir",
  example: ".kurir",
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
  
  const staminaCost = 15;
  user.rpg.stamina = _nullishCoalesce(user.rpg.stamina, () => ( 100));

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡La cintura está llena de cajas!😩\n\nKurir perouh${staminaCost}La resistencia, la restante te contamina${user.rpg.stamina}*. Ngurut antes vamos! 💆‍♂♪`);
  }

  user.rpg.stamina -= staminaCost;
  await m.react("📦");
  await m.reply(`¡Pakutt!📦\nBuscando una dirección similar en el mapa..🗺♪`);
  await new Promise(r => setTimeout(r, 3000));

  const gacha = Math.random();

  if (gacha < 0.2) {
    const extraStamina = 10;
    user.rpg.stamina = Math.max(0, user.rpg.stamina - extraStamina);
    
    const expGain = 500;
    await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expGain);
    
    await m.react("🐕");
    return m.reply(`¡Moody Mooing!🐕💨\n\n¡Corres por ahí salvando las maletas de la gente!\n⚡Resistencia advenida: -${extraStamina}\n📈Lámina de compensación de EXP: * +${expGain}*\n💵Ingresos: 0. ( Pakeet lanzado a la cerca )\n\nNamezngos - para el brazalete original!🥵`);
  }

  const items = ["Dokumen Rahasia", "Baju Online", "Cuidado de la esquilinata Bini People", "Panci Emak-emak"];
  const item = items[Math.floor(Math.random() * items.length)];
  const earning = Math.floor(Math.random() * 15000) + 5000;
  let tips = 0;

  if (gacha > 0.8) {
    tips = Math.floor(Math.random() * 10000) + 2000;
  }

  const totalEarning = earning + tips;
  user.koin = (user.koin || 0) + totalEarning;
  const expGain = Math.floor(totalEarning / 20);
  await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expGain);

  await m.react("✅");
  let txt = `ALHAMDULILLAH Paquete Hasta! 📦✨\n\nArticulo: *${item}*\n💵Envio: *+Rp${earning.toLocaleString("id-ID")}*\n`;
  if (tips > 0) txt += `🎁Añadir consejos: * + Rp${tips.toLocaleString("id-ID")}*\n`;
  txt += `📈 EXP: *+${expGain}*\n⚡ Stamina: -${staminaCost}\n\n¡Funciónó de inmediato!🚚💨`;
  m.reply(txt);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
