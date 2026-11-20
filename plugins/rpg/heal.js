"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: "heal",
  alias: ["sembuh", "recover"],
  category: "rpg",
  description: "Reducir el sanador con un descanso libre pero viejo",
  usage: ".heal",
  example: ".heal",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 600,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  user.rpg.health = user.rpg.health || 100;
  user.rpg.maxHealth = user.rpg.maxHealth || 100;
  user.rpg.stamina = user.rpg.stamina || 100;
  user.rpg.maxStamina = user.rpg.maxStamina || 100;

  if (user.rpg.health >= user.rpg.maxHealth && user.rpg.stamina >= user.rpg.maxStamina) {
    return m.reply(`Eits, usted halstill mirando el arp @ - @ hermana!🏋♪✨\nNo hay descanso, sólo tiens que ir de viaje!🚀`);
  }

  await m.react("🛌");
  await m.reply("Tidur dulu ah... Zzz... 🛌💤");
  await new Promise((r) => setTimeout(r, 3000));

  const healthRecover = 30;
  const staminaRecover = 50;

  const oldHealth = user.rpg.health;
  const oldStamina = user.rpg.stamina;

  user.rpg.health = Math.min(user.rpg.health + healthRecover, user.rpg.maxHealth);
  user.rpg.stamina = Math.min(user.rpg.stamina + staminaRecover, user.rpg.maxStamina);

  let txt = `Hooammm... seger mucho abis duerme! 🥱🌞\n\n`;
  txt += `Status you 've been doing well:\n`;
  txt += `❤️ Health: ${oldHealth} 📈 *${user.rpg.health}*\n`;
  txt += `⚡ Stamina: ${oldStamina} 📈 *${user.rpg.stamina}*\n\n`;
  txt += `Pronto estarás fuera de la cama.\`. Tienda\`y escribe\`. uso de la poción\`Que sea fresco, instantáneo.🥤💖`;

  db.save();
  await m.reply(txt);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
