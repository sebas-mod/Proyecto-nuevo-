"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: "weekly",
  alias: ["mingguan"],
  category: "rpg",
  description: "Reclamación semanal presente (más que lácteos)",
  usage: ".weekly",
  example: ".weekly",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

const WEEKLY_COOLDOWN = 7 * 24 * 60 * 60 * 1000;

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.cooldowns) user.cooldowns = {};
  const lastWeekly = user.cooldowns.weekly || 0;
  const now = Date.now();

  if (now - lastWeekly < WEEKLY_COOLDOWN) {
    const remaining = lastWeekly + WEEKLY_COOLDOWN - now;
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return m.reply(`¡Eres una chica grande en la clase semanal!😂\n\nEspera *${days}el${hours}¡Otra hora para el pago de la semana próxima!🗓♪💨`);
  }

  const expReward = Math.floor(Math.random() * 20000) + 10000;
  const moneyReward = Math.floor(Math.random() * 50000) + 30000;
  const crateReward = Math.floor(Math.random() * 3) + 1;

  if (!user.rpg) user.rpg = {};
  db.updateExp(m.sender, expReward);
  user.koin = (user.koin || 0) + moneyReward;

  if (!user.inventory) user.inventory = {};
  user.inventory.uncommon = (user.inventory.uncommon || 0) + crateReward;

  user.cooldowns.weekly = now;
  db.save();

  let txt = `DORRR! GAJIAN MINGGUAN CAIRRR! 🎉🎊🤑\n\n`;
  txt += `Gila, tu comando está semana es grande.\n`;
  txt += `📈 EXP: *+${expReward.toLocaleString("id-ID")}*\n`;
  txt += `💰Monedas: *+Rp${moneyReward.toLocaleString("id-ID")}*\n`;
  txt += `🛍️ Uncommon Crate: *+${crateReward}x*\n\n`;
  txt += `El dinero no se salva\`.banco\`!🏦💖`;

  await m.reply(txt);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
